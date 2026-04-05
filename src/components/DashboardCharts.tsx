import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const occupancyData = [
  { month: "Oct", rate: 62 }, { month: "Nov", rate: 58 }, { month: "Dec", rate: 85 },
  { month: "Jan", rate: 72 }, { month: "Feb", rate: 68 }, { month: "Mar", rate: 74 },
  { month: "Apr", rate: 78 },
];

const revenueData = [
  { month: "Oct", revenue: 142000 }, { month: "Nov", revenue: 128000 }, { month: "Dec", revenue: 198000 },
  { month: "Jan", revenue: 165000 }, { month: "Feb", revenue: 152000 }, { month: "Mar", revenue: 171000 },
  { month: "Apr", revenue: 186200 },
];

const sourceData = [
  { name: "Website", value: 42, color: "hsl(40, 45%, 58%)" },
  { name: "Booking.com", value: 25, color: "hsl(210, 80%, 55%)" },
  { name: "Walk-in", value: 15, color: "hsl(152, 60%, 42%)" },
  { name: "Airbnb", value: 10, color: "hsl(38, 92%, 50%)" },
  { name: "Phone", value: 8, color: "hsl(220, 15%, 50%)" },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 7%)",
    border: "1px solid hsl(220, 15%, 15%)",
    borderRadius: "8px",
    color: "hsl(40, 20%, 90%)",
    fontSize: "12px",
  },
};

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Occupancy Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-xl p-5"
      >
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Occupancy Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={occupancyData}>
            <defs>
              <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(40, 45%, 58%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(40, 45%, 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 12%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Occupancy"]} />
            <Area type="monotone" dataKey="rate" stroke="hsl(40, 45%, 58%)" fill="url(#occGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card rounded-xl p-5"
      >
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 12%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="hsl(40, 45%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Booking Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card rounded-xl p-5"
      >
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Booking Sources</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {sourceData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: "hsl(220, 10%, 50%)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
