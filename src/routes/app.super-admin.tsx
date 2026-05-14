import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Activity, AlertTriangle, Building2, CheckCircle2, ChevronDown, CreditCard, Crown,
  DollarSign, Globe, Pause, Play, Plus, Search, Server, ShieldAlert, Trash2,
  TrendingUp, Users, Zap, Database, Mail, MoreHorizontal, Settings,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { revenueData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/super-admin")({ component: SuperAdmin });

const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

const tenantList = [
  { id: "T-1042", name: "Acme Industries", domain: "acme.nebulaerp.com", plan: "Enterprise", users: 284, mrr: 4900, status: "Active", health: 98 },
  { id: "T-1041", name: "Globex Corp.", domain: "globex.nebulaerp.com", plan: "Business", users: 142, mrr: 1800, status: "Active", health: 92 },
  { id: "T-1040", name: "Initech Labs", domain: "initech.nebulaerp.com", plan: "Starter", users: 18, mrr: 290, status: "Trial", health: 85 },
  { id: "T-1039", name: "Stark Industries", domain: "stark.nebulaerp.com", plan: "Enterprise", users: 412, mrr: 6800, status: "Active", health: 96 },
  { id: "T-1038", name: "Wayne Enterprises", domain: "wayne.nebulaerp.com", plan: "Business", users: 98, mrr: 1500, status: "Suspended", health: 0 },
  { id: "T-1037", name: "Umbrella Co.", domain: "umbrella.nebulaerp.com", plan: "Starter", users: 24, mrr: 290, status: "Active", health: 88 },
];

const plans = [
  { name: "Starter", price: 29, users: "Up to 10", storage: "5 GB", features: ["Core ERP", "Email support", "1 branch"], popular: false, subscribers: 124 },
  { name: "Business", price: 149, users: "Up to 100", storage: "100 GB", features: ["Everything in Starter", "Advanced analytics", "API access", "5 branches", "Priority support"], popular: true, subscribers: 86 },
  { name: "Enterprise", price: 499, users: "Unlimited", storage: "1 TB", features: ["Everything in Business", "SSO/SAML", "Dedicated CSM", "Custom SLAs", "Unlimited branches"], popular: false, subscribers: 32 },
];

const services = [
  { name: "API Gateway", status: "Operational", uptime: "99.99%", latency: "84ms" },
  { name: "Database (Postgres)", status: "Operational", uptime: "99.97%", latency: "12ms" },
  { name: "Background Jobs", status: "Degraded", uptime: "99.42%", latency: "1.8s" },
  { name: "Email Pipeline", status: "Operational", uptime: "99.91%", latency: "320ms" },
  { name: "File Storage (S3)", status: "Operational", uptime: "100.00%", latency: "62ms" },
  { name: "Search Index", status: "Operational", uptime: "99.95%", latency: "180ms" },
];

const adminUsers = [
  { name: "Alicia Romero", email: "alicia@acme.io", tenant: "Acme Industries", role: "Tenant Owner", lastActive: "2m ago", status: "Online" },
  { name: "Marcus Chen", email: "marcus@globex.com", tenant: "Globex Corp.", role: "Admin", lastActive: "12m ago", status: "Online" },
  { name: "Bruce Wayne", email: "bruce@wayne.io", tenant: "Wayne Enterprises", role: "Tenant Owner", lastActive: "5d ago", status: "Suspended" },
  { name: "Tony Stark", email: "tony@stark.com", tenant: "Stark Industries", role: "Tenant Owner", lastActive: "1h ago", status: "Online" },
  { name: "Hana Kobayashi", email: "hana@initech.io", tenant: "Initech Labs", role: "Admin", lastActive: "3h ago", status: "Idle" },
];

function SuperAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin"
        description="Multi-tenant control plane for the entire SaaS platform."
        breadcrumbs={[{ label: "Platform" }, { label: "Super Admin" }]}
        actions={<Badge variant="outline" className="gap-1.5"><Crown className="h-3 w-3 text-warning" />SuperAdmin</Badge>}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="overview"><Activity className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="tenants"><Building2 className="mr-1.5 h-3.5 w-3.5" />Tenants</TabsTrigger>
          <TabsTrigger value="plans"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Plans</TabsTrigger>
          <TabsTrigger value="billing"><DollarSign className="mr-1.5 h-3.5 w-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="revenue"><TrendingUp className="mr-1.5 h-3.5 w-3.5" />Revenue</TabsTrigger>
          <TabsTrigger value="monitoring"><Server className="mr-1.5 h-3.5 w-3.5" />Monitoring</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1.5 h-3.5 w-3.5" />Users</TabsTrigger>
          <TabsTrigger value="global"><Globe className="mr-1.5 h-3.5 w-3.5" />Global</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Tenants" value="284" change="+12 this month" trend="up" icon={Building2} />
            <StatCard label="MRR" value="$184K" change="+22.5%" trend="up" icon={DollarSign} accent="bg-success" />
            <StatCard label="Active Users" value="14,820" change="+8.3%" trend="up" icon={Users} />
            <StatCard label="Churn" value="1.8%" change="-0.4%" trend="up" icon={TrendingUp} accent="bg-warning" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Platform growth</CardTitle><CardDescription>MRR and active tenants</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs><linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#mrr)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={plans.map(p => ({ name: p.name, value: p.subscribers }))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {plans.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {plans.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{p.name}</span>
                      <span className="font-medium">{p.subscribers}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TENANTS */}
        <TabsContent value="tenants" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle>Tenant management</CardTitle><CardDescription>All workspaces on the platform</CardDescription></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search tenants…" className="h-8 w-56 pl-8" /></div>
                <Select defaultValue="all"><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="all">All plans</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="starter">Starter</SelectItem>
                </SelectContent></Select>
                <NewTenantDialog />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tenant</TableHead><TableHead>Plan</TableHead><TableHead className="text-right">Users</TableHead><TableHead className="text-right">MRR</TableHead><TableHead>Status</TableHead><TableHead>Health</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {tenantList.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-xs font-semibold text-primary-foreground">{t.name.split(" ").map(s=>s[0]).join("").slice(0,2)}</div>
                          <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.domain}</p></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={t.plan === "Enterprise" ? "default" : t.plan === "Business" ? "secondary" : "outline"}>{t.plan}</Badge></TableCell>
                      <TableCell className="text-right">{t.users.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${t.mrr.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Active" ? "default" : t.status === "Trial" ? "secondary" : "destructive"}>{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2"><span className="w-9 text-xs">{t.health}%</span><Progress value={t.health} className="h-1.5 w-20" /></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Tenant actions</DropdownMenuLabel>
                            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Manage</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Email owner</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {t.status === "Suspended"
                              ? <DropdownMenuItem><Play className="mr-2 h-4 w-4" />Activate</DropdownMenuItem>
                              : <DropdownMenuItem><Pause className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS */}
        <TabsContent value="plans" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map(p => (
              <Card key={p.name} className={cn("relative overflow-hidden", p.popular && "border-primary ring-2 ring-primary/30")}>
                {p.popular && <div className="absolute right-3 top-3"><Badge className="gradient-primary text-primary-foreground border-0">Popular</Badge></div>}
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <div className="flex items-baseline gap-1"><span className="text-4xl font-bold">${p.price}</span><span className="text-sm text-muted-foreground">/mo</span></div>
                  <CardDescription>{p.users} users · {p.storage} storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{p.subscribers}</span> active subscribers</div>
                  <ul className="space-y-2 text-sm">
                    {p.features.map(f => (
                      <li key={f} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" />{f}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1">Edit</Button>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" />Create new plan</Button>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Outstanding" value="$48.2K" change="-12%" trend="up" icon={DollarSign} accent="bg-warning" />
            <StatCard label="Collected (30d)" value="$184K" change="+22.5%" trend="up" icon={DollarSign} accent="bg-success" />
            <StatCard label="Failed payments" value="14" change="+3" trend="down" icon={AlertTriangle} accent="bg-destructive" />
            <StatCard label="Refunds" value="$2.4K" change="-1.1%" trend="up" icon={CreditCard} />
          </div>
          <Card>
            <CardHeader><CardTitle>Recent invoices</CardTitle><CardDescription>Across all tenants</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Tenant</TableHead><TableHead>Plan</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Issued</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    ["INV-9012", "Acme Industries", "Enterprise", 4900, "Paid", "May 1"],
                    ["INV-9011", "Globex Corp.", "Business", 1800, "Paid", "May 1"],
                    ["INV-9010", "Stark Industries", "Enterprise", 6800, "Paid", "May 1"],
                    ["INV-9009", "Wayne Enterprises", "Business", 1500, "Failed", "May 1"],
                    ["INV-9008", "Initech Labs", "Starter", 290, "Pending", "Apr 28"],
                  ].map(([id, t, p, a, s, d]) => (
                    <TableRow key={id as string}>
                      <TableCell className="font-mono text-xs">{id}</TableCell>
                      <TableCell className="font-medium">{t}</TableCell>
                      <TableCell><Badge variant="outline">{p}</Badge></TableCell>
                      <TableCell className="text-right">${(a as number).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={s === "Paid" ? "default" : s === "Failed" ? "destructive" : "secondary"}>{s}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{d}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVENUE */}
        <TabsContent value="revenue" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="ARR" value="$2.21M" change="+24.1%" trend="up" icon={TrendingUp} accent="bg-success" />
            <StatCard label="ARPU" value="$648" change="+4.2%" trend="up" icon={DollarSign} />
            <StatCard label="LTV" value="$8,420" change="+11.6%" trend="up" icon={Users} />
            <StatCard label="CAC" value="$412" change="-3.8%" trend="up" icon={DollarSign} />
          </div>
          <Card>
            <CardHeader><CardTitle>Revenue by plan</CardTitle><CardDescription>Last 12 months</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData.map(d => ({ ...d, starter: d.revenue * 0.1, business: d.revenue * 0.4, enterprise: d.revenue * 0.5 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="starter" stackId="a" fill={COLORS[0]} />
                  <Bar dataKey="business" stackId="a" fill={COLORS[1]} />
                  <Bar dataKey="enterprise" stackId="a" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MONITORING */}
        <TabsContent value="monitoring" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Uptime (30d)" value="99.97%" icon={CheckCircle2} accent="bg-success" />
            <StatCard label="Avg Response" value="142ms" change="-12ms" trend="up" icon={Zap} />
            <StatCard label="Error Rate" value="0.04%" change="+0.01%" trend="down" icon={AlertTriangle} accent="bg-warning" />
            <StatCard label="DB Connections" value="284/500" icon={Database} />
          </div>
          <Card>
            <CardHeader><CardTitle>Service status</CardTitle><CardDescription>Live infrastructure health</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 rounded-full",
                      s.status === "Operational" ? "bg-success animate-pulse" :
                      s.status === "Degraded" ? "bg-warning" : "bg-destructive")} />
                    <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">Uptime {s.uptime} · Latency {s.latency}</p></div>
                  </div>
                  <Badge variant={s.status === "Operational" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Request volume</CardTitle><CardDescription>Last 24 hours</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, req: Math.floor(2000 + Math.sin(i / 3) * 1200 + Math.random() * 400) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="req" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER MONITORING */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle>User monitoring</CardTitle><CardDescription>Activity across all tenants</CardDescription></div>
              <div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search users…" className="h-8 w-64 pl-8" /></div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Tenant</TableHead><TableHead>Role</TableHead><TableHead>Last active</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {adminUsers.map(u => (
                    <TableRow key={u.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{u.name.split(" ").map(s=>s[0]).join("")}</AvatarFallback></Avatar>
                          <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{u.tenant}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Online" ? "default" : u.status === "Suspended" ? "destructive" : "secondary"}>{u.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GLOBAL SETTINGS */}
        <TabsContent value="global" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Platform settings</CardTitle><CardDescription>Apply globally to all tenants.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {[
                { t: "Allow new tenant signups", d: "Public registration of new workspaces.", on: true },
                { t: "Require email verification", d: "New users must verify their email.", on: true },
                { t: "Enforce 2FA for admins", d: "Tenant owners must enable 2FA.", on: false },
                { t: "Maintenance mode", d: "Show banner and block writes during deploys.", on: false },
                { t: "Allow custom domains", d: "Tenants can map their own domain.", on: true },
              ].map(s => (
                <div key={s.t} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="font-medium">{s.t}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Switch defaultChecked={s.on} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Limits</CardTitle><CardDescription>Default quotas per plan.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 max-w-3xl">
              <div className="space-y-1.5"><Label>Max API requests / min</Label><Input defaultValue="1200" /></div>
              <div className="space-y-1.5"><Label>Max upload size (MB)</Label><Input defaultValue="50" /></div>
              <div className="space-y-1.5"><Label>Trial period (days)</Label><Input defaultValue="14" /></div>
              <div className="space-y-1.5"><Label>Free seats per tenant</Label><Input defaultValue="3" /></div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><ShieldAlert className="h-4 w-4" />Danger zone</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div><p className="font-medium">Force logout all users</p><p className="text-xs text-muted-foreground">Invalidate every active session across all tenants.</p></div>
                <Button variant="destructive" size="sm">Force logout</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div><p className="font-medium">Purge inactive trials</p><p className="text-xs text-muted-foreground">Permanently delete trials inactive {">"}30 days.</p></div>
                <Button variant="destructive" size="sm">Purge</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewTenantDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />New tenant</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create tenant</DialogTitle><DialogDescription>Provision a new workspace on the platform.</DialogDescription></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2"><Label>Company name</Label><Input placeholder="Acme Inc." /></div>
          <div className="space-y-1.5"><Label>Subdomain</Label><div className="flex"><Input className="rounded-r-none" placeholder="acme" /><span className="inline-flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-xs text-muted-foreground">.nebulaerp.com</span></div></div>
          <div className="space-y-1.5"><Label>Plan</Label>
            <Select defaultValue="business"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="starter">Starter</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Owner email</Label><Input type="email" placeholder="owner@acme.com" /></div>
          <div className="space-y-1.5"><Label>Region</Label>
            <Select defaultValue="eu"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="eu">Europe</SelectItem><SelectItem value="us">United States</SelectItem><SelectItem value="ap">Asia Pacific</SelectItem>
            </SelectContent></Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setOpen(false)}>Create tenant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
