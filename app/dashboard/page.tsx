import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AlignmentSummaryCard from "@/components/AlignmentSummaryCard";

const DEFAULT_GROUP_ID = "550e8400-e29b-41d4-a716-446655440000";

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

  // Load latest summary from dashboard_summaries
  const { data: latestSummaryRow } = await supabase
    .from('dashboard_summaries')
    .select('summary_content')
    .eq('group_id', DEFAULT_GROUP_ID)
    .eq('section', 'full_summary')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  	let alignmentSummary = null;
  	if (latestSummaryRow?.summary_content) {
    	try {
      	alignmentSummary = JSON.parse(latestSummaryRow.summary_content);
    	} catch (error) {
      	console.error('Error parsing summary_content:', error);
    	}
  	}

  	let query = supabase
  		.from('interview_responses')
  		.select('id, user_id, responses, completed_at, status')
  		.eq('group_id', DEFAULT_GROUP_ID);
  	if (!alignmentSummary) {
  		query = query.in('status', ['completed', 'reconciled']);
  	} else {
  		query = query.eq('status', 'completed');
  	}
  	const { data: interviews } = await query;

  	const unprocessedCount = interviews?.filter(i => i.status === 'completed').length || 0;

 	const { data: allResponded } = await supabase
 		.from('interview_responses')
 		.select('id')
 		.eq('group_id', DEFAULT_GROUP_ID)
 		.in('status', ['completed', 'reconciled']);

 	const interviewCount = allResponded?.length || 0;

	return (
		<div className="flex-1 w-full flex flex-col gap-12">

			<div className="grid gap-6 md:grid-cols-2 items-start">
				<div className="flex flex-col">
					<h1 className="text-3xl font-bold">{group?.name || "Vector Aligner"}</h1>
					{group?.description && (
						<p className="text-muted-foreground mt-2">{group.description}</p>
					)}
				</div>
				<div className="flex flex-col items-end gap-2">
					<Badge variant="secondary" className="text-sm">{interviewCount} Contributors</Badge>
					{isMember ? (
						<Badge variant="outline" className="text-sm">Member: {membership.role}</Badge>
					) : (
						<Button asChild className="max-w-sm">
							<Link href={`/interview`}>
								Join & Contribute
							</Link>
						</Button>
					)}
				</div>
			</div>

          <AlignmentSummaryCard
            summary={alignmentSummary}
            interviews={interviews || []}
            groupId={DEFAULT_GROUP_ID}
            interviewCount={interviewCount}
            unprocessedCount={unprocessedCount}
          />
		</div>
	);
}
