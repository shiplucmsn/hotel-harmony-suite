import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart,
} from "recharts";
import {
  ArrowDownToLine, BarChart3, Boxes, DollarSign, Download, Factory, FileSpreadsheet,
  FileText, Filter, LineChart as LineChartIcon, PieChart as PieChartIcon, Printer,
  Search, ShoppingCart, TrendingUp, UserCog, Users, Mail,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { revenueData, salesByCategory } from "@/lib/mock-data";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

const salesRows = [
  { id: "S-1042", customer: "Globex Corp.", channel: "Online", amount: 12450, status: "Paid", date: "2025-05-12" },
  { id: "S-1041", customer: "Initech Labs", channel: "Retail", amount: 8920, status: "Paid", date: "2025-05-12" },
  { id: "S-1040", customer: "Stark Industries", channel: "Wholesale", amount: 32100, status: "Pending", date: "2025-05-11" },
  { id: "S-1039", customer: "Wayne Enterprises", channel: "Online", amount: 5410, status: "Refunded", date: "2025-05-11" },
  { id: "S-1038", customer: "Umbrella Co.", channel: "Retail", amount: 14820, status: "Paid", date: "2025-05-10" },
  { id: "S-1037", customer: "Acme Holdings", channel: "Wholesale", amount: 27600, status: "Paid", date: "2025-05-10" },
];

const hrAttendance = [
  { dept: "Engineering", present: 92, absent: 4, leave: 4 },
  { dept: "Sales", present: 88, absent: 6, leave: 6 },
  { dept: "Finance", present: 95, absent: 2, leave: 3 },
  { dept: "Operations", present: 90, absent: 5, leave: 5 },
  { dept: "Marketing", present: 86, absent: 8, leave: 6 },
];

const inventoryRows = [
  { sku: "SKU-9012", name: "Industrial Bearing 60mm", stock: 312, reorder: 100, value: 18720, status: "Healthy" },
  { sku: "SKU-9013", name: "Hydraulic Pump V2", stock: 24, reorder: 50, value: 7200, status: "Low" },
  { sku: "SKU-9014", name: "Steel Plate 4mm", stock: 0, reorder: 200, value: 0, status: "Out" },
  { sku: "SKU-9015", name: "Copper Wire 18AWG", stock: 1820, reorder: 500, value: 9100, status: "Healthy" },
  { sku: "SKU-9016", name: "PCB Board R4", stock: 84, reorder: 100, value: 4200, status: "Low" },
];

const productionMetrics = [
  { line: "Line A", oee: 87, output: 1240, defects: 12 },
  { line: "Line B", oee: 79, output: 980, defects: 24 },
  { line: "Line C", oee: 92, output: 1430, defects: 6 },
  { line: "Line D", oee: 68, output: 720, defects: 38 },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Insights across sales, finance, HR, inventory and production."
        breadcrumbs={[{ label: "Workspace" }, { label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filters</Button>
            <ExportMenu />
          </>
        }
      />

      <Tabs defaultValue="sales">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="sales"><ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Sales</TabsTrigger>
          <TabsTrigger value="financial"><DollarSign className="mr-1.5 h-3.5 w-3.5" />Financial</TabsTrigger>
          <TabsTrigger value="hr"><UserCog className="mr-1.5 h-3.5 w-3.5" />HR</TabsTrigger>
          <TabsTrigger value="inventory"><Boxes className="mr-1.5 h-3.5 w-3.5" />Inventory</TabsTrigger>
          <TabsTrigger value="production"><Factory className="mr-1.5 h-3.5 w-3.5" />Production</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="mr-1.5 h-3.5 w-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="export"><Download className="mr-1.5 h-3.5 w-3.5" />Export</TabsTrigger>
        </TabsList>

        {/* SALES */}
        <TabsContent value="sales" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Sales" value="$1.42M" change="+18.4%" trend="up" icon={DollarSign} />
            <StatCard label="Orders" value="3,284" change="+9.1%" trend="up" icon={ShoppingCart} />
            <StatCard label="Avg Order Value" value="$432" change="+3.7%" trend="up" icon={TrendingUp} />
            <StatCard label="Refunds" value="$12.4K" change="-2.1%" trend="down" icon={ArrowDownToLine} accent="bg-warning" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Revenue vs Expenses</CardTitle><CardDescription>Last 12 months</CardDescription></div>
                <Select defaultValue="12m"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="3m">Last 3 months</SelectItem><SelectItem value="6m">Last 6 months</SelectItem><SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent></Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sales by Category</CardTitle><CardDescription>Share of revenue</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={salesByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {salesByCategory.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{c.name}</span>
                      <span className="font-medium">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle>Recent transactions</CardTitle><CardDescription>Detailed sales records</CardDescription></div>
              <ToolbarFilter />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"><Checkbox /></TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesRows.map(r => (
                    <TableRow key={r.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="font-medium">{r.customer}</TableCell>
                      <TableCell><Badge variant="outline">{r.channel}</Badge></TableCell>
                      <TableCell className="text-right font-medium">${r.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "Paid" ? "default" : r.status === "Pending" ? "secondary" : "destructive"}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCIAL */}
        <TabsContent value="financial" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Net Profit" value="$487K" change="+22.5%" trend="up" icon={TrendingUp} accent="bg-success" />
            <StatCard label="Total Revenue" value="$1.42M" change="+18.4%" trend="up" icon={DollarSign} />
            <StatCard label="Total Expenses" value="$932K" change="+11.2%" trend="up" icon={ArrowDownToLine} accent="bg-warning" />
            <StatCard label="Cash on Hand" value="$284K" change="+4.8%" trend="up" icon={DollarSign} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Profit & Loss</CardTitle><CardDescription>Monthly trend</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--warning))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Cash Flow</CardTitle><CardDescription>Operating, investing, financing</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Operating activities", value: "$248,400", pct: 78, color: "bg-primary" },
                  { label: "Investing activities", value: "-$92,100", pct: 32, color: "bg-warning" },
                  { label: "Financing activities", value: "$54,200", pct: 18, color: "bg-info" },
                  { label: "Net change in cash", value: "$210,500", pct: 64, color: "bg-success" },
                ].map(r => (
                  <div key={r.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>{r.label}</span><span className="font-semibold">{r.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HR */}
        <TabsContent value="hr" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Headcount" value="284" change="+12" trend="up" icon={Users} />
            <StatCard label="Attendance" value="91.4%" change="+1.2%" trend="up" icon={UserCog} />
            <StatCard label="Avg Tenure" value="3.2y" icon={TrendingUp} />
            <StatCard label="Open Positions" value="14" icon={Users} accent="bg-info" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Attendance by Department</CardTitle><CardDescription>This month</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hrAttendance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="dept" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" />
                    <Bar dataKey="leave" stackId="a" fill="hsl(var(--warning))" />
                    <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Payroll Summary</CardTitle><CardDescription>May 2025</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Department</TableHead><TableHead className="text-right">Salaries</TableHead><TableHead className="text-right">Bonuses</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {[
                      ["Engineering", 184000, 22000],
                      ["Sales", 142000, 38000],
                      ["Finance", 98000, 8000],
                      ["Operations", 110000, 6000],
                      ["Marketing", 76000, 4000],
                    ].map(([d, s, b]) => (
                      <TableRow key={d as string}>
                        <TableCell className="font-medium">{d}</TableCell>
                        <TableCell className="text-right">${(s as number).toLocaleString()}</TableCell>
                        <TableCell className="text-right">${(b as number).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">${((s as number) + (b as number)).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INVENTORY */}
        <TabsContent value="inventory" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total SKUs" value="1,284" icon={Boxes} />
            <StatCard label="Stock Value" value="$2.1M" change="+6.4%" trend="up" icon={DollarSign} />
            <StatCard label="Low Stock Items" value="32" change="+8" trend="down" icon={Boxes} accent="bg-warning" />
            <StatCard label="Out of Stock" value="7" change="+2" trend="down" icon={Boxes} accent="bg-destructive" />
          </div>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle>Stock Report</CardTitle><CardDescription>Per SKU</CardDescription></div>
              <ToolbarFilter />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead><TableHead>Item</TableHead>
                    <TableHead>Stock</TableHead><TableHead>Reorder Lvl</TableHead>
                    <TableHead className="text-right">Value</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryRows.map(r => (
                    <TableRow key={r.sku}>
                      <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{r.stock}</span>
                          <Progress value={Math.min(100, (r.stock / Math.max(r.reorder * 2, 1)) * 100)} className="h-1.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>{r.reorder}</TableCell>
                      <TableCell className="text-right">${r.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "Healthy" ? "default" : r.status === "Low" ? "secondary" : "destructive"}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTION */}
        <TabsContent value="production" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Output (units)" value="4,370" change="+5.8%" trend="up" icon={Factory} />
            <StatCard label="OEE Avg" value="81.5%" change="+2.1%" trend="up" icon={TrendingUp} accent="bg-success" />
            <StatCard label="Defect Rate" value="1.8%" change="-0.4%" trend="up" icon={Factory} />
            <StatCard label="Downtime" value="42m" change="-12m" trend="up" icon={Factory} accent="bg-warning" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Production Lines</CardTitle><CardDescription>OEE, output and defects</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Line</TableHead><TableHead>OEE</TableHead><TableHead className="text-right">Output</TableHead><TableHead className="text-right">Defects</TableHead><TableHead>Health</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {productionMetrics.map(r => (
                      <TableRow key={r.line}>
                        <TableCell className="font-medium">{r.line}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2"><span className="w-10">{r.oee}%</span><Progress value={r.oee} className="h-1.5 w-32" /></div>
                        </TableCell>
                        <TableCell className="text-right">{r.output.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{r.defects}</TableCell>
                        <TableCell>
                          <Badge variant={r.oee >= 85 ? "default" : r.oee >= 75 ? "secondary" : "destructive"}>
                            {r.oee >= 85 ? "Optimal" : r.oee >= 75 ? "OK" : "Low"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Capacity Utilization</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <RadialBarChart innerRadius="40%" outerRadius="100%" data={[{ name: "Used", value: 78, fill: "hsl(var(--primary))" }]} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-32 text-center"><div className="text-3xl font-bold">78%</div><div className="text-xs text-muted-foreground">of total capacity</div></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Customer Acquisition</CardTitle><CardDescription>New vs returning</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="New" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" name="Returning" stroke="hsl(var(--info))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Funnel</CardTitle><CardDescription>Lead → Customer conversion</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { stage: "Visitors", value: 24800, pct: 100 },
                  { stage: "Leads", value: 4920, pct: 78 },
                  { stage: "Qualified", value: 2104, pct: 54 },
                  { stage: "Proposals", value: 932, pct: 32 },
                  { stage: "Customers", value: 412, pct: 18 },
                ].map(s => (
                  <div key={s.stage} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{s.stage}</span><span className="text-sm font-semibold">{s.value.toLocaleString()}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full gradient-primary" style={{ width: `${s.pct}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Export center</CardTitle><CardDescription>Download reports in your preferred format.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Sales report", icon: ShoppingCart, desc: "All transactions, orders, refunds" },
                { name: "Financial statements", icon: DollarSign, desc: "P&L, balance sheet, cash flow" },
                { name: "HR payroll", icon: UserCog, desc: "Salaries, bonuses, deductions" },
                { name: "Inventory snapshot", icon: Boxes, desc: "Current stock and value" },
                { name: "Production output", icon: Factory, desc: "Line metrics, OEE, defects" },
                { name: "Custom report", icon: BarChart3, desc: "Build your own with the wizard" },
              ].map(r => (
                <Card key={r.name} className="border-2 transition-all hover:border-primary/40 hover:shadow-elegant">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><r.icon className="h-5 w-5" /></div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"><FileSpreadsheet className="mr-1 h-3 w-3" />XLSX</Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"><FileText className="mr-1 h-3 w-3" />CSV</Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs"><FileText className="mr-1 h-3 w-3" />PDF</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Scheduled exports</CardTitle><CardDescription>Recurring email-delivered reports</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Report</TableHead><TableHead>Frequency</TableHead><TableHead>Recipients</TableHead><TableHead>Next run</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    ["Weekly sales digest", "Mondays 8:00", "ops@acme.io, ceo@acme.io", "May 19, 2025"],
                    ["Monthly P&L", "1st of month", "finance@acme.io", "Jun 1, 2025"],
                    ["Daily inventory alerts", "Every day", "warehouse@acme.io", "Tomorrow 7:00"],
                  ].map(([n,f,r,d]) => (
                    <TableRow key={n}>
                      <TableCell className="font-medium">{n}</TableCell>
                      <TableCell>{f}</TableCell>
                      <TableCell className="text-muted-foreground"><span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r}</span></TableCell>
                      <TableCell>{d}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToolbarFilter() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search…" className="h-8 w-44 pl-8" />
      </div>
      <Select defaultValue="all"><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent>
        <SelectItem value="all">All status</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem>
      </SelectContent></Select>
      <Button variant="outline" size="sm" className="h-8"><Filter className="mr-1.5 h-3.5 w-3.5" />Filter</Button>
    </div>
  );
}

function ExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Download className="mr-2 h-4 w-4" />Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Format</DropdownMenuLabel>
        <DropdownMenuItem><FileSpreadsheet className="mr-2 h-4 w-4" />Excel (.xlsx)</DropdownMenuItem>
        <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />CSV</DropdownMenuItem>
        <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
