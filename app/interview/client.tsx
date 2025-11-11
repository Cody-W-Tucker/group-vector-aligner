'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'

const DEFAULT_GROUP_ID = "default-group";

export default function InterviewStartPageClient() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    localStorage.setItem('selected_group', DEFAULT_GROUP_ID)
  }, [])

  const handleStart = () => {
    router.push('/interview/questions/1')
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