import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Info, Bell } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/app/notifications")({ component: NotificationsPage });

const typeMap = {
  success: { icon: CheckCircle2, cls: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, cls: "text-warning bg-warning/10" },
  info: { icon: Info, cls: "text-info bg-info/10" },
};

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of what matters."
        breadcrumbs={[{ label: "Account" }, { label: "Notifications" }]}
        actions={<Button variant="outline" size="sm">Mark all as read</Button>}
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All <Badge variant="secondary" className="ml-2">{notifications.length}</Badge></TabsTrigger>
          <TabsTrigger value="unread">Unread <Badge variant="secondary" className="ml-2">{notifications.filter(n => n.unread).length}</Badge></TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y">
              {notifications.map((n) => {
                const m = typeMap[n.type as keyof typeof typeMap];
                const Icon = m.icon;
                return (
                  <div key={n.id} className={cn("flex gap-4 p-4 hover:bg-muted/40 transition-colors", n.unread && "bg-primary/[0.03]")}>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", m.cls)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{n.title}</p>
                        {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.time} ago</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Showing unread only.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          <Card><CardContent className="p-6"><EmptyState icon={Bell} title="No archived notifications" description="Archived notifications will appear here." /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
