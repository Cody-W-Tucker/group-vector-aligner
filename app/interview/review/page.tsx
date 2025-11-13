'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewResponses, QUESTIONS } from '@/lib/interview'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'interview_responses'

export default function InterviewReviewPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/interview/submit')
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



  const isComplete = () => {
    return QUESTIONS.every(q => {
      const value = responses[q.key]
      if (q.type === 'text') {
        return (value as string).trim().length > 0
      }
      if (q.type === 'choice') {
        const choiceValue = value as any
        if (!choiceValue.willing) return true  // No is fine
        if (q.choices) return choiceValue.type && choiceValue.how?.trim()
        return choiceValue.how?.trim()
      }
      return false
    })
  }

  const handleSubmit = () => {
    if (isComplete()) {
      router.push('/interview/submit')
    }
  }

  const handleEdit = () => {
    router.push('/interview/edit')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Review Your Answers</h1>
          <p className="text-muted-foreground">
            Review your answers below. Click Edit to make changes.
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
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {responses[q.key] as string || 'No answer provided'}
                  </div>
                )}

                {q.type === 'choice' && (
                  <div className="text-sm text-muted-foreground">
                    {(responses[q.key] as any)?.willing ? 'Yes' : 'No'}
                    {(responses[q.key] as any)?.willing && q.choices && (
                      <> - {(responses[q.key] as any)?.type}</>
                    )}
                    {(responses[q.key] as any)?.how && (
                      <div className="mt-2 whitespace-pre-line">
                        {q.subQuestion}: {(responses[q.key] as any)?.how}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleEdit}>
            Edit Answers
          </Button>
          <Button onClick={handleSubmit} disabled={!isComplete()}>
            Submit Interview
          </Button>
        </div>
      </div>
    </div>
  )
}