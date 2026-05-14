import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Plus, Search, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { contacts } from "@/lib/crm-mock";

export const Route = createFileRoute("/app/crm/contacts")({
  component: () => {
    const [q, setQ] = useState("");
    const filtered = contacts.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.company.toLowerCase().includes(q.toLowerCase()));

    return (
      <div className="space-y-6">
        <PageHeader
          title="Contact Management"
          description="Maintain a unified directory of every person you do business with."
          breadcrumbs={[{ label: "CRM & Sales" }, { label: "Contacts" }]}
          actions={
            <Dialog>
              <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New Contact</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Contact</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>First name</Label><Input /></div>
                    <div><Label>Last name</Label><Input /></div>
                  </div>
                  <div><Label>Job title</Label><Input /></div>
                  <div><Label>Company</Label><Input /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Email</Label><Input type="email" /></div>
                    <div><Label>Phone</Label><Input /></div>
                  </div>
                </div>
                <DialogFooter><Button variant="outline">Cancel</Button><Button>Save Contact</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="hover:shadow-elegant transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12"><AvatarFallback className="gradient-primary text-primary-foreground">{c.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.company}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" />{c.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" />{c.phone}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  },
});
