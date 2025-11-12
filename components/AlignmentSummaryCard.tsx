'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlignmentSummary } from "@/lib/openai"
import { generateAlignmentSummary } from '@/lib/actions'

interface Props {
  summary: AlignmentSummary | null
  interviews: any[]
  groupId: string
  interviewCount: number
  unprocessedCount: number
}

function SummaryNote({ title, content }: { title: string; content?: string | null }) {
  const resolvedContent = content?.trim() ? content : "Awaiting insights."

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="note-card min-h-[104px] flex items-start">
        <p className="whitespace-pre-line leading-relaxed">{resolvedContent}</p>
      </div>
    </div>
  )
}

export default function AlignmentSummaryCard({ summary, interviews, groupId, interviewCount, unprocessedCount }: Props) {
  const [generating, setGenerating] = useState(false)
  const [localSummary, setLocalSummary] = useState<AlignmentSummary | null>(summary)
  const [localUnprocessedCount, setLocalUnprocessedCount] = useState(unprocessedCount)

  const hasSummary = !!localSummary

  const summaryDescription = hasSummary
    ? `AI-synthesized insights from ${interviewCount} contributors`
    : "No analysis generated yet."

  const canGenerate = localUnprocessedCount > 0
  const summaryBannerText = canGenerate
    ? hasSummary
      ? `${localUnprocessedCount} new response${localUnprocessedCount > 1 ? 's' : ''} available. Click 'Update Analysis' to include them.`
      : "Click 'Generate Analysis' to synthesize insights from contributors."
    : null

  const emptySummary: AlignmentSummary = {
    purpose: "",
    sponsorship: "",
    resources: "",
    leadership: "",
    deliverables: "",
    plan: "",
    change: "",
    investment: "",
    benefits: "",
    overallAlignment: "",
  }

  const displaySummary = localSummary ?? emptySummary

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const newSummary = await generateAlignmentSummary(interviews, groupId)
      setLocalSummary(newSummary)
      setLocalUnprocessedCount(0) // All processed
    } catch (error) {
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader className="border-b py-6">
        <div className="flex items-center justify-between align-middle">
          <CardTitle className="text-xl font-semibold tracking-wide">Group Alignment Summary</CardTitle>
          {canGenerate && (
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : hasSummary ? 'Update Analysis' : 'Generate Analysis'}
            </Button>
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {summaryDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {summaryBannerText && (
          <div className="border-b bg-blue-50 dark:bg-blue-900/20 px-6 py-4 text-sm font-medium text-blue-800 dark:text-blue-200">
            {summaryBannerText}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b bg-muted text-center text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <div className="p-4">Foundation</div>
          <div className="p-4">People</div>
          <div className="p-4">Creation</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b">
          <div className="space-y-10 p-6">
            <SummaryNote title="Purpose" content={displaySummary.purpose} />
          </div>
          <div className="space-y-10 p-6">
            <SummaryNote title="Sponsorship" content={displaySummary.sponsorship} />
            <SummaryNote title="Stakeholders" content={displaySummary.leadership} />
            <SummaryNote title="Resources" content={displaySummary.resources} />
          </div>
          <div className="space-y-10 p-6">
            <SummaryNote title="Deliverables" content={displaySummary.deliverables} />
            <SummaryNote title="Plan" content={displaySummary.plan} />
            <SummaryNote title="Change" content={displaySummary.change} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b">
          <div className="p-6">
            <SummaryNote title="Investment" content={displaySummary.investment} />
          </div>
          <div className="p-6">
            <SummaryNote title="Benefits" content={displaySummary.benefits} />
          </div>
        </div>

        <div className="p-6">
          <SummaryNote title="Overall Alignment" content={displaySummary.overallAlignment} />
        </div>
      </CardContent>
    </Card>
  )
}