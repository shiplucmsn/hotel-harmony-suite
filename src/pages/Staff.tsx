import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, Clock, Activity, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

const staff = [
  { name: "Aaron Hill", role: "Admin", dept: "Management", status: "Active", email: "aaron@royale.com" },
  { name: "Lina Park", role: "Manager", dept: "Front Desk", status: "Active", email: "lina@royale.com" },
  { name: "Mateo Cruz", role: "Staff", dept: "Housekeeping", status: "On Leave", email: "mateo@royale.com" },
  { name: "Sara Khan", role: "Manager", dept: "F&B", status: "Active", email: "sara@royale.com" },
  { name: "Diego Ruiz", role: "Staff", dept: "Concierge", status: "Active", email: "diego@royale.com" },
  { name: "Yuki Sato", role: "Staff", dept: "Spa", status: "Active", email: "yuki@royale.com" },
];

const attendance = [
  { name: "Aaron Hill", date: "Apr 19", in: "08:02", out: "—", hours: "—", status: "Present" },
  { name: "Lina Park", date: "Apr 19", in: "07:45", out: "—", hours: "—", status: "Present" },
  { name: "Mateo Cruz", date: "Apr 19", in: "—", out: "—", hours: "—", status: "Leave" },
  { name: "Sara Khan", date: "Apr 19", in: "08:15", out: "—", hours: "—", status: "Present" },
  { name: "Diego Ruiz", date: "Apr 18", in: "08:00", out: "16:32", hours: "8h 32m", status: "Completed" },
];

const logs = [
  { user: "Aaron Hill", action: "Updated room rate for Suite 401", time: "12 min ago", type: "config" },
  { user: "Lina Park", action: "Checked in James Wilson — Suite 401", time: "1h ago", type: "checkin" },
  { user: "Sara Khan", action: "Created POS order #1284 — Maison Royale", time: "2h ago", type: "order" },
  { user: "Diego Ruiz", action: "Marked room 205 as cleaned", time: "3h ago", type: "housekeeping" },
  { user: "Aaron Hill", action: "Granted Manager role to Sara Khan", time: "Yesterday", type: "security" },
];

const roleColor: Record<string, string> = {
  Admin: "bg-primary/20 text-primary",
  Manager: "bg-info/20 text-info",
  Staff: "bg-secondary text-secondary-foreground",
};
const statusColor: Record<string, string> = {
  Active: "bg-success/20 text-success",
  "On Leave": "bg-warning/20 text-warning",
  Present: "bg-success/20 text-success",
  Leave: "bg-warning/20 text-warning",
  Completed: "bg-info/20 text-info",
};

export default function Staff() {
  return (
    <DashboardLayout title="Staff" subtitle="Roles, attendance, and activity">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Staff" value={42} icon={Users} index={0} />
          <StatCard title="On Duty" value={28} change="3 on break" icon={UserCheck} changeType="positive" index={1} />
          <StatCard title="Avg Hours / Day" value="8.4h" icon={Clock} index={2} />
          <StatCard title="Activity Today" value={147} change="+12% vs yesterday" changeType="positive" icon={Activity} index={3} />
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster & Roles</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." className="pl-9 w-64" />
              </div>
              <Button className="gold-gradient text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Add Staff</Button>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr><th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Department</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th></tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.email} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{s.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.dept}</td>
                      <td className="py-3 px-4"><Badge className={`${roleColor[s.role]} border-none`}>{s.role}</Badge></td>
                      <td className="py-3 px-4"><Badge className={`${statusColor[s.status]} border-none`}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </TabsContent>

          <TabsContent value="attendance">
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr><th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Check-in</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Check-out</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Hours</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th></tr>
                </thead>
                <tbody>
                  {attendance.map((a, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 font-medium">{a.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{a.date}</td>
                      <td className="py-3 px-4 font-mono text-xs">{a.in}</td>
                      <td className="py-3 px-4 font-mono text-xs">{a.out}</td>
                      <td className="py-3 px-4 text-muted-foreground">{a.hours}</td>
                      <td className="py-3 px-4"><Badge className={`${statusColor[a.status]} border-none`}>{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="glass-card rounded-xl p-2">
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/30"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-semibold">{l.user}</span> <span className="text-muted-foreground">{l.action}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{l.type}</Badge>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
