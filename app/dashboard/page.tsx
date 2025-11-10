import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  description: string | null;
  isMember: boolean;
  hasCompletedInterview: boolean;
  totalCompleted: number;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, description')
    .order('created_at', { ascending: false });

  const groupsWithStatus = await Promise.all(
    (groups || []).map(async (group) => {
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', group.id)
        .eq('user_id', data.claims.sub)
        .single();

      const { data: userInterview } = await supabase
        .from('interview_responses')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', data.claims.sub)
        .eq('status', 'completed')
        .single();

      const { count: totalCompleted } = await supabase
        .from('interview_responses')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
        .eq('status', 'completed');

      return {
        ...group,
        isMember: !!membership,
        hasCompletedInterview: !!userInterview,
        totalCompleted: totalCompleted || 0,
      };
    })
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Group Alignment Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Choose a group to view its alignment dashboard or contribute your insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groupsWithStatus.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.totalCompleted > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600 font-medium">
                      📊 {group.totalCompleted} contributor{group.totalCompleted !== 1 ? 's' : ''}
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/${group.id}`}>
                        View Group Dashboard
                      </Link>
                    </Button>
                    {(!group.isMember || !group.hasCompletedInterview) && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/interview?group=${group.id}`}>
                          {group.isMember ? 'Update Your Contribution' : 'Join & Contribute'}
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No contributions yet. Be the first to align this group!
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/interview?group=${group.id}`}>
                        Start Alignment
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groupsWithStatus.length === 0 && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>No Groups Yet</CardTitle>
            <CardDescription>
              Groups will appear here once created. Check back later or create one through the interview process.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}