import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/stat-card";
import { timeLogs, team } from "@/lib/pm-mock";
import { Clock, Play, Pause, Plus, Timer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pm/time-tracking")({ component: TimeTrackingPage });

function TimeTrackingPage() {
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const total = timeLogs.reduce((s, l) => s + l.hours, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Log work hours against tasks and projects."
        breadcrumbs={[{ label: "Projects" }, { label: "Time" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Log time</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Log time entry</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div><Label>Project</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="p1">Aurora Mobile App v2</SelectItem><SelectItem value="p2">Helix ERP Migration</SelectItem></SelectContent>
                  </Select></div>
                <div><Label>Task</Label><Input placeholder="What did you work on?" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" /></div>
                  <div><Label>Hours</Label><Input type="number" placeholder="2.5" /></div>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Time logged"); }}>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Hours today" value="6.5" change="+1.5h" icon={Clock} />
        <StatCard label="This week" value={`${total}h`} change="+8%" icon={Timer} />
        <StatCard label="Billable" value="142h" change="+12h" icon={Clock} />
        <StatCard label="Utilization" value="86%" change="+3%" icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Active timer</CardTitle></CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="font-mono text-5xl font-bold tabular-nums">{running ? "01:24:05" : "00:00:00"}</div>
            <div className="text-sm text-muted-foreground">Aurora Mobile App v2 / Design login flow</div>
            <Button size="lg" className={running ? "bg-destructive text-destructive-foreground" : "gradient-primary text-primary-foreground border-0 w-full"} onClick={() => setRunning(!running)}>
              {running ? <><Pause className="h-4 w-4 mr-2" />Stop</> : <><Play className="h-4 w-4 mr-2" />Start</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent entries</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Project</TableHead><TableHead>Task</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Hours</TableHead></TableRow></TableHeader>
              <TableBody>
                {timeLogs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.member}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.project}</TableCell>
                    <TableCell className="text-sm">{l.task}</TableCell>
                    <TableCell className="text-sm">{l.date}</TableCell>
                    <TableCell className="text-right font-medium">{l.hours}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Team utilization</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {team.map(m => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">{m.avatar}</div>
              <div className="flex-1">
                <div className="flex justify-between text-sm"><span>{m.name}</span><span className="text-muted-foreground">{m.load}/{m.capacity}h</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${(m.load/m.capacity)*100}%` }} /></div>
              </div>
              <Badge variant="outline">{Math.round((m.load/m.capacity)*100)}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
