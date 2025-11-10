import { Suspense } from 'react'
import InterviewStartPageClient from './client'

export default function InterviewStartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewStartPageClient />
    </Suspense>
  )
}