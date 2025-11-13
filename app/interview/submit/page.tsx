'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewResponses, QUESTIONS } from '@/lib/interview'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'interview_responses'
const DEFAULT_GROUP_ID = "550e8400-e29b-41d4-a716-446655440000";

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
    } catch {
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

      /* console.log('Submitting interview for user:', user.id, 'group:', DEFAULT_GROUP_ID, 'responses keys:', Object.keys(responses)) */

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
          group_id: DEFAULT_GROUP_ID,
          responses: responses,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })

      if (interviewError) {
        console.error('Interview insert error:', JSON.stringify(interviewError, null, 2))
        throw interviewError
      }

      /* console.log('Interview inserted successfully') */

      // Check if group has existing members
      const { data: existingMembers } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', DEFAULT_GROUP_ID)
        .limit(1)

      const role = existingMembers && existingMembers.length > 0 ? 'member' : 'admin'

      const { error: memberError } = await supabase
        .from('group_members')
        .upsert({
          group_id: DEFAULT_GROUP_ID,
          user_id: user.id,
          role: role
        })

      if (memberError) {
        console.error('Member upsert error:', JSON.stringify(memberError, null, 2))
        throw new Error('Failed to join group. Please try again.')
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

  const handleEdit = () => {
    router.push('/interview/edit')
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
             You&apos;re about to submit your interview responses. This will add your input to the group dashboard.
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
             <Button variant="outline" onClick={handleEdit} disabled={loading}>
               Edit Answers
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
