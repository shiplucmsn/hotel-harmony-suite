import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { activityLogs } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/activity")({ component: HRActivityPage });

function HRActivityPage() {
  const [q, setQ] = useState("");
  const filtered = activityLogs.filter(l => (l.actor + l.action + l.target).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR activity log"
        description="Audit trail of every action across the HR module."
        breadcrumbs={[{ label: "HR" }, { label: "Activity" }]}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search activity…" className="pl-9" />
          </div>
          <Select defaultValue="7d">
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {filtered.map(l => (
              <li key={l.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30">
                <Avatar className="h-9 w-9"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{l.actor.split(" ").map(w=>w[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{l.actor}</span>{" "}
                    <span className="text-muted-foreground">{l.action}</span>{" "}
                    <span className="font-medium text-primary">{l.target}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{l.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
