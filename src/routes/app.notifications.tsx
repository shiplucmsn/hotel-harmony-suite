import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell, BellRing, Check, CheckCheck, MessageCircle, Mail, MessageSquare, Smartphone,
  Search, Settings2, Filter, Send, Activity, Phone, AlertTriangle, CheckCircle2, Info,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import type { NotificationDto } from "@/modules/core/notifications-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { recentActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({ component: NotificationsPage });

const channelTabs = [
  { id: "inbox", label: "Inbox", icon: Bell },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "push", label: "Push", icon: Smartphone },
  { id: "activity", label: "Activity", icon: Activity },
];

const emailLog = [
  { id: "e1", to: "alicia@acme.io", subject: "Welcome to Nebula ERP", template: "welcome", status: "Delivered", opened: true, time: "3 min ago" },
  { id: "e2", to: "marcus@acme.io", subject: "Your invoice INV-2049", template: "invoice", status: "Delivered", opened: false, time: "12 min ago" },
  { id: "e3", to: "noah@globex.com", subject: "Password reset", template: "auth-reset", status: "Bounced", opened: false, time: "1h ago" },
  { id: "e4", to: "team@initech.io", subject: "Weekly digest", template: "digest", status: "Queued", opened: false, time: "Pending" },
];

const smsLog = [
  { id: "s1", to: "+1 415 555 0142", body: "Your OTP is 482911.", status: "Delivered", time: "1 min ago" },
  { id: "s2", to: "+44 20 7946 0123", body: "Order #1042 shipped.", status: "Delivered", time: "8 min ago" },
  { id: "s3", to: "+91 98 7654 3210", body: "Payment of ₹4,820 received.", status: "Failed", time: "30 min ago" },
];

const waLog = [
  { id: "w1", to: "+1 415 555 0142", template: "order_confirmation", body: "Hi Marcus, your order #1042 is confirmed.", status: "Read", time: "2 min ago" },
  { id: "w2", to: "+44 20 7946 0123", template: "shipping_update", body: "Tracking: NEB39281", status: "Delivered", time: "1h ago" },
];

const pushLog = [
  { id: "p1", title: "New deal won", device: "iOS · iPhone 15", status: "Delivered", time: "5 min ago" },
  { id: "p2", title: "Inventory low: SKU-9013", device: "Android · Pixel 8", status: "Delivered", time: "20 min ago" },
  { id: "p3", title: "Quarterly report ready", device: "Web · Chrome", status: "Clicked", time: "2h ago" },
];

const typeIcon = {
  success: { icon: CheckCircle2, cls: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, cls: "text-warning bg-warning/10" },
  info: { icon: Info, cls: "text-info bg-info/10" },
};

