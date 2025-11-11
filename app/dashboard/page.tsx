import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { generateGroupAlignmentSummary, AlignmentSummary } from "@/lib/openai";

const DEFAULT_GROUP_ID = "default-group";

interface SummaryNoteProps {
  title: string;
  content?: string | null;
}

function SummaryNote({ title, content }: SummaryNoteProps) {
  const resolvedContent = content?.trim() ? content : "Awaiting insights.";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="note-card min-h-[104px] flex items-start">
        <p className="whitespace-pre-line leading-relaxed">{resolvedContent}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', DEFAULT_GROUP_ID)
    .eq('user_id', data.claims.sub)
    .single();

  const isMember = !!membership;

  const { data: group } = await supabase
    .from('groups')
    .select('name, description')
    .eq('id', DEFAULT_GROUP_ID)
    .single();

  const { data: interviews } = await supabase
    .from('interview_responses')
    .select('id, user_id, responses, completed_at')
    .eq('group_id', DEFAULT_GROUP_ID)
    .eq('status', 'completed');

  const interviewCount = interviews?.length || 0;

  let alignmentSummary: AlignmentSummary | null = null;

  if (interviewCount >= 3) {
    try {
      alignmentSummary = await generateGroupAlignmentSummary(interviews || []);
    } catch (error) {
      console.error('Failed to generate alignment summary:', error);
      // Continue without summary if OpenAI fails
    }
  }

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
  };

  const summary = alignmentSummary ?? emptySummary;
  const hasSummary = Boolean(alignmentSummary);

  const summaryDescription = hasSummary
    ? `AI-synthesized insights from ${interviewCount} contributors`
    : interviewCount >= 3
      ? "Generating AI insights from recent contributors..."
      : "Need at least 3 contributors to generate AI insights.";

  const summaryBannerText = hasSummary
    ? null
    : interviewCount >= 3
      ? "Synthesizing the latest responses..."
      : "Complete at least three interviews to unlock AI-generated insights.";

  return (
    <div className="flex-1 w-full flex flex-col gap-12">

      <div className="w-full">
        <h1 className="text-3xl font-bold">{group?.name || "Group Alignment Dashboard"}</h1>
        {group?.description && (
          <p className="text-muted-foreground mt-2">{group.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">Group ID: {DEFAULT_GROUP_ID}</p>
        <p className="text-xs text-muted-foreground">Interviews found: {interviewCount}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contributors</CardTitle>
            <CardDescription>Team members who have shared their insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{interviewCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alignment Status</CardTitle>
            <CardDescription>Current synthesis progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {interviewCount >= 3 ? 'Ready for synthesis' : 'Gathering insights'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Status</CardTitle>
            <CardDescription>Your relationship with this group</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {isMember ? `Member (${membership.role})` : 'Not a member yet'}
            </p>
            {!isMember && (
              <Button asChild className="mt-2">
                <Link href={`/interview`}>
                  Join & Contribute
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {interviewCount < 1 && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Need More Contributors</CardTitle>
            <CardDescription>
              This dashboard will show synthesized alignment once more team members contribute their insights.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

       <Card className="w-full shadow-lg">
         <CardHeader className="border-b py-6">
           <CardTitle className="text-xl font-semibold tracking-wide">Group Alignment Summary</CardTitle>
           <CardDescription className="text-sm text-muted-foreground">
             {summaryDescription}
           </CardDescription>
         </CardHeader>
         <CardContent className="p-0">
           {summaryBannerText && (
             <div className="border-b bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 text-sm font-medium text-yellow-800 dark:text-yellow-200">
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
               <SummaryNote title="Purpose" content={summary.purpose} />
             </div>
             <div className="space-y-10 p-6">
               <SummaryNote title="Sponsorship" content={summary.sponsorship} />
               <SummaryNote title="Stakeholders" content={summary.leadership} />
               <SummaryNote title="Resources" content={summary.resources} />
             </div>
             <div className="space-y-10 p-6">
               <SummaryNote title="Deliverables" content={summary.deliverables} />
               <SummaryNote title="Plan" content={summary.plan} />
               <SummaryNote title="Change" content={summary.change} />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b">
             <div className="p-6">
               <SummaryNote title="Investment" content={summary.investment} />
             </div>
             <div className="p-6">
               <SummaryNote title="Benefits" content={summary.benefits} />
             </div>
           </div>

           <div className="p-6">
             <SummaryNote title="Overall Alignment" content={summary.overallAlignment} />
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
