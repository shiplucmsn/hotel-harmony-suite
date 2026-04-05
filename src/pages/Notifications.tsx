import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Bell, CalendarCheck, CreditCard, AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Notification {
  id: number;
  type: "booking" | "payment" | "alert" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, type: "booking", title: "New Booking", message: "James Wilson booked Suite 401 for Apr 5-8.", time: "2 min ago", read: false },
  { id: 2, type: "payment", title: "Payment Received", message: "$897.00 received from James Wilson via Credit Card.", time: "5 min ago", read: false },
  { id: 3, type: "booking", title: "Booking Confirmed", message: "Mohammed Al-Rashid confirmed Suite 501 for Apr 6-10.", time: "15 min ago", read: false },
  { id: 4, type: "alert", title: "Maintenance Required", message: "Room 301 reported AC malfunction. Assigned to Tech Team.", time: "30 min ago", read: true },
  { id: 5, type: "booking", title: "Check-in Completed", message: "Emily Parker checked into Single 105.", time: "1 hr ago", read: true },
  { id: 6, type: "payment", title: "Payment Pending", message: "Invoice INV-4503 ($318.00) for Sarah Chen is pending.", time: "1 hr ago", read: true },
  { id: 7, type: "info", title: "System Update", message: "Housekeeping schedule updated for today. 3 rooms reassigned.", time: "2 hrs ago", read: true },
  { id: 8, type: "alert", title: "Low Inventory Alert", message: "Mini-bar supplies running low. Reorder recommended.", time: "3 hrs ago", read: true },
  { id: 9, type: "booking", title: "Booking Cancelled", message: "Anna Kowalski cancelled Deluxe 205 reservation.", time: "4 hrs ago", read: true },
  { id: 10, type: "info", title: "Daily Report", message: "Yesterday's occupancy: 74%. Revenue: $11,200.", time: "5 hrs ago", read: true },
];

const typeConfig = {
  booking: { icon: CalendarCheck, color: "text-info", bg: "bg-info/10" },
  payment: { icon: CreditCard, color: "text-success", bg: "bg-success/10" },
  alert: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: number) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n));
  const remove = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout title="Notifications" subtitle={`${unreadCount} unread`}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-border text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        </div>

        <div className="space-y-2">
          {displayed.length === 0 ? (
            <div className="glass-card rounded-xl p-10 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            displayed.map((n, i) => {
              const config = typeConfig[n.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:border-primary/20 ${
                    !n.read ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => toggleRead(n.id)}
                >
                  <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</h4>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
