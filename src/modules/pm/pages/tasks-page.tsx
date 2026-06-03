import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MoreHorizontal, Plus, RefreshCw, Search } from "lucide-react";
import { useHrEmployees } from "@/hooks/hr/use-hr";
import {
  useCreatePmProject,
  useCreatePmTask,
  useDeletePmTask,
  useLogPmTaskTime,
  usePmProjects,
  usePmTasks,
  useUpdatePmTask,
} from "@/hooks/pm/use-pm";
import { AssigneeMultiSelect } from "@/modules/pm/components/assignee-multi-select";
import { pmTone } from "@/modules/pm/utils/pm-tone";
import type { PmTaskDto, PmTaskPriority, PmTaskStatus } from "@/modules/pm/types";

const STATUSES: PmTaskStatus[] = ["todo", "in_progress", "review", "done"];
const PRIORITIES: PmTaskPriority[] = ["low", "med", "high", "urgent"];

type TaskFormState = {
  title: string;
  project_id: string;
  assignee_ids: number[];
  due_date: string;
  priority: PmTaskPriority;
  status: PmTaskStatus;
  estimate_hours: string;
  description: string;
};

function emptyForm(): TaskFormState {
  return {
    title: "",
    project_id: "",
    assignee_ids: [],
    due_date: "",
    priority: "med",
    status: "todo",
    estimate_hours: "",
    description: "",
  };
}

function formFromTask(t: PmTaskDto): TaskFormState {
  return {
    title: t.title,
    project_id: String(t.project_id),
    assignee_ids:
      t.assignee_ids?.length
        ? t.assignee_ids
        : (t.assignees?.map((a) => a.id) ?? []),
    due_date: t.due_date ?? t.due ?? "",
    priority: t.priority,
    status: t.status,
    estimate_hours: String(t.estimate_hours ?? t.estimate ?? 0),
    description: t.description ?? "",
  };
}

function assigneeDisplay(t: PmTaskDto): string {
  if (t.assignees?.length) {
    return t.assignees.map((a) => a.name).join(", ");
  }
  return t.assignee_name ?? t.assignee ?? "—";
}

function statusLabel(s: PmTaskStatus) {
  return s.replace("_", " ");
}

