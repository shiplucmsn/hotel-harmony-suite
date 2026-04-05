import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tasks = [
  { room: 101, floor: 1, type: "Single", status: "Clean", assignee: "Maria G.", time: "09:15 AM", priority: "Normal" },
  { room: 102, floor: 1, type: "Single", status: "Dirty", assignee: "Maria G.", time: "—", priority: "High" },
  { room: 201, floor: 2, type: "Deluxe", status: "Inspected", assignee: "John D.", time: "08:45 AM", priority: "Normal" },
  { room: 202, floor: 2, type: "Deluxe", status: "In Progress", assignee: "Aisha K.", time: "10:30 AM", priority: "Normal" },
  { room: 203, floor: 2, type: "Deluxe", status: "Dirty", assignee: "Unassigned", time: "—", priority: "Urgent" },
  { room: 301, floor: 3, type: "Deluxe", status: "Maintenance", assignee: "Tech Team", time: "—", priority: "High" },
  { room: 401, floor: 4, type: "Suite", status: "Clean", assignee: "Aisha K.", time: "07:30 AM", priority: "Normal" },
  { room: 501, floor: 5, type: "Suite", status: "Inspected", assignee: "John D.", time: "08:00 AM", priority: "Normal" },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Clean: { icon: CheckCircle2, color: "bg-success/20 text-success" },
  Inspected: { icon: Sparkles, color: "bg-primary/20 text-primary" },
  Dirty: { icon: AlertCircle, color: "bg-destructive/20 text-destructive" },
  "In Progress": { icon: Clock, color: "bg-warning/20 text-warning" },
  Maintenance: { icon: AlertCircle, color: "bg-info/20 text-info" },
};

const summary = [
  { label: "Clean", count: 2, color: "bg-success" },
  { label: "Inspected", count: 2, color: "bg-primary" },
  { label: "Dirty", count: 2, color: "bg-destructive" },
  { label: "In Progress", count: 1, color: "bg-warning" },
  { label: "Maintenance", count: 1, color: "bg-info" },
];

export default function Housekeeping() {
  return (
    <DashboardLayout title="Housekeeping" subtitle="Room cleaning and maintenance">
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex gap-4 flex-wrap">
          {summary.map((s) => (
            <div key={s.label} className="glass-card rounded-xl px-5 py-3 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${s.color}`} />
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-lg font-heading font-bold text-foreground">{s.count}</span>
            </div>
          ))}
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks.map((task, i) => {
            const config = statusConfig[task.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={task.room}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading text-lg font-semibold text-foreground">Room {task.room}</p>
                    <p className="text-xs text-muted-foreground">{task.type} · Floor {task.floor}</p>
                  </div>
                  <Badge variant="outline" className={`${config.color} border-none text-xs`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {task.status}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-muted-foreground">Assigned: <span className="text-foreground">{task.assignee}</span></p>
                  <p className="text-muted-foreground">Completed: <span className="text-foreground">{task.time}</span></p>
                  {task.priority !== "Normal" && (
                    <Badge variant="outline" className={`text-xs border-none mt-1 ${
                      task.priority === "Urgent" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                    }`}>
                      {task.priority} Priority
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
