'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { InterviewResponses, QUESTIONS } from '@/lib/interview'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'interview_responses'

export default function InterviewQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const step = parseInt(params.step as string) - 1  // 0-based
  const question = QUESTIONS[step]

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    checkAuth()
  }, [router])

  const defaultResponses: InterviewResponses = {
    purpose: '',
    sponsorship: { willing: false },
    resources: '',
    leadership: { willing: false },
    deliverables: '',
    plan: '',
    change: '',
    investment: '',
    benefits: '',
  }

  const [responses, setResponses] = useState<InterviewResponses>(defaultResponses)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setResponses({ ...defaultResponses, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load interview responses from localStorage')
    }
  }, [])

  const updateResponse = (key: keyof InterviewResponses, value: any) => {
    const newResponses = { ...responses, [key]: value }
    setResponses(newResponses)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newResponses))
    } catch (error) {
      console.warn('Failed to save interview responses to localStorage')
    }
  }

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      router.push(`/interview/questions/${step + 2}`)
    } else {
      router.push('/interview/review')
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      router.push(`/interview/questions/${step}`)
    }
  }

  const progress = ((step + 1) / QUESTIONS.length) * 100

  if (!question) {
    return <div>Invalid question step</div>
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {step + 1} of {QUESTIONS.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === 'text' && (
              <Textarea
                placeholder="Your answer..."
                value={responses[question.key] as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateResponse(question.key, e.target.value)}
                rows={4}
              />
            )}

            {question.type === 'choice' && (
              <>
                <RadioGroup
                  value={(responses[question.key] as any)?.willing ? 'yes' : 'no'}
                  onValueChange={(value) => {
                    const willing = value === 'yes'
                    const current = responses[question.key] as any
                    updateResponse(question.key, { ...current, willing })
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>

                {(responses[question.key] as any)?.willing && (
                  <>
                    {question.choices && (
                      <RadioGroup
                        value={(responses[question.key] as any)?.type || ''}
                        onValueChange={(value) => {
                          const current = responses[question.key] as any
                          updateResponse(question.key, { ...current, type: value })
                        }}
                      >
                        {question.choices.map((choice) => (
                          <div key={choice} className="flex items-center space-x-2">
                            <RadioGroupItem value={choice} id={choice} />
                            <Label htmlFor={choice}>{choice}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    <Label htmlFor="how">{question.subQuestion}</Label>
                    <Textarea
                      id="how"
                      placeholder="Details..."
                      value={(responses[question.key] as any)?.how || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const current = responses[question.key] as any
                        updateResponse(question.key, { ...current, how: e.target.value })
                      }}
                      rows={3}
                    />
                  </>
                )}
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {step === QUESTIONS.length - 1 ? 'Review' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}