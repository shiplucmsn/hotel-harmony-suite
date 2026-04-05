import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Receipt, CreditCard, Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const invoices = [
  { id: "INV-4501", guest: "James Wilson", room: "Suite 401", amount: "$897.00", date: "Apr 5, 2026", method: "Credit Card", status: "Paid" },
  { id: "INV-4502", guest: "Emily Parker", room: "Single 105", amount: "$89.00", date: "Apr 5, 2026", method: "Cash", status: "Paid" },
  { id: "INV-4503", guest: "Sarah Chen", room: "Deluxe 302", amount: "$318.00", date: "Apr 5, 2026", method: "Mobile Banking", status: "Pending" },
  { id: "INV-4504", guest: "Carlos Mendez", room: "Single 110", amount: "$89.00", date: "Apr 4, 2026", method: "Credit Card", status: "Paid" },
  { id: "INV-4505", guest: "Anna Kowalski", room: "Deluxe 205", amount: "$318.00", date: "Apr 3, 2026", method: "Credit Card", status: "Refunded" },
  { id: "INV-4506", guest: "Raj Patel", room: "Deluxe 208", amount: "$278.00", date: "Apr 7, 2026", method: "Pending", status: "Unpaid" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-success/20 text-success",
  Pending: "bg-warning/20 text-warning",
  Unpaid: "bg-destructive/20 text-destructive",
  Refunded: "bg-info/20 text-info",
};

const stats = [
  { title: "Today's Revenue", value: "$12,450", change: "+8.3% vs yesterday", changeType: "positive" as const, icon: DollarSign },
  { title: "Monthly Revenue", value: "$186,200", change: "+12.5% vs last month", changeType: "positive" as const, icon: TrendingUp },
  { title: "Pending Invoices", value: 8, change: "3 overdue", changeType: "negative" as const, icon: Receipt },
  { title: "Avg. Transaction", value: "$245", change: "+$12 from avg", changeType: "positive" as const, icon: CreditCard },
];

export default function Billing() {
  return (
    <DashboardLayout title="Billing" subtitle="Invoices, payments, and revenue">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-9 bg-secondary border-border w-64" />
            </div>
            <Button variant="outline" size="icon" className="border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="border-border text-foreground">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Guest</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Room</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <td className="py-3 px-4 text-primary font-medium">{inv.id}</td>
                    <td className="py-3 px-4 text-foreground">{inv.guest}</td>
                    <td className="py-3 px-4 text-muted-foreground">{inv.room}</td>
                    <td className="py-3 px-4 text-foreground font-semibold">{inv.amount}</td>
                    <td className="py-3 px-4 text-muted-foreground">{inv.date}</td>
                    <td className="py-3 px-4 text-muted-foreground">{inv.method}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`${statusStyles[inv.status]} border-none text-xs`}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
