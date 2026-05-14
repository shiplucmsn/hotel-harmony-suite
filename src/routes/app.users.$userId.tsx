import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/activity-timeline";
import { Edit, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";

export const Route = createFileRoute("/app/users/$userId")({ component: UserDetail });

function UserDetail() {
  const { userId } = useParams({ from: "/app/users/$userId" });
  const user = mockUsers.find((u) => u.id === userId) ?? mockUsers[0];
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        breadcrumbs={[{ label: "Administration" }, { label: "Users", to: "/app/users" }, { label: user.name }]}
        actions={<>
          <Button asChild variant="outline" size="sm"><Link to="/app/users">Back</Link></Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Edit className="mr-2 h-4 w-4" />Edit</Button>
        </>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24"><AvatarFallback className="gradient-primary text-primary-foreground text-2xl">{initials}</AvatarFallback></Avatar>
            <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-2" variant="outline">{user.role}</Badge>
            <div className="mt-6 w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{user.email}</div>
              <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />+1 (555) 123-4567</div>
              <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />Berlin, Germany</div>
              <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />Joined Mar 2024</div>
              <div className="flex items-center gap-3 text-sm"><Shield className="h-4 w-4 text-muted-foreground" />2FA enabled</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Tabs defaultValue="overview">
              <TabsList className="m-4 mb-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { l: "Department", v: user.department },
                    { l: "Manager", v: "Marcus Chen" },
                    { l: "Status", v: user.status },
                    { l: "Last active", v: user.lastActive },
                  ].map((i) => (
                    <div key={i.l} className="rounded-lg border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.l}</p>
                      <p className="mt-1 text-sm font-medium capitalize">{i.v}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="activity" className="p-6"><ActivityTimeline /></TabsContent>
              <TabsContent value="permissions" className="p-6">
                <CardHeader className="p-0 mb-4"><CardTitle className="text-base">Effective permissions</CardTitle><CardDescription>Inherited from {user.role} role.</CardDescription></CardHeader>
                <div className="grid gap-2 sm:grid-cols-2">
                  {["View dashboard","Manage contacts","Create deals","View invoices","Export data","Manage team"].map(p => (
                    <div key={p} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                      <Shield className="h-3.5 w-3.5 text-success" />{p}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
