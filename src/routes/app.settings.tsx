import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your workspace preferences." breadcrumbs={[{ label: "Account" }, { label: "Settings" }]} />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Workspace details</CardTitle><CardDescription>Identifying information for your organization.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }} className="grid gap-4 max-w-2xl">
                <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue="Acme Industries" /></div>
                <div className="space-y-1.5"><Label>Workspace URL</Label><div className="flex"><span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">nebulaerp.com/</span><Input defaultValue="acme" className="rounded-l-none" /></div></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea defaultValue="Industrial equipment manufacturer based in Berlin." /></div>
                <div className="space-y-1.5"><Label>Default currency</Label>
                  <Select defaultValue="usd"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem><SelectItem value="eur">EUR - Euro</SelectItem><SelectItem value="gbp">GBP - British Pound</SelectItem>
                  </SelectContent></Select>
                </div>
                <Button type="submit" className="gradient-primary text-primary-foreground border-0 w-fit">Save changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Theme</CardTitle><CardDescription>Customize how Nebula looks on your devices.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
                {(["light","dark"] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${theme === t ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{t}</span>
                      {t === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </div>
                    <div className={`mt-3 h-20 rounded-md border ${t === "dark" ? "bg-zinc-900" : "bg-white"}`}>
                      <div className={`h-2 rounded-t-md ${t === "dark" ? "bg-zinc-800" : "bg-zinc-100"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {["Slack","Google Workspace","Microsoft 365","Stripe","Zapier","HubSpot"].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">{i[0]}</div>
                    <div><p className="font-medium">{i}</p><p className="text-xs text-muted-foreground">Sync data automatically</p></div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Developer</CardTitle><CardDescription>API keys and webhooks.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {[{t:"Enable API access",d:"Allow programmatic access via REST API."},{t:"Audit log retention",d:"Keep audit logs for 12 months."},{t:"Beta features",d:"Try features before general release."}].map((s,i) => (
                <div key={s.t} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="font-medium">{s.t}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Switch defaultChecked={i === 0} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader><CardTitle className="text-destructive">Danger zone</CardTitle><CardDescription>Irreversible and destructive actions.</CardDescription></CardHeader>
            <CardContent className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div><p className="font-medium">Delete workspace</p><p className="text-sm text-muted-foreground">Permanently delete this workspace and all its data.</p></div>
              <Button variant="destructive">Delete</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
