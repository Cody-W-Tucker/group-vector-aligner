import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDashboardPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', params.groupId)
    .eq('user_id', data.claims.sub)
    .single();

  const isMember = !!membership;

  const { data: group } = await supabase
    .from('groups')
    .select('name, description')
    .eq('id', params.groupId)
    .single();

  const { data: interviews } = await supabase
    .from('interview_responses')
    .select('id, user_id')
    .eq('group_id', params.groupId)
    .eq('status', 'completed');

  const interviewCount = interviews?.length || 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">{group?.name} Dashboard</h1>
        {group?.description && (
          <p className="text-muted-foreground mt-2">{group.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">Group ID: {params.groupId}</p>
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
                <Link href={`/interview?group=${params.groupId}`}>
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

      {interviewCount >= 3 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Group Alignment Summary</CardTitle>
            <CardDescription>
              AI-synthesized insights from all contributors (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              OpenAI integration will generate cohesive summaries of Purpose, Sponsorship, Resources, etc.
              from all interview responses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}