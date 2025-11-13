'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InterviewResponses, QUESTIONS } from '@/lib/interview'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'interview_responses'

export default function InterviewEditPage() {
  const router = useRouter()

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

  const handleBack = () => {
    router.push('/interview/review')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Your Responses</h1>
          <p className="text-muted-foreground">
            Make changes to your answers below.
          </p>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, index) => (
            <Card key={q.key}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {q.type === 'text' && (
                  <Textarea
                    placeholder="Your answer..."
                    value={responses[q.key] as string}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateResponse(q.key, e.target.value)
                    }
                    rows={3}
                  />
                )}

                {q.type === 'choice' && (
                  <>
                    <RadioGroup
                      value={(responses[q.key] as any)?.willing ? 'yes' : 'no'}
                      onValueChange={(value) => {
                        const willing = value === 'yes'
                        const current = responses[q.key] as any
                        updateResponse(q.key, { ...current, willing })
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={`yes-${q.key}`} id={`yes-${q.key}`} />
                        <Label htmlFor={`yes-${q.key}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={`no-${q.key}`} id={`no-${q.key}`} />
                        <Label htmlFor={`no-${q.key}`}>No</Label>
                      </div>
                    </RadioGroup>

                    {(responses[q.key] as any)?.willing && (
                      <>
                        {q.choices && (
                          <RadioGroup
                            value={(responses[q.key] as any)?.type || ''}
                            onValueChange={(value) => {
                              const current = responses[q.key] as any
                              updateResponse(q.key, { ...current, type: value })
                            }}
                          >
                            {q.choices.map((choice) => (
                              <div key={choice} className="flex items-center space-x-2">
                                <RadioGroupItem value={choice} id={`${q.key}-${choice}`} />
                                <Label htmlFor={`${q.key}-${choice}`}>{choice}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        <Label htmlFor={`${q.key}-how`}>{q.subQuestion}</Label>
                        <Textarea
                          id={`${q.key}-how`}
                          placeholder="Details..."
                          value={(responses[q.key] as any)?.how || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const current = responses[q.key] as any
                            updateResponse(q.key, { ...current, how: e.target.value })
                          }}
                          rows={2}
                        />
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-start mt-8">
          <Button variant="outline" onClick={handleBack}>
            Back to Review
          </Button>
        </div>
      </div>
    </div>
  )
}