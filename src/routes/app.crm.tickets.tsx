import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Send, Paperclip, Smile } from "lucide-react";
import { tickets, ticketMessages } from "@/lib/crm-mock";
import { cn } from "@/lib/utils";

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

export const Route = createFileRoute("/app/crm/tickets")({
  component: () => {
    const [active, setActive] = useState(tickets[0].id);
    const ticket = tickets.find((t) => t.id === active) ?? tickets[0];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Support Tickets"
          description="Customer support inbox with chat history and SLA tracking."
          breadcrumbs={[{ label: "CRM & Sales" }, { label: "Tickets" }]}
          actions={<Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Ticket</Button>}
        />

        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[320px_1fr] h-[640px]">
            {/* List */}
            <div className="border-r flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tickets..." className="pl-9 h-9" />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={cn("w-full text-left border-b p-3 hover:bg-muted/50 transition-colors", active === t.id && "bg-primary/5 border-l-2 border-l-primary")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                      <Badge className={cn("text-[10px]", priorityVariant[t.priority])}>{t.priority}</Badge>
                    </div>
                    <div className="font-medium text-sm line-clamp-1">{t.subject}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{t.customer}</span>
                      <span>{t.updated}</span>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* Chat */}
            <div className="flex flex-col">
              <div className="border-b p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <Badge className={statusVariant[ticket.status]}>{ticket.status}</Badge>
                    <Badge className={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{ticket.id} · {ticket.customer} · assigned to {ticket.agent}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Assign</Button>
                  <Button size="sm">Resolve</Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {ticketMessages.map((m) => (
                    <div key={m.id} className={cn("flex gap-3", m.from === "agent" && "flex-row-reverse")}>
                      <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-xs">{m.author.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                      <div className={cn("max-w-[70%]", m.from === "agent" && "items-end flex flex-col")}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">{m.author}</span>
                          <span>{m.time}</span>
                        </div>
                        <div className={cn("rounded-2xl px-4 py-2.5 text-sm", m.from === "agent" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-3">
                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder="Type your reply..." className="border-0 bg-transparent focus-visible:ring-0" />
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="h-4 w-4" /></Button>
                  <Button size="icon" className="h-8 w-8 gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  },
});
