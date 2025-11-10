'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewResponses, QUESTIONS } from '@/lib/interview'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'interview_responses'

export default function InterviewSubmitPage() {
  const router = useRouter()
  const supabase = createClient()
  const [responses, setResponses] = useState<InterviewResponses | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setResponses({ ...defaultResponses, ...parsed })
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.warn('Failed to load responses')
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async () => {
    if (!responses) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const groupId = localStorage.getItem('selected_group')
      if (!groupId) throw new Error('No group selected')

      console.log('Submitting interview for user:', user.id, 'group:', groupId, 'responses keys:', Object.keys(responses))

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email || '',
      })
      if (profileError) {
        console.error('Profile upsert error:', profileError)
        return
      }

      const { error: interviewError } = await supabase
        .from('interview_responses')
        .upsert({
          user_id: user.id,
          group_id: groupId,
          responses: responses,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })

      if (interviewError) {
        console.error('Interview insert error:', JSON.stringify(interviewError, null, 2))
        throw interviewError
      }

      console.log('Interview inserted successfully')

      const { error: memberError } = await supabase
        .from('group_members')
        .upsert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        })

      if (memberError) {
        console.error('Member upsert error:', JSON.stringify(memberError, null, 2))
      }

      localStorage.removeItem(STORAGE_KEY)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to submit interview:', JSON.stringify(error, null, 2))
      alert('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/interview/review')
  }

  if (!responses) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Confirm Submission</CardTitle>
          <CardDescription>
            You're about to submit your interview responses. This will add your input to the group dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Summary of Responses:</h3>
            {QUESTIONS.map((q, index) => (
              <div key={q.key} className="text-sm">
                <strong>{index + 1}. {q.question}</strong>
                <div className="ml-4 mt-1 text-muted-foreground">
                  {q.type === 'text' && (responses[q.key] as string)}
                  {q.type === 'choice' && (
                    <>
                      {(responses[q.key] as any)?.willing ? 'Yes' : 'No'}
                      {(responses[q.key] as any)?.willing && q.choices && (
                        <> - {(responses[q.key] as any)?.type}</>
                      )}
                      {(responses[q.key] as any)?.how && (
                        <> - {(responses[q.key] as any)?.how}</>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              Back to Review
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}