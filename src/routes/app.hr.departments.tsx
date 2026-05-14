import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Briefcase, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import { departments } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/departments")({ component: DepartmentsPage });

function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize your company structure."
        breadcrumbs={[{ label: "HR" }, { label: "Departments" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New department</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create department</DialogTitle>
                <DialogDescription>Add a new department to your organization.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2"><Label>Name *</Label><Input placeholder="e.g. Customer Success" /></div>
                <div className="grid gap-2"><Label>Department head</Label><Input placeholder="Select employee" /></div>
                <div className="grid gap-2"><Label>Description</Label><Textarea rows={3} placeholder="What does this team do?" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setOpen(false)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <Card key={d.id} className="group transition-all hover:shadow-elegant hover:-translate-y-0.5">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
                <CardTitle className="text-base">{d.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" />Edit</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Head: <span className="text-foreground font-medium">{d.head}</span></p>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Members</div>
                <span className="font-semibold">{d.members}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground"><span>Annual budget</span><span className="font-medium text-foreground">${d.budget.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
