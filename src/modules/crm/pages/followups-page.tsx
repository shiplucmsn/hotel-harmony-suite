import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, Calendar, CheckSquare, Plus, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompleteFollowup,
  useCreateFollowup,
  useCrmCustomers,
  useCrmFollowups,
  useCrmLeads,
  useSnoozeFollowup,
} from "@/hooks/crm/use-crm";
import { rbacApi } from "@/modules/rbac/rbac-api";
import { customerSelectOptions, userSelectOptions } from "@/modules/crm/utils/select-options";
import type { CrmFollowupDto, CrmFollowupType } from "@/modules/crm/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const typeIcon: Record<CrmFollowupType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
};

const statusVariant: Record<string, string> = {
  upcoming: "bg-info/10 text-info",
  overdue: "bg-destructive/10 text-destructive",
  done: "bg-success/10 text-success",
};

const TAB_STATUSES = ["all", "upcoming", "overdue", "done"] as const;

function defaultDueLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function snoozeUntilTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function FollowupRow({
  followup,
  onComplete,
  onSnooze,
  busy,
}: {
  followup: CrmFollowupDto;
  onComplete: (id: number) => void;
  onSnooze: (id: number) => void;
  busy: boolean;
}) {
  const Icon = typeIcon[followup.type];
  const isDone = followup.status === "done";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        followup.status === "overdue" && "border-destructive/40 bg-destructive/5",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          followup.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{followup.customer}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {followup.type}
          </Badge>
          <Badge className={statusVariant[followup.status]}>{followup.status}</Badge>
        </div>
        {followup.notes && <p className="mt-1 text-sm text-muted-foreground">{followup.notes}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BellRing className="h-3 w-3" />
            {followup.due}
          </span>
          <span>· {followup.owner}</span>
        </div>
      </div>
      {!isDone && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onSnooze(followup.id)}>
            Snooze
          </Button>
          <Button size="sm" disabled={busy} onClick={() => onComplete(followup.id)}>
            Complete
          </Button>
        </div>
      )}
    </div>
  );
}

export function FollowupsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TAB_STATUSES)[number]>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"customer" | "lead" | "custom">("customer");
  const [customerId, setCustomerId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [subjectLabel, setSubjectLabel] = useState("");
  const [followupType, setFollowupType] = useState<CrmFollowupType>("call");
  const [dueAt, setDueAt] = useState(defaultDueLocal);
  const [notes, setNotes] = useState("");
  const [assignUserId, setAssignUserId] = useState(user?.id ? String(user.id) : "");

  const statusFilter = tab === "all" ? undefined : tab;
  const { data, isLoading, isError, refetch } = useCrmFollowups({
    status: statusFilter,
    per_page: 100,
  });
  const { data: customersData } = useCrmCustomers({ per_page: 100 });
  const { data: leadsData } = useCrmLeads({ per_page: 100 });
  const { data: usersData } = useQuery({
    queryKey: ["rbac", "users", "followups"],
    queryFn: () => rbacApi.users({ per_page: 100 }),
  });

  const createFollowup = useCreateFollowup();
  const completeFollowup = useCompleteFollowup();
  const snoozeFollowup = useSnoozeFollowup();

  const followups = data?.data ?? [];
  const customerOptions = useMemo(
    () => customerSelectOptions(customersData?.data ?? []),
    [customersData?.data],
  );
  const leadOptions = useMemo(
    () =>
      (leadsData?.data ?? []).map((l) => ({
        value: String(l.id),
        label: l.company_name ? `${l.name} (${l.company_name})` : l.name,
        keywords: [l.email, l.phone].filter(Boolean).join(" "),
      })),
    [leadsData?.data],
  );
  const userOptions = useMemo(() => userSelectOptions(usersData?.data ?? []), [usersData?.data]);

  const busy = createFollowup.isPending || completeFollowup.isPending || snoozeFollowup.isPending;

  const resetForm = () => {
    setLinkType("customer");
    setCustomerId("");
    setLeadId("");
    setSubjectLabel("");
    setFollowupType("call");
    setDueAt(defaultDueLocal());
    setNotes("");
    setAssignUserId(user?.id ? String(user.id) : "");
  };

  const handleSchedule = async () => {
    const dueIso = new Date(dueAt).toISOString();
    if (Number.isNaN(Date.parse(dueIso))) {
      toast.error("Enter a valid due date");
      return;
    }

    const body: Parameters<typeof createFollowup.mutateAsync>[0] = {
      type: followupType,
      due_at: dueIso,
      notes: notes.trim() || undefined,
      assigned_to_user_id: assignUserId ? Number(assignUserId) : undefined,
    };

    if (linkType === "customer") {
      if (!customerId) {
        toast.error("Select a customer");
        return;
      }
      body.customer_id = Number(customerId);
    } else if (linkType === "lead") {
      if (!leadId) {
        toast.error("Select a lead");
        return;
      }
      body.lead_id = Number(leadId);
    } else {
      if (!subjectLabel.trim()) {
        toast.error("Enter a name");
        return;
      }
      body.subject_label = subjectLabel.trim();
    }

    await createFollowup.mutateAsync(body);
    setDialogOpen(false);
    resetForm();
  };

  const listContent = (
    <Card>
      <CardContent className="space-y-3 p-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        {isError && (
          <div className="py-8 text-center">
            <p className="text-sm text-destructive">Could not load follow-ups.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && followups.length === 0 && (
          <EmptyState
            icon={BellRing}
            title="No follow-ups"
            description={
              tab === "all"
                ? "Schedule a call, email, or meeting to stay on top of your pipeline."
                : `No ${tab} follow-ups right now.`
            }
          />
        )}
        {followups.map((f) => (
          <FollowupRow
            key={f.id}
            followup={f}
            busy={busy}
            onComplete={(id) => void completeFollowup.mutateAsync(id)}
            onSnooze={(id) => void snoozeFollowup.mutateAsync({ id, snoozedUntil: snoozeUntilTomorrow() })}
          />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Reminders"
        description="Stay on top of every call, email and meeting."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Follow-ups" }]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Follow-up</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Link to</Label>
                  <Select value={linkType} onValueChange={(v) => setLinkType(v as typeof linkType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="custom">Other name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {linkType === "customer" && (
                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <SearchableSelect
                      options={customerOptions}
                      value={customerId}
                      onValueChange={setCustomerId}
                      placeholder="Select customer…"
                    />
                  </div>
                )}
                {linkType === "lead" && (
                  <div className="space-y-2">
                    <Label>Lead</Label>
                    <SearchableSelect
                      options={leadOptions}
                      value={leadId}
                      onValueChange={setLeadId}
                      placeholder="Select lead…"
                    />
                  </div>
                )}
                {linkType === "custom" && (
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Company or contact name"
                      value={subjectLabel}
                      onChange={(e) => setSubjectLabel(e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={followupType} onValueChange={(v) => setFollowupType(v as CrmFollowupType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due date</Label>
                    <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign to</Label>
                  <SearchableSelect
                    options={userOptions}
                    value={assignUserId}
                    onValueChange={setAssignUserId}
                    placeholder="Select user…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add context…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={busy} onClick={() => void handleSchedule()}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {listContent}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          {listContent}
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          {listContent}
        </TabsContent>
        <TabsContent value="done" className="mt-4">
          {listContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
