import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { BedDouble, Users, CalendarCheck, DollarSign, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { title: "Total Rooms", value: 120, change: "4 under maintenance", changeType: "neutral" as const, icon: BedDouble },
  { title: "Occupancy Rate", value: "78%", change: "+5.2% vs last month", changeType: "positive" as const, icon: TrendingUp },
  { title: "Today's Check-ins", value: 14, change: "3 pending", changeType: "neutral" as const, icon: CalendarCheck },
  { title: "Active Guests", value: 94, change: "+12 from yesterday", changeType: "positive" as const, icon: Users },
  { title: "Today's Revenue", value: "$12,450", change: "+8.3% vs avg", changeType: "positive" as const, icon: DollarSign },
  { title: "Avg. Stay Duration", value: "3.2 nights", change: "-0.1 from last week", changeType: "negative" as const, icon: Clock },
];

const recentBookings = [
  { id: "BK-1024", guest: "James Wilson", room: "Suite 401", checkIn: "Apr 5", checkOut: "Apr 8", status: "Checked In" },
  { id: "BK-1025", guest: "Sarah Chen", room: "Deluxe 302", checkIn: "Apr 5", checkOut: "Apr 7", status: "Pending" },
  { id: "BK-1026", guest: "Mohammed Al-Rashid", room: "Suite 501", checkIn: "Apr 6", checkOut: "Apr 10", status: "Confirmed" },
  { id: "BK-1027", guest: "Emily Parker", room: "Single 105", checkIn: "Apr 5", checkOut: "Apr 6", status: "Checked In" },
  { id: "BK-1028", guest: "Raj Patel", room: "Deluxe 208", checkIn: "Apr 7", checkOut: "Apr 9", status: "Confirmed" },
];

const roomStatus = [
  { type: "Available", count: 32, color: "bg-success" },
  { type: "Occupied", count: 74, color: "bg-primary" },
  { type: "Reserved", count: 10, color: "bg-info" },
  { type: "Maintenance", count: 4, color: "bg-destructive" },
];

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Admin">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-card rounded-xl p-5"
          >
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Booking ID</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Guest</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Room</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Check-in</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2 text-primary font-medium">{b.id}</td>
                      <td className="py-3 px-2 text-foreground">{b.guest}</td>
                      <td className="py-3 px-2 text-muted-foreground">{b.room}</td>
                      <td className="py-3 px-2 text-muted-foreground">{b.checkIn}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "Checked In" ? "bg-success/20 text-success" :
                          b.status === "Confirmed" ? "bg-info/20 text-info" :
                          "bg-warning/20 text-warning"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Room Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Room Status</h3>
            <div className="space-y-4">
              {roomStatus.map((r) => (
                <div key={r.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${r.color}`} />
                    <span className="text-sm text-foreground">{r.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{r.count}</span>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            <div className="mt-6 flex rounded-full overflow-hidden h-3">
              {roomStatus.map((r) => (
                <div
                  key={r.type}
                  className={`${r.color} transition-all`}
                  style={{ width: `${(r.count / 120) * 100}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">120 total rooms</p>
          </motion.div>
        </div>

        {/* Charts */}
        <DashboardCharts />
      </div>
    </DashboardLayout>
  );
}
