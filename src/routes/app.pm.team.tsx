import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { team } from "@/lib/pm-mock";
import { Search, UserPlus, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pm/team")({ component: TeamPage });

function TeamPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = team.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.role.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Capacity, allocation and contact details."
        breadcrumbs={[{ label: "Projects" }, { label: "Team" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><UserPlus className="h-4 w-4 mr-2" />Invite member</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite team member</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input /></div>
                <div><Label>Email</Label><Input type="email" /></div>
                <div><Label>Role</Label><Input placeholder="e.g. Engineer" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Invitation sent"); }}>Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search team..." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => (
          <Card key={m.id} className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold">{m.avatar}</div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{m.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Workload</span><span>{m.load}/{m.capacity}h</span></div>
                <Progress value={(m.load/m.capacity)*100} className="h-1.5" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Briefcase className="h-3 w-3" />{m.projects} active projects</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
