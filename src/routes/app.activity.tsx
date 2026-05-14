import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTimeline } from "@/components/activity-timeline";

export const Route = createFileRoute("/app/activity")({ component: ActivityPage });

function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Activity" description="A complete log of actions across your workspace." breadcrumbs={[{ label: "Workspace" }, { label: "Activity" }]} />
      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent><ActivityTimeline /></CardContent>
      </Card>
    </div>
  );
}
