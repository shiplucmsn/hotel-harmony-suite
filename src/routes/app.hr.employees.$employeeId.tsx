import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ActivityTimeline } from "@/components/activity-timeline";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Briefcase, Calendar, Wallet, FileText, Download } from "lucide-react";
import { employees } from "@/lib/hr-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hr/employees/$employeeId")({
  component: EmployeeDetailPage,
  loader: ({ params }) => {
    const e = employees.find((x) => x.id === params.employeeId);
    if (!e) throw notFound();
    return e;
  },
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-sm">Employee not found.</div>,
});

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  "on-leave": "bg-warning/15 text-warning border-warning/20",
  probation: "bg-info/15 text-info border-info/20",
  terminated: "bg-destructive/15 text-destructive border-destructive/20",
};

function EmployeeDetailPage() {
  const e = Route.useLoaderData();
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const initials = e.name.split(" ").map((w: string) => w[0]).slice(0,2).join("");

  return (
    <div className="space-y-6">
      <PageHeader
        title={e.name}
        description={`${e.designation} · ${e.department}`}
        breadcrumbs={[{ label: "HR" }, { label: "Employees", to: "/app/hr/employees" }, { label: e.name }]}
        actions={<>
          <Button asChild variant="outline" size="sm"><Link to="/app/hr/employees"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDelOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
        </>}
      />

      <Card className="overflow-hidden">
        <div className="h-28 gradient-primary" />
        <CardContent className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-card shadow-elegant">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-xl font-semibold">{e.name}</h2>
              <p className="text-sm text-muted-foreground">{e.code} · {e.designation}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{e.type}</Badge>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", statusStyles[e.status])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />{e.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            <Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4" />Message</Button>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Resume</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{e.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{e.phone}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{e.location}</div>
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />Reports to {e.manager}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {e.joinDate}</div>
            <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-muted-foreground" />${e.salary.toLocaleString()} / year</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-4 max-w-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leaves">Leaves</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="overview">
                <ActivityTimeline />
              </TabsContent>
              <TabsContent value="attendance">
                <p className="text-sm text-muted-foreground">21 working days · 20 present · 1 leave · avg. 8h 42m / day this month.</p>
              </TabsContent>
              <TabsContent value="leaves">
                <p className="text-sm text-muted-foreground">12 of 24 annual leaves used · 3 sick leaves remaining.</p>
              </TabsContent>
              <TabsContent value="docs">
                <ul className="divide-y rounded-lg border">
                  {["Contract.pdf","Passport.pdf","NDA.pdf"].map(f => (
                    <li key={f} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{f}</span>
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Update profile details for {e.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Name</Label><Input defaultValue={e.name} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Email</Label><Input defaultValue={e.email} /></div>
              <div className="grid gap-2"><Label>Phone</Label><Input defaultValue={e.phone} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Department</Label><Input defaultValue={e.department} /></div>
              <div className="grid gap-2"><Label>Designation</Label><Input defaultValue={e.designation} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setEditOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={delOpen} onOpenChange={setDelOpen} title={`Delete ${e.name}?`} description="This action cannot be undone." />
    </div>
  );
}
