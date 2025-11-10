'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'

export default function InterviewStartPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const groupId = searchParams.get('group')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    if (!groupId) {
      router.push('/dashboard')
      return
    }
    localStorage.setItem('selected_group', groupId)
  }, [groupId, router])

  const handleStart = () => {
    router.push('/interview/questions/1')
  }

  if (!groupId) {
    return <div>Redirecting to dashboard...</div>
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Group Alignment Interview</CardTitle>
          <CardDescription>
            Contribute your insights to align this group.
            This quick 9-question interview will take about 5-10 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStart} className="w-full">
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}