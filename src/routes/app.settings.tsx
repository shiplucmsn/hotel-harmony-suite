import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, MapPin, DollarSign, Receipt, Mail, MessageSquare, CreditCard,
  Palette, Globe, User, Plus, Trash2, Sun, Moon, Monitor, ShieldCheck, Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { api } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-errors";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

const tabs = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "currency", label: "Currency", icon: DollarSign },
  { id: "tax", label: "Tax", icon: Receipt },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS Gateway", icon: MessageSquare },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "locale", label: "Localization", icon: Globe },
  { id: "profile", label: "Profile", icon: User },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your workspace, integrations and branding."
        breadcrumbs={[{ label: "Account" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="company" orientation="vertical" className="flex flex-col gap-6 lg:flex-row">
        <TabsList className="h-auto flex-row flex-wrap justify-start lg:flex-col lg:w-56 lg:items-stretch lg:bg-muted/40 lg:p-2">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="justify-start gap-2 lg:w-full">
              <t.icon className="h-4 w-4" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 space-y-4">
          <TabsContent value="company"><CompanyTab /></TabsContent>
          <TabsContent value="branches"><BranchesTab /></TabsContent>
          <TabsContent value="currency"><CurrencyTab /></TabsContent>
          <TabsContent value="tax"><TaxTab /></TabsContent>
          <TabsContent value="email"><EmailTab /></TabsContent>
          <TabsContent value="sms"><SmsTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="theme"><ThemeTab /></TabsContent>
          <TabsContent value="locale"><LocaleTab /></TabsContent>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/* ============ Company ============ */
function CompanyTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Company information</CardTitle><CardDescription>Used across invoices, emails and the public portal.</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Company updated"); }} className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <div className="space-y-1.5 md:col-span-2 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary text-primary-foreground text-2xl font-bold">A</div>
            <div className="flex-1 space-y-1.5">
              <Label>Company logo</Label>
              <div className="flex gap-2"><Button type="button" variant="outline" size="sm">Upload</Button><Button type="button" variant="ghost" size="sm">Remove</Button></div>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Legal name</Label><Input defaultValue="Acme Industries Ltd." /></div>
          <div className="space-y-1.5"><Label>Trading name</Label><Input defaultValue="Acme" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue="hello@acme.io" /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+49 30 1234 5678" /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Address</Label><Textarea rows={2} defaultValue="Friedrichstr. 200, 10117 Berlin, Germany" /></div>
          <div className="space-y-1.5"><Label>Website</Label><Input defaultValue="https://acme.io" /></div>
          <div className="space-y-1.5"><Label>Tax ID</Label><Input defaultValue="DE123456789" /></div>
          <Button type="submit" className="w-fit gradient-primary text-primary-foreground border-0 md:col-span-2">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ============ Branches ============ */
function BranchesTab() {
  const branches = [
    { id: 1, name: "Berlin HQ", city: "Berlin, DE", manager: "Alicia Romero", staff: 84, status: "Active" },
    { id: 2, name: "London Office", city: "London, UK", manager: "Liam O'Connor", staff: 32, status: "Active" },
    { id: 3, name: "NYC Showroom", city: "New York, US", manager: "Marcus Chen", staff: 18, status: "Active" },
    { id: 4, name: "Mumbai Hub", city: "Mumbai, IN", manager: "Priya Natarajan", staff: 46, status: "Setup" },
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle>Branches</CardTitle><CardDescription>Manage office and warehouse locations.</CardDescription></div>
        <BranchSheet />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Manager</TableHead><TableHead className="text-right">Staff</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {branches.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.city}</TableCell>
                <TableCell>{b.manager}</TableCell>
                <TableCell className="text-right">{b.staff}</TableCell>
                <TableCell><Badge variant={b.status === "Active" ? "default" : "secondary"}>{b.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BranchSheet() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add branch</Button></SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px]">
        <SheetHeader><SheetTitle>New branch</SheetTitle><SheetDescription>Create a new location for your business.</SheetDescription></SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label>Branch name</Label><Input placeholder="e.g. Tokyo Office" /></div>
          <div className="space-y-1.5"><Label>City / country</Label><Input placeholder="Tokyo, JP" /></div>
          <div className="space-y-1.5"><Label>Manager</Label><Input placeholder="Pick a user…" /></div>
          <div className="space-y-1.5"><Label>Address</Label><Textarea rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Timezone</Label><Input defaultValue="UTC+9" /></div>
            <div className="space-y-1.5"><Label>Currency</Label><Input defaultValue="JPY" /></div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setOpen(false); toast.success("Branch created"); }}>Create branch</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ============ Currency ============ */
function CurrencyTab() {
  const list = [
    { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0, base: true },
    { code: "EUR", symbol: "€", name: "Euro", rate: 0.93 },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
    { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.2 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 148.5 },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rate: 110.4 },
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle>Currencies</CardTitle><CardDescription>Manage base currency and exchange rates.</CardDescription></div>
        <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add currency</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Symbol</TableHead><TableHead className="text-right">Rate (vs base)</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map(c => (
              <TableRow key={c.code}>
                <TableCell className="font-mono font-semibold">{c.code} {c.base && <Badge className="ml-1">Base</Badge>}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-lg">{c.symbol}</TableCell>
                <TableCell className="text-right font-mono">{c.rate}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ============ Tax ============ */
function TaxTab() {
  const taxes = [
    { name: "VAT (Standard)", rate: "19%", region: "Germany", type: "Inclusive" },
    { name: "VAT (Reduced)", rate: "7%", region: "Germany", type: "Inclusive" },
    { name: "GST", rate: "18%", region: "India", type: "Exclusive" },
    { name: "Sales Tax", rate: "8.875%", region: "New York, US", type: "Exclusive" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div><CardTitle>Tax rates</CardTitle><CardDescription>Configure rates per region or product type.</CardDescription></div>
          <TaxDialog />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Rate</TableHead><TableHead>Region</TableHead><TableHead>Type</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {taxes.map(t => (
                <TableRow key={t.name}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="font-mono">{t.rate}</TableCell>
                  <TableCell>{t.region}</TableCell>
                  <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tax preferences</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { t: "Prices include tax", d: "Display product prices with tax included by default." },
            { t: "Charge tax on shipping", d: "Apply tax to shipping fees on orders." },
            { t: "Round at line item", d: "Round taxes per line instead of order total." },
          ].map((s,i) => (
            <div key={s.t} className="flex items-center justify-between rounded-lg border p-4">
              <div><p className="font-medium">{s.t}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
              <Switch defaultChecked={i === 0} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function TaxDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add tax</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New tax rate</DialogTitle><DialogDescription>Define a tax rate to apply on invoices.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input placeholder="e.g. VAT 21%" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Rate (%)</Label><Input type="number" placeholder="21" /></div>
            <div className="space-y-1.5"><Label>Type</Label>
              <Select defaultValue="exclusive"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="inclusive">Inclusive</SelectItem><SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Region</Label><Input placeholder="e.g. Netherlands" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setOpen(false); toast.success("Tax added"); }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Email ============ */
function EmailTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("tls");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [hasSavedPassword, setHasSavedPassword] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<{
          data?: {
            smtp?: {
              host?: string | null;
              port?: number | null;
              username?: string | null;
              encryption?: string | null;
              from_name?: string | null;
              from_address?: string | null;
              reply_to?: string | null;
              has_password?: boolean;
            } | null;
          };
        }>("/v1/company/smtp");

        const smtp = res.data?.smtp;
        if (!active || !smtp) return;
        setHost(smtp.host ?? "");
        setPort(String(smtp.port ?? 587));
        setUsername(smtp.username ?? "");
        setEncryption((smtp.encryption ?? "tls") || "none");
        setFromName(smtp.from_name ?? "");
        setFromEmail(smtp.from_address ?? "");
        setReplyTo(smtp.reply_to ?? "");
        setHasSavedPassword(Boolean(smtp.has_password));
      } catch {
        // keep empty defaults for first-time setup
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>SMTP configuration</CardTitle><CardDescription>Send transactional emails from your domain.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <div className="space-y-1.5 md:col-span-2"><Label>Provider</Label>
            <Select value="smtp" disabled><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="smtp">Custom SMTP</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>From name</Label><Input value={fromName} onChange={(e) => setFromName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>From email</Label><Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} type="email" /></div>
          <div className="space-y-1.5"><Label>SMTP host</Label><Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.yourdomain.com" /></div>
          <div className="space-y-1.5"><Label>Port</Label><Input value={port} onChange={(e) => setPort(e.target.value)} type="number" /></div>
          <div className="space-y-1.5"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={hasSavedPassword ? "•••••••• (leave blank to keep)" : "Enter SMTP password"} /></div>
          <div className="space-y-1.5"><Label>Encryption</Label>
            <Select value={encryption} onValueChange={setEncryption}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="tls">TLS</SelectItem><SelectItem value="ssl">SSL</SelectItem><SelectItem value="none">None</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Reply-to (optional)</Label><Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} type="email" /></div>
          <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-3">
            <div><p className="text-sm font-medium">Credential status</p><p className="text-xs text-muted-foreground">Encrypted and stored per-company</p></div>
            <Badge className="gap-1" variant={hasSavedPassword ? "default" : "secondary"}><ShieldCheck className="h-3 w-3" />{hasSavedPassword ? "Configured" : "Not configured"}</Badge>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Test recipient (optional)</Label>
            <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} type="email" placeholder="Leave empty to send to your own account" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button
              variant="outline"
              disabled={loading || testing}
              onClick={async () => {
                setTesting(true);
                try {
                  await api.post("/v1/company/smtp/test", testTo ? { to: testTo } : {});
                  toast.success("Test email sent");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Failed to send test email"));
                } finally {
                  setTesting(false);
                }
              }}
            >
              {testing ? "Sending..." : "Send test"}
            </Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              disabled={loading || saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await api.put("/v1/company/smtp", {
                    host,
                    port: Number(port),
                    username: username || null,
                    password: password || null,
                    encryption,
                    from_address: fromEmail,
                    from_name: fromName || null,
                    reply_to: replyTo || null,
                  });
                  if (password) setPassword("");
                  setHasSavedPassword(true);
                  toast.success("SMTP settings saved");
                } catch (error) {
                  toast.error(getApiErrorMessage(error, "Failed to save SMTP settings"));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============ SMS ============ */
function SmsTab() {
  const providers = [
    { name: "Twilio", logo: "T", connected: true, balance: "$248.40" },
    { name: "Vonage", logo: "V", connected: false },
    { name: "MessageBird", logo: "M", connected: false },
    { name: "Plivo", logo: "P", connected: false },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>SMS gateways</CardTitle><CardDescription>Connect a provider to send SMS messages.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {providers.map(p => (
          <div key={p.name} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold">{p.logo}</div>
              <div><p className="font-medium">{p.name}</p>{p.connected ? <p className="text-xs text-muted-foreground">Balance: {p.balance}</p> : <p className="text-xs text-muted-foreground">Not connected</p>}</div>
            </div>
            <Button size="sm" variant={p.connected ? "outline" : "default"} className={p.connected ? "" : "gradient-primary text-primary-foreground border-0"}>{p.connected ? "Manage" : "Connect"}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ============ Payments ============ */
function PaymentsTab() {
  const gateways = [
    { name: "Stripe", desc: "Cards, Apple Pay, Google Pay", connected: true, color: "bg-info/10 text-info" },
    { name: "PayPal", desc: "Wallet & express checkout", connected: true, color: "bg-warning/10 text-warning" },
    { name: "Razorpay", desc: "India · UPI, cards, netbanking", connected: false, color: "bg-primary/10 text-primary" },
    { name: "SSLCommerz", desc: "Bangladesh · cards, mobile wallets", connected: false, color: "bg-success/10 text-success" },
    { name: "Bank transfer", desc: "Manual reconciliation", connected: true, color: "bg-muted text-muted-foreground" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Payment gateways</CardTitle><CardDescription>Accept online payments from customers.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {gateways.map(g => (
          <div key={g.name} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${g.color}`}>{g.name[0]}</div>
              <div><p className="font-medium">{g.name}</p><p className="text-xs text-muted-foreground">{g.desc}</p></div>
            </div>
            <div className="flex items-center gap-3">
              {g.connected && <Badge className="gap-1"><ShieldCheck className="h-3 w-3" />Active</Badge>}
              <Switch defaultChecked={g.connected} />
              <Button size="sm" variant="outline">Configure</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ============ Theme ============ */
function ThemeTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Choose how the app looks for you.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ] as const).map(opt => (
              <button key={opt.id}
                onClick={() => opt.id === "system" ? setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : setTheme(opt.id as "light"|"dark")}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${theme === opt.id ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}>
                <div className="flex items-center justify-between"><span className="font-medium">{opt.label}</span><opt.icon className="h-4 w-4" /></div>
                <div className={`mt-3 h-20 rounded-md border ${opt.id === "dark" ? "bg-zinc-900" : opt.id === "light" ? "bg-white" : "bg-linear-to-br from-white to-zinc-900"}`}>
                  <div className={`h-2 rounded-t-md ${opt.id === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`} />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Brand color</CardTitle><CardDescription>Accent color for buttons, links and highlights.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899","#0f172a"].map(c => (
              <button key={c} className="h-10 w-10 rounded-lg border-2 border-transparent ring-offset-2 transition-all hover:scale-110 hover:ring-2 hover:ring-foreground/20" style={{ background: c }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============ Localization ============ */
function LocaleTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Localization</CardTitle><CardDescription>Language, timezone, date and number formats.</CardDescription></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 max-w-3xl">
        <div className="space-y-1.5"><Label>Language</Label>
          <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="en">English (US)</SelectItem><SelectItem value="en-gb">English (UK)</SelectItem><SelectItem value="de">Deutsch</SelectItem><SelectItem value="fr">Français</SelectItem><SelectItem value="es">Español</SelectItem><SelectItem value="bn">বাংলা (Bangla)</SelectItem><SelectItem value="hi">हिन्दी</SelectItem><SelectItem value="ar">العربية</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>Timezone</Label>
          <Select defaultValue="berlin"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="berlin">(GMT+1) Berlin</SelectItem><SelectItem value="london">(GMT) London</SelectItem><SelectItem value="ny">(GMT-5) New York</SelectItem><SelectItem value="dhaka">(GMT+6) Dhaka</SelectItem><SelectItem value="tokyo">(GMT+9) Tokyo</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>Date format</Label>
          <Select defaultValue="dmy"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="dmy">DD/MM/YYYY</SelectItem><SelectItem value="mdy">MM/DD/YYYY</SelectItem><SelectItem value="ymd">YYYY-MM-DD</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>First day of week</Label>
          <Select defaultValue="mon"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="mon">Monday</SelectItem><SelectItem value="sun">Sunday</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-4">
          <div><p className="font-medium">RTL layout</p><p className="text-xs text-muted-foreground">Enable right-to-left for Arabic, Hebrew, Urdu.</p></div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

/* ============ Profile ============ */
function ProfileTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your personal information.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20"><AvatarFallback className="gradient-primary text-primary-foreground text-2xl">AR</AvatarFallback></Avatar>
            <div className="space-y-2"><div className="flex gap-2"><Button variant="outline" size="sm">Upload new</Button><Button variant="ghost" size="sm">Remove</Button></div><p className="text-xs text-muted-foreground">JPG, PNG · max 2MB</p></div>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
            <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue="Alicia Romero" /></div>
            <div className="space-y-1.5"><Label>Job title</Label><Input defaultValue="Operations Director" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue="alicia@acme.io" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+49 170 123 4567" /></div>
            <div className="space-y-1.5 md:col-span-2"><Label>Bio</Label><Textarea rows={3} defaultValue="Director of operations at Acme Industries." /></div>
            <Button className="md:col-span-2 w-fit gradient-primary text-primary-foreground border-0">Save profile</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Security</CardTitle><CardDescription>Password, 2FA and active sessions.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div><p className="font-medium">Two-factor authentication</p><p className="text-xs text-muted-foreground">Authenticator app · enabled</p></div>
            <Badge className="gap-1"><ShieldCheck className="h-3 w-3" />On</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div><p className="font-medium">Password</p><p className="text-xs text-muted-foreground">Last changed 3 months ago</p></div>
            <Button size="sm" variant="outline">Change</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
