import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ShieldCheck, Smartphone, Monitor, MapPin, LogOut } from "lucide-react";
import { sessions } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile settings" description="Manage your account, security and preferences." breadcrumbs={[{ label: "Account" }, { label: "Profile" }]} />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your personal information.</CardDescription></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[200px_1fr]">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-28 w-28"><AvatarFallback className="gradient-primary text-primary-foreground text-2xl">AR</AvatarFallback></Avatar>
                <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Change photo</Button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved"); }} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>First name</Label><Input defaultValue="Alicia" /></div>
                <div className="space-y-1.5"><Label>Last name</Label><Input defaultValue="Romero" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input defaultValue="alicia@acme.io" /></div>
                <div className="space-y-1.5"><Label>Job title</Label><Input defaultValue="Operations Lead" /></div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select defaultValue="berlin"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="berlin">Europe/Berlin</SelectItem>
                      <SelectItem value="ny">America/New_York</SelectItem>
                      <SelectItem value="tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 flex justify-end"><Button type="submit" className="gradient-primary text-primary-foreground border-0">Save changes</Button></div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Change password</CardTitle><CardDescription>Use at least 8 characters with mixed case and a number.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Password updated"); }} className="grid max-w-md gap-4">
                <div className="space-y-1.5"><Label>Current password</Label><Input type="password" /></div>
                <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
                <div className="space-y-1.5"><Label>Confirm new password</Label><Input type="password" /></div>
                <Button type="submit" className="gradient-primary text-primary-foreground border-0 w-fit">Update password</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" />Two-factor authentication</CardTitle><CardDescription>Add an extra layer of security to your account.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">Authenticator app</p><p className="text-sm text-muted-foreground">Use an app like 1Password or Authy.</p></div>
                <Badge className="bg-success/15 text-success border-success/20" variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">SMS verification</p><p className="text-sm text-muted-foreground">Receive codes via text message.</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Active sessions</CardTitle><CardDescription>Devices currently signed into your account.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((s) => {
                const Icon = s.device.includes("iPhone") ? Smartphone : Monitor;
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{s.device}</p>
                          {s.current && <Badge variant="outline" className="bg-success/15 text-success border-success/20 text-[10px]">This device</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <MapPin className="h-3 w-3" />{s.location} · {s.ip} · {s.lastActive}
                        </p>
                      </div>
                    </div>
                    {!s.current && <Button variant="outline" size="sm"><LogOut className="mr-1 h-3 w-3" />Revoke</Button>}
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-end"><Button variant="destructive" size="sm">Sign out of all other sessions</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Email notifications</CardTitle><CardDescription>Choose what we email you about.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {[
                { t: "Product updates", d: "New features and improvements." },
                { t: "Security alerts", d: "New sign-ins, password changes." },
                { t: "Billing & invoices", d: "Receipts and renewal reminders." },
                { t: "Weekly digest", d: "A summary of your team's activity." },
              ].map((n, i) => (
                <div key={n.t} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="font-medium">{n.t}</p><p className="text-sm text-muted-foreground">{n.d}</p></div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
