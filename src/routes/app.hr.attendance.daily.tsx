import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Calendar } from "lucide-react";
import { dailyAttendance } from "@/lib/hr-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hr/attendance/daily")({ component: DailyAttendance });

const dot: Record<string, string> = {
  present: "bg-success/15 text-success",
  late: "bg-warning/15 text-warning",
  absent: "bg-destructive/15 text-destructive",
};

function DailyAttendance() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = dailyAttendance.filter(r => (status === "all" || r.status === status) && r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily attendance"
        description="Punch-in / punch-out log for today."
        breadcrumbs={[{ label: "HR" }, { label: "Attendance", to: "/app/hr/attendance" }, { label: "Daily" }]}
        actions={<>
          <Button variant="outline" size="sm"><Calendar className="mr-2 h-4 w-4" />May 9, 2026</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        </>}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search employee…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">{r.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.code}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.department}</TableCell>
                <TableCell className="font-mono text-sm">{r.checkIn}</TableCell>
                <TableCell className="font-mono text-sm">{r.checkOut}</TableCell>
                <TableCell className="font-mono text-sm">{r.hours}</TableCell>
                <TableCell><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", dot[r.status])}>{r.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
