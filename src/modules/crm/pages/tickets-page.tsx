import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, Send, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { TicketFormSheet } from "@/modules/crm/components/ticket-form-sheet";
import {
  crmKeys,
  useCrmTicket,
  useCrmTickets,
  useCreateTicketMessage,
  useResolveTicket,
  useUpdateTicket,
} from "@/hooks/crm/use-crm";
import { useAuth } from "@/hooks/use-auth";
import { useMarkTicketNotificationsRead } from "@/hooks/use-notifications";
import { isTicketRealtimeActive } from "@/lib/realtime/realtime-state";
import { crmApi } from "@/modules/crm/crm-api";
import { rbacApi } from "@/modules/rbac/rbac-api";
import { userSelectOptions } from "@/modules/crm/utils/select-options";
import { cn } from "@/lib/utils";
import type { CrmTicketAuthorType, CrmTicketDto, CrmTicketMessageDto } from "@/modules/crm/types";

const priorityVariant: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const statusVariant: Record<string, string> = {
  open: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function messagePreview(body: string, max = 100): string {
  const trimmed = body.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

function messageDisplayName(
  message: CrmTicketMessageDto,
  ticket: CrmTicketDto | undefined,
  currentUserName?: string | null,
): string {
  if (message.from !== "agent") {
    return message.author;
  }

  if (ticket?.agent && message.author === ticket.customer) {
    return ticket.agent;
  }

  if (currentUserName && ticket?.customer && message.author === ticket.customer) {
    return currentUserName;
  }

  return message.author;
}

function notifyCustomerMessage(author: string, body: string, ticketLabel?: string) {
  toast.info(ticketLabel ? `New customer message · ${ticketLabel}` : "New customer message", {
    description: `${author}: ${messagePreview(body)}`,
    duration: 8_000,
  });
}

export function TicketsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyMode, setReplyMode] = useState<CrmTicketAuthorType>("agent");
  const [sendEmail, setSendEmail] = useState(true);

  const {
    data: listData,
    isLoading: listLoading,
    isError: listError,
    error: listErrorDetail,
    refetch: refetchTickets,
  } = useCrmTickets({
    per_page: 100,
    search: search.trim() || undefined,
  });

  const tickets = listData?.data ?? [];

  useEffect(() => {
    if (tickets.length === 0) {
      setActiveId(null);
      return;
    }
    if (activeId === null || !tickets.some((t) => t.id === activeId)) {
      setActiveId(tickets[0].id);
    }
  }, [tickets, activeId]);

  const {
    data: ticketDetail,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchTicket,
  } = useCrmTicket(activeId ?? undefined);
  const ticket = ticketDetail ?? tickets.find((t) => t.id === activeId);

  const sendMessage = useCreateTicketMessage();
  const markTicketNotificationsRead = useMarkTicketNotificationsRead();
  const resolveTicket = useResolveTicket();
  const updateTicket = useUpdateTicket();

  const { data: usersData } = useQuery({
    queryKey: ["rbac", "users", "ticket-assign"],
    queryFn: () => rbacApi.users({ per_page: 100 }),
    enabled: assignOpen,
  });

  const userOptions = useMemo(
    () => userSelectOptions(usersData?.data ?? []),
    [usersData?.data],
  );

  const messages = ticketDetail?.messages ?? [];
  const isClosed = ticket?.status === "resolved" || ticket?.status === "closed";

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<number>>(new Set());
  const listUpdatedAtRef = useRef<Map<number, string>>(new Map());
  const listSnapshotReadyRef = useRef(false);
  const notifiedMessageIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    seenMessageIdsRef.current = new Set();
  }, [activeId]);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, activeId]);

  useEffect(() => {
    if (isTicketRealtimeActive()) return;
    if (!activeId || !ticketDetail?.messages?.length) return;

    const seen = seenMessageIdsRef.current;
    const notified = notifiedMessageIdsRef.current;

    if (seen.size === 0) {
      for (const m of ticketDetail.messages) {
        seen.add(m.id);
      }
      return;
    }

    const ticketLabel = ticket?.number ?? String(activeId);
    for (const m of ticketDetail.messages) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      if (m.from === "customer" && !notified.has(m.id)) {
        notified.add(m.id);
        notifyCustomerMessage(m.author, m.body, ticketLabel);
      }
    }
  }, [activeId, ticket?.number, ticketDetail?.messages]);

  useEffect(() => {
    if (isTicketRealtimeActive()) return;
    if (tickets.length === 0) return;

    const prev = listUpdatedAtRef.current;

    if (!listSnapshotReadyRef.current) {
      for (const t of tickets) {
        if (t.updated_at) prev.set(t.id, t.updated_at);
      }
      listSnapshotReadyRef.current = true;
      return;
    }

    const notified = notifiedMessageIdsRef.current;

    for (const t of tickets) {
      const updatedAt = t.updated_at;
      if (!updatedAt) continue;

      const previous = prev.get(t.id);
      prev.set(t.id, updatedAt);

      if (!previous || previous === updatedAt || t.id === activeId) continue;

      void crmApi.ticket(t.id).then((detail) => {
        const latest = detail.messages?.at(-1);
        if (!latest || latest.from !== "customer" || notified.has(latest.id)) return;
        notified.add(latest.id);
        notifyCustomerMessage(latest.author, latest.body, `${t.number} · ${t.customer}`);
        void queryClient.invalidateQueries({ queryKey: crmKeys.ticket(t.id) });
      });
    }
  }, [tickets, activeId, queryClient]);

  const handleSend = async () => {
    if (!activeId || !replyBody.trim()) return;
    const res = await sendMessage.mutateAsync({
      id: activeId,
      body: {
        body: replyBody.trim(),
        author_type: replyMode,
        ...(replyMode === "agent" && user?.name ? { author_name: user.name } : {}),
        send_email: replyMode === "agent" ? sendEmail : false,
      },
    });
    if (replyMode === "agent") {
      try {
        await markTicketNotificationsRead.mutateAsync(activeId);
      } catch {
        // Backend also marks read on agent reply; ignore duplicate client call failures.
      }
    }
    const latest = res.data?.message;
    if (latest) {
      seenMessageIdsRef.current.add(latest.id);
      notifiedMessageIdsRef.current.add(latest.id);
    }
    setReplyBody("");
  };

  const handleAssign = async () => {
    if (!activeId || !assignUserId) return;
    await updateTicket.mutateAsync({
      id: activeId,
      body: { assigned_to_user_id: Number(assignUserId) },
    });
    setAssignOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Customer support inbox with chat history and SLA tracking."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Tickets" }]}
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        }
      />

      {listError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-destructive">
            {getApiErrorMessage(
              listErrorDetail,
              "Could not load tickets. Run database migrations (crm_tickets) and ensure the API is running.",
            )}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetchTickets()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="grid h-[min(640px,calc(100vh-14rem))] min-h-[480px] lg:grid-cols-[300px_1fr]">
          <div className="flex min-h-0 flex-col overflow-hidden border-r">
            <div className="shrink-0 border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-0 min-h-0 flex-1">
              {listLoading && (
                <p className="p-4 text-sm text-muted-foreground">Loading tickets…</p>
              )}
              {!listLoading && !listError && tickets.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  No tickets yet. Click <strong>New Ticket</strong> to create one.
                </p>
              )}
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full text-left border-b p-3 hover:bg-muted/50 transition-colors",
                    activeId === t.id && "bg-primary/5 border-l-2 border-l-primary",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{t.number}</span>
                    <Badge className={cn("text-[10px]", priorityVariant[t.priority])}>{t.priority}</Badge>
                  </div>
                  <div className="font-medium text-sm line-clamp-1">{t.subject}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{t.customer}</span>
                    <span>{t.updated ?? "—"}</span>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden">
            {!ticket ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Select or create a ticket
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center justify-between border-b p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <Badge className={statusVariant[ticket.status]}>{ticket.status}</Badge>
                      <Badge className={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ticket.number} · {ticket.customer} · assigned to {ticket.agent ?? "Unassigned"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isClosed}
                      onClick={() => {
                        setAssignUserId(ticket.assigned_to_user_id ? String(ticket.assigned_to_user_id) : "");
                        setAssignOpen(true);
                      }}
                    >
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      disabled={isClosed || resolveTicket.isPending}
                      onClick={() => activeId && resolveTicket.mutate(activeId)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>

                <div
                  ref={messagesScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
                >
                  <div className="mx-auto max-w-2xl space-y-4">
                    {detailLoading && (
                      <p className="text-sm text-muted-foreground text-center">Loading messages…</p>
                    )}
                    {detailError && (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-destructive">Could not load messages.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => void refetchTicket()}>
                          Retry
                        </Button>
                      </div>
                    )}
                    {messages.map((m) => {
                      const displayName = messageDisplayName(m, ticket, user?.name);
                      return (
                      <div key={m.id} className={cn("flex gap-3", m.from === "agent" && "flex-row-reverse")}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">{initials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[70%]", m.from === "agent" && "items-end flex flex-col")}>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className="font-medium text-foreground">{displayName}</span>
                            <span>{m.time}</span>
                          </div>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-sm",
                              m.from === "agent"
                                ? "gradient-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm",
                            )}
                          >
                            {m.body}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                    <div ref={messagesEndRef} aria-hidden />
                  </div>
                </div>

                <div className="shrink-0 space-y-2 border-t p-3">
                  {!isClosed && (
                    <div className="flex flex-wrap items-center gap-4 px-1 text-xs">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="replyMode"
                            checked={replyMode === "agent"}
                            onChange={() => {
                              setReplyMode("agent");
                              setSendEmail(true);
                            }}
                            className="accent-primary"
                          />
                          Agent reply
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="replyMode"
                            checked={replyMode === "customer"}
                            onChange={() => {
                              setReplyMode("customer");
                              setSendEmail(false);
                            }}
                            className="accent-primary"
                          />
                          Log customer message
                        </label>
                      </div>
                      {replyMode === "agent" && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="send-email"
                            checked={sendEmail}
                            onCheckedChange={(v) => setSendEmail(v === true)}
                          />
                          <Label htmlFor="send-email" className="text-xs font-normal cursor-pointer">
                            Email customer
                          </Label>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder={
                        isClosed
                          ? "Ticket is closed"
                          : replyMode === "agent"
                            ? "Type your reply..."
                            : "Log what the customer said..."
                      }
                      className="border-0 bg-transparent focus-visible:ring-0"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      disabled={isClosed || sendMessage.isPending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled>
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      type="button"
                      className="h-8 w-8 gradient-primary text-primary-foreground border-0"
                      disabled={isClosed || !replyBody.trim() || sendMessage.isPending}
                      onClick={() => void handleSend()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <TicketFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(id) => setActiveId(id)}
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign ticket</DialogTitle>
          </DialogHeader>
          <SearchableSelect
            value={assignUserId}
            onValueChange={setAssignUserId}
            options={userOptions}
            placeholder="Select team member"
            searchPlaceholder="Search users…"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAssign()} disabled={!assignUserId || updateTicket.isPending}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
