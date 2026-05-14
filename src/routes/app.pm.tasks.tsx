import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasks, pmTone } from "@/lib/pm-mock";
import { Search, Plus, MoreHorizontal, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pm/tasks")({ component: TasksPage });

function TasksPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const filtered = tasks.filter(t =>
    (tab === "all" || t.status === tab) &&
    (t.title.toLowerCase().includes(q.toLowerCase()) || t.project.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        description="Plan, assign and track work across all projects."
        breadcrumbs={[{ label: "Projects" }, { label: "Tasks" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New task</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
              <SheetHeader><SheetTitle>Create task</SheetTitle></SheetHeader>
              <div className="space-y-4 py-4">
                <div><Label>Title</Label><Input placeholder="Task title" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Project</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="p1">Aurora Mobile App v2</SelectItem><SelectItem value="p2">Helix ERP Migration</SelectItem></SelectContent>
                    </Select></div>
                  <div><Label>Assignee</Label><Input placeholder="Lena Vogt" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Due</Label><Input type="date" /></div>
                  <div><Label>Priority</Label>
                    <Select><SelectTrigger><SelectValue placeholder="med" /></SelectTrigger>
                      <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="med">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                    </Select></div>
                  <div><Label>Estimate (h)</Label><Input type="number" placeholder="8" /></div>
                </div>
                <div><Label>Description</Label><Textarea placeholder="Optional" /></div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Task created"); }}>Create</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To do</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative max-w-sm flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks..." />
          </div>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Assignee</TableHead><TableHead>Due</TableHead><TableHead>Priority</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.project}</TableCell>
                  <TableCell className="text-sm">{t.assignee}</TableCell>
                  <TableCell className="text-sm">{t.due}</TableCell>
                  <TableCell><Badge variant="outline" className={pmTone(t.priority)}>{t.priority}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Progress value={t.estimate ? (t.logged/t.estimate)*100 : 0} className="h-1.5 w-16" />
                      <span className="text-muted-foreground">{t.logged}/{t.estimate}h</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={pmTone(t.status)}>{t.status.replace("_"," ")}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Logged")}>Log time</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