function notificationVisual(n: NotificationDto) {
  if (n.type.includes("warning") || n.type.includes("failed")) return typeIcon.warning;
  if (n.type.includes("success") || n.type.includes("approved")) return typeIcon.success;
  return typeIcon.info;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data: unread = 0 } = useUnreadNotificationCount();
  const { data: listRes, isLoading } = useNotifications({
    per_page: 50,
    unread: filter === "unread" ? true : undefined,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const list = listRes?.data ?? [];
  const preview = useMemo(() => list.find((n) => n.unread) ?? list[0], [list]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Email, SMS, WhatsApp and push — all in one place."
        breadcrumbs={[{ label: "Account" }, { label: "Notifications" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4" />Preferences</Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground border-0"
              disabled={unread === 0 || markAllRead.isPending}
              onClick={() => void markAllRead.mutateAsync()}
            >
              <CheckCheck className="mr-2 h-4 w-4" />Mark all read
            </Button>
          </>
        }
      />

      <Tabs defaultValue="inbox">
        <TabsList className="flex h-auto flex-wrap">
          {channelTabs.map(t => (
            <TabsTrigger key={t.id} value={t.id}>
              <t.icon className="mr-1.5 h-3.5 w-3.5" />{t.label}
              {t.id === "inbox" && unread > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5">{unread}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* INBOX */}
        <TabsContent value="inbox" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button size="sm" variant={filter === "all" ? "secondary" : "ghost"} onClick={() => setFilter("all")}>All</Button>
                  <Button size="sm" variant={filter === "unread" ? "secondary" : "ghost"} onClick={() => setFilter("unread")}>Unread <Badge variant="secondary" className="ml-1.5">{unread}</Badge></Button>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search notifications…" className="h-8 w-56 pl-8" />
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {isLoading && (
                  <p className="p-6 text-center text-sm text-muted-foreground">Loading notifications…</p>
                )}
                {!isLoading && list.length === 0 && (
                  <div className="p-6"><EmptyState icon={Bell} title="You're all caught up" description="No unread notifications." /></div>
                )}
                {!isLoading && list.map(n => {
                  const m = notificationVisual(n);
                  const Icon = m.icon;
                  return (
                    <div key={n.id} className={cn("flex gap-4 p-4 hover:bg-muted/40 transition-colors", n.unread && "bg-primary/[0.03]")}>
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", m.cls)}><Icon className="h-5 w-5" /></div>
                      <button
                        type="button"
                        className="flex-1 min-w-0 text-left"
                        onClick={() => {
                          if (n.unread) void markRead.mutate(n.id);
                          const url = typeof n.data?.action_url === "string" ? n.data.action_url : undefined;
                          if (url) navigate({ to: url });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{n.title}</p>
                          {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          <Badge variant="outline" className="ml-auto text-[10px] capitalize">{n.type.split(".")[0]}</Badge>
                        </div>
                        {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">{n.time ?? "—"}</p>
                      </button>
                      {n.unread && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Mark as read"
                          disabled={markRead.isPending}
                          onClick={() => void markRead.mutate(n.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Notification preview</CardTitle><CardDescription>How alerts appear</CardDescription></CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground"><BellRing className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{preview?.title ?? "Nebula ERP"}</p>
                      <p className="text-sm text-muted-foreground">{preview?.body ?? "Notifications appear here in real time."}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{preview?.time ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Channels enabled</p>
                  {[["Email", true], ["SMS", true], ["WhatsApp", false], ["Push", true], ["In-app", true]].map(([l, v]) => (
                    <div key={l as string} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{l}</span>
                      <Switch defaultChecked={v as boolean} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EMAIL */}
        <TabsContent value="email" className="mt-6 space-y-4">
          <ChannelStats sent={4820} delivered={4716} opened={2148} failed={104} accent="text-info" />
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Email log</CardTitle><CardDescription>Recent outgoing emails</CardDescription></div>
                <Button size="sm" variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
              </CardHeader>
              <CardContent className="p-0">
                {emailLog.map(e => (
                  <div key={e.id} className="flex items-center gap-3 border-b p-4 last:border-0">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{e.to.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{e.subject}</p><Badge variant="outline" className="text-[10px]">{e.template}</Badge></div>
                      <p className="truncate text-xs text-muted-foreground">{e.to} · {e.time}</p>
                    </div>
                    <Badge variant={e.status === "Delivered" ? "default" : e.status === "Bounced" ? "destructive" : "secondary"}>{e.status}</Badge>
                    {e.opened && <Badge variant="outline" className="text-[10px]">Opened</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
            <ComposeCard channel="email" />
          </div>
        </TabsContent>

        {/* SMS */}
        <TabsContent value="sms" className="mt-6 space-y-4">
          <ChannelStats sent={1284} delivered={1262} opened={0} failed={22} accent="text-warning" />
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader><CardTitle>SMS log</CardTitle><CardDescription>Outbound text messages</CardDescription></CardHeader>
              <CardContent className="p-0">
                {smsLog.map(s => (
                  <div key={s.id} className="flex items-center gap-3 border-b p-4 last:border-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning"><Phone className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.to}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.body}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.time}</span>
                    <Badge variant={s.status === "Delivered" ? "default" : "destructive"}>{s.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <ComposeCard channel="sms" />
          </div>
        </TabsContent>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp" className="mt-6 space-y-4">
          <ChannelStats sent={482} delivered={478} opened={392} failed={4} accent="text-success" />
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader><CardTitle>WhatsApp messages</CardTitle><CardDescription>Template-based outreach</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {waLog.map(w => (
                  <div key={w.id} className="rounded-2xl bg-success/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{w.to}</span>
                      <Badge variant="outline" className="text-[10px]">{w.template}</Badge>
                    </div>
                    <p className="mt-1 text-sm">{w.body}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <span>{w.time}</span><CheckCheck className={cn("h-3 w-3", w.status === "Read" && "text-info")} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <ComposeCard channel="whatsapp" />
          </div>
        </TabsContent>

        {/* PUSH */}
        <TabsContent value="push" className="mt-6 space-y-4">
          <ChannelStats sent={9482} delivered={9320} opened={3104} failed={162} accent="text-primary" />
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader><CardTitle>Push notifications</CardTitle><CardDescription>Web & mobile</CardDescription></CardHeader>
              <CardContent className="p-0">
                {pushLog.map(p => (
                  <div key={p.id} className="flex items-center gap-3 border-b p-4 last:border-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><BellRing className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.device}</p></div>
                    <span className="text-xs text-muted-foreground">{p.time}</span>
                    <Badge variant={p.status === "Clicked" ? "default" : "secondary"}>{p.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <ComposeCard channel="push" />
          </div>
        </TabsContent>

        {/* ACTIVITY */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Activity feed</CardTitle><CardDescription>Everything that happened across the workspace</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px] pr-2">
                <div className="relative space-y-5 pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                  {recentActivity.map(a => (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{a.user.split(" ").map(s=>s[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <p className="text-sm"><span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></p>
                          <p className="text-xs text-muted-foreground">{a.time}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChannelStats({ sent, delivered, opened, failed, accent }: { sent: number; delivered: number; opened: number; failed: number; accent: string }) {
  const items = [
    { l: "Sent", v: sent }, { l: "Delivered", v: delivered }, { l: "Opened", v: opened }, { l: "Failed", v: failed },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map(i => (
        <Card key={i.l}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.l}</p>
            <p className={cn("mt-1 text-2xl font-semibold tracking-tight", accent)}>{i.v.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ComposeCard({ channel }: { channel: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Send a {channel}</CardTitle><CardDescription>Compose and broadcast</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5"><Label>Recipient</Label><Input placeholder="Pick segment or contact…" /></div>
        <div className="space-y-1.5"><Label>Template</Label>
          <Select defaultValue="custom"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="custom">Custom message</SelectItem><SelectItem value="welcome">Welcome</SelectItem><SelectItem value="otp">OTP</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} placeholder="Type your message…" /></div>
        <Button className="w-full gradient-primary text-primary-foreground border-0"><Send className="mr-2 h-4 w-4" />Send</Button>
      </CardContent>
    </Card>
  );
}
