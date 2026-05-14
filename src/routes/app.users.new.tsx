import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/users/new")({ component: NewUser });

function NewUser() {
  const nav = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite a new user"
        description="Send an invitation and configure access in one step."
        breadcrumbs={[{ label: "Administration" }, { label: "Users", to: "/app/users" }, { label: "New" }]}
      />
      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("Invitation sent"); nav({ to: "/app/users" }); }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Basic details for the new team member.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>First name</Label><Input required /></div>
              <div className="space-y-1.5"><Label>Last name</Label><Input required /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Work email</Label><Input type="email" required /></div>
              <div className="space-y-1.5"><Label>Phone (optional)</Label><Input type="tel" /></div>
              <div className="space-y-1.5"><Label>Job title</Label><Input /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access & permissions</CardTitle>
              <CardDescription>Choose what this user can see and do.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select defaultValue="Viewer">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Admin","Manager","Sales","Accountant","Viewer"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select defaultValue="Sales">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Sales","Operations","Finance","Marketing","Procurement"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Require 2FA</p><p className="text-xs text-muted-foreground">Force enrollment on first sign-in.</p></div>
                <Switch defaultChecked />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Send welcome email</p><p className="text-xs text-muted-foreground">Notify the user when account is ready.</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24"><AvatarFallback className="gradient-primary text-primary-foreground text-2xl">+</AvatarFallback></Avatar>
              <Button variant="outline" size="sm" type="button"><Upload className="mr-2 h-4 w-4" />Upload photo</Button>
              <p className="text-xs text-muted-foreground text-center">PNG or JPG, max 2MB</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Send invitation</Button>
              <Button asChild type="button" variant="outline" className="w-full"><Link to="/app/users">Cancel</Link></Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