export function TasksPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<PmTaskDto | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PmTaskDto | null>(null);
  const [logTarget, setLogTarget] = useState<PmTaskDto | null>(null);
  const [logHours, setLogHours] = useState("1");

  const listParams = useMemo(
    () => ({
      per_page: 100,
      search: q.trim() || undefined,
      status: tab === "all" ? undefined : tab,
    }),
    [q, tab],
  );

  const { data, isLoading, isError, refetch, isFetching } = usePmTasks(listParams);
  const { data: projectsData } = usePmProjects({ per_page: 100 });
  const { data: employeesData, isLoading: employeesLoading } = useHrEmployees({
    per_page: 200,
    status: "active",
  });
  const createProject = useCreatePmProject();
  const createTask = useCreatePmTask();
  const updateTask = useUpdatePmTask();
  const [newProjectName, setNewProjectName] = useState("");
  const logTime = useLogPmTaskTime();
  const deleteTask = useDeletePmTask();

  const tasks = data?.data ?? [];
  const summary = data?.summary;
  const projects = projectsData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (t: PmTaskDto) => {
    setEditing(t);
    setForm(formFromTask(t));
    setSheetOpen(true);
  };

  const submitForm = async () => {
    const projectId = Number(form.project_id);
    if (!form.title.trim() || !projectId) return;

    const payload = {
      project_id: projectId,
      title: form.title.trim(),
      assignee_ids: form.assignee_ids,
      due_date: form.due_date || undefined,
      priority: form.priority,
      status: form.status,
      estimate_hours: Number(form.estimate_hours) || 0,
      description: form.description.trim() || undefined,
    };

    if (editing) {
      await updateTask.mutateAsync({ id: editing.id, body: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setSheetOpen(false);
  };

  const submitLogTime = async () => {
    if (!logTarget) return;
    const hours = Number(logHours);
    if (!hours || hours <= 0) return;
    await logTime.mutateAsync({ id: logTarget.id, body: { hours } });
    setLogTarget(null);
    setLogHours("1");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTask.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const tabCount = (key: keyof NonNullable<typeof summary>) => {
    if (!summary) return undefined;
    return summary[key];
  };

  const saving = createTask.isPending || updateTask.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Management"
        description="Plan, assign and track work across all projects."
        breadcrumbs={[{ label: "Projects" }, { label: "Tasks" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground border-0"
              onClick={openCreate}
              disabled={projects.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              New task
            </Button>
          </div>
        }
      />

      {projects.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Add a project before creating tasks.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
              />
              <Button
                disabled={!newProjectName.trim() || createProject.isPending}
                onClick={() =>
                  void createProject
                    .mutateAsync({ name: newProjectName.trim() })
                    .then(() => setNewProjectName(""))
                }
              >
                {createProject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">
                All{summary ? ` (${summary.total})` : ""}
              </TabsTrigger>
              <TabsTrigger value="todo">
                To do{tabCount("todo") != null ? ` (${tabCount("todo")})` : ""}
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In progress
                {tabCount("in_progress") != null ? ` (${tabCount("in_progress")})` : ""}
              </TabsTrigger>
              <TabsTrigger value="review">
                Review{tabCount("review") != null ? ` (${tabCount("review")})` : ""}
              </TabsTrigger>
              <TabsTrigger value="done">
                Done{tabCount("done") != null ? ` (${tabCount("done")})` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative max-w-sm flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks..."
            />
          </div>
          {summary && summary.overdue > 0 && (
            <Badge variant="outline" className={pmTone("at_risk")}>
              {summary.overdue} overdue
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading tasks…
            </div>
          ) : isError ? (
            <EmptyState
              title="Could not load tasks"
              description="Check your connection and API permissions, then try again."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description={
                tab === "all"
                  ? "Create a task to start tracking work."
                  : `No tasks in "${statusLabel(tab as PmTaskStatus)}".`
              }
              action={
                <Button onClick={openCreate} disabled={projects.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  New task
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => {
                  const estimate = t.estimate_hours ?? t.estimate ?? 0;
                  const logged = t.logged_hours ?? t.logged ?? 0;
                  const pct =
                    t.progress_percent ??
                    (estimate > 0 ? Math.min(100, Math.round((logged / estimate) * 100)) : logged > 0 ? 100 : 0);
                  const projectLabel =
                    t.project_name ?? t.project ?? projects.find((p) => p.id === t.project_id)?.name ?? "—";

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <div>{t.title}</div>
                        {t.reference && (
                          <div className="text-xs text-muted-foreground">{t.reference}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{projectLabel}</TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <span className="line-clamp-2">{assigneeDisplay(t)}</span>
                      </TableCell>
                      <TableCell className="text-sm">{t.due_date ?? t.due ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pmTone(t.priority)}>
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <Progress value={pct} className="h-1.5 w-16" />
                          <span className="text-muted-foreground">
                            {logged}/{estimate}h
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pmTone(t.status)}>
                          {statusLabel(t.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(t)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setLogTarget(t);
                                setLogHours("1");
                              }}
                            >
                              Log time
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {STATUSES.filter((s) => s !== t.status).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() =>
                                  updateTask.mutate({ id: t.id, body: { status: s } })
                                }
                              >
                                Mark {statusLabel(s)}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(t)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit task" : "Create task"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Project</Label>
                <Select
                  value={form.project_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Assignees</Label>
                <AssigneeMultiSelect
                  employees={employees}
                  value={form.assignee_ids}
                  onChange={(assignee_ids) => setForm((f) => ({ ...f, assignee_ids }))}
                  loading={employeesLoading}
                  disabled={employees.length === 0}
                  placeholder={
                    employees.length === 0
                      ? "No employees — add in HR"
                      : "Select employees"
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Due</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, priority: v as PmTaskPriority }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimate (h)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.estimate_hours}
                  onChange={(e) => setForm((f) => ({ ...f, estimate_hours: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as PmTaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitForm()}
              disabled={saving || !form.title.trim() || !form.project_id}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={logTarget != null} onOpenChange={(o) => !o && setLogTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log time</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{logTarget?.title}</p>
          <div>
            <Label>Hours</Label>
            <Input
              type="number"
              min={0.25}
              step={0.25}
              value={logHours}
              onChange={(e) => setLogHours(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitLogTime()}
              disabled={logTime.isPending || Number(logHours) <= 0}
            >
              {logTime.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget != null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &quot;{deleteTarget?.title}&quot;. This action can be undone only if
              soft-delete restore is enabled on the backend.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
