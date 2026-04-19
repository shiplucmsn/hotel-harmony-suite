import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, BedDouble, Users, Download } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

const occupancy = [
  { day: "Mon", rate: 72 }, { day: "Tue", rate: 78 }, { day: "Wed", rate: 81 },
  { day: "Thu", rate: 85 }, { day: "Fri", rate: 92 }, { day: "Sat", rate: 96 }, { day: "Sun", rate: 88 },
];
const revenue = [
  { month: "Nov", rev: 142000 }, { month: "Dec", rev: 168000 }, { month: "Jan", rev: 152000 },
  { month: "Feb", rev: 161000 }, { month: "Mar", rev: 178000 }, { month: "Apr", rev: 186000 },
];
const sources = [
  { name: "Direct", value: 42 }, { name: "Booking.com", value: 28 }, { name: "Airbnb", value: 18 }, { name: "Walk-in", value: 12 },
];
const colors = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

const expenses = [
  { cat: "Payroll", amount: 62000 }, { cat: "F&B Supply", amount: 18400 },
  { cat: "Utilities", amount: 9200 }, { cat: "Maintenance", amount: 6800 }, { cat: "Marketing", amount: 4200 },
];

export default function Reports() {
  const { format } = useCurrency();
  const totalRev = 186200;
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRev - totalExp;

  const exportCSV = () => {
    const csv = "Metric,Value\nRevenue," + totalRev + "\nExpenses," + totalExp + "\nProfit," + profit;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "royale-report.csv"; a.click();
    toast.success("Report exported");
  };

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Performance, finance, and trends">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={exportCSV} variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Monthly Revenue" value={format(totalRev)} change="+12.5%" changeType="positive" icon={DollarSign} index={0} />
          <StatCard title="Occupancy Rate" value="86%" change="+4%" changeType="positive" icon={BedDouble} index={1} />
          <StatCard title="Total Bookings" value={284} change="+18" changeType="positive" icon={Users} index={2} />
          <StatCard title="Net Profit" value={format(profit)} change="+8.2%" changeType="positive" icon={TrendingUp} index={3} />
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="finance">Finance / P&L</TabsTrigger>
            <TabsTrigger value="sources">Booking Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-heading font-semibold mb-3">Weekly Occupancy</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={occupancy}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-heading font-semibold mb-3">Revenue Trend (6mo)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="rev" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-heading font-semibold mb-3">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={expenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cat" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-heading font-semibold mb-4">Profit & Loss</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-success/10"><span>Revenue</span><span className="font-semibold text-success">{format(totalRev)}</span></div>
                <div className="flex justify-between p-3 rounded-lg bg-destructive/10"><span>Total Expenses</span><span className="font-semibold text-destructive">-{format(totalExp)}</span></div>
                <div className="flex justify-between p-3 rounded-lg gold-gradient"><span className="text-primary-foreground font-semibold">Net Profit</span><span className="font-heading font-bold text-primary-foreground">{format(profit)}</span></div>
                <div className="text-xs text-muted-foreground text-right">Margin: {((profit/totalRev)*100).toFixed(1)}%</div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="p-5">
              <h3 className="font-heading font-semibold mb-3">Booking Source Breakdown</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={(e) => `${e.name} ${e.value}%`}>
                    {sources.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
