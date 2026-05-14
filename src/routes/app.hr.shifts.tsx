import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Clock, Edit, Users } from "lucide-react";
import { shifts } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/shifts")({ component: ShiftsPage });

function ShiftsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shifts"
        description="Define and assign work shifts."
        breadcrumbs={[{ label: "HR" }, { label: "Shifts" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New shift</Button></SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader><SheetTitle>Create shift</SheetTitle></SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Shift name *</Label><Input placeholder="e.g. Morning" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Start</Label><Input type="time" /></div>
                  <div className="grid gap-2"><Label>End</Label><Input type="time" /></div>
                </div>
                <div className="grid gap-2"><Label>Break (min)</Label><Input type="number" defaultValue={45} /></div>
                <div className="grid gap-2"><Label>Working days</Label><Input placeholder="Mon–Fri" /></div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={()=>setOpen(false)}>Create</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {shifts.map(s => (
          <Card key={s.id} className="transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock className="h-4 w-4" /></div>
                <CardTitle className="text-base">{s.name}</CardTitle>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-2xl font-semibold">{s.start} – {s.end}</p>
              <div className="flex items-center justify-between text-muted-foreground"><span>Break</span><span>{s.breakMin}m</span></div>
              <div className="flex items-center justify-between text-muted-foreground"><span>Days</span><Badge variant="outline">{s.days}</Badge></div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t"><Users className="h-3.5 w-3.5" />{s.assigned} employees</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
