import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton, TableSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";
import { Inbox, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/components")({ component: ComponentsShowcase });

function ComponentsShowcase() {
  const [emailErr, setEmailErr] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Component library" description="Reusable UI patterns used across the app." breadcrumbs={[{ label: "Account" }, { label: "Components" }]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Toasts</CardTitle><CardDescription>Sonner-powered notifications.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Saved successfully")}>Success</Button>
            <Button variant="destructive" onClick={() => toast.error("Something went wrong")}>Error</Button>
            <Button variant="outline" onClick={() => toast("Heads up", { description: "Your trial ends in 3 days." })}>Info</Button>
            <Button variant="secondary" onClick={() => toast.warning("Watch out", { description: "Your inventory is running low." })}>Warning</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Form validation</CardTitle><CardDescription>Inline errors and helper text.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="em">Email</Label>
              <Input id="em" placeholder="you@company.com" onChange={(e) => setEmailErr(!e.target.value.includes("@"))}
                className={emailErr ? "border-destructive focus-visible:ring-destructive/30" : ""} />
              {emailErr ? <p className="text-xs text-destructive">Please enter a valid email address.</p> : <p className="text-xs text-muted-foreground">We'll never share your email.</p>}
            </div>
            <div className="space-y-1.5"><Label>Bio</Label><Textarea placeholder="Tell us about your team…" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Modals & overlays</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This will publish your changes to all team members.</DialogDescription></DialogHeader>
                <DialogFooter><Button variant="outline">Cancel</Button><Button>Publish</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>Narrow down your results.</SheetDescription></SheetHeader>
                <div className="py-4 space-y-3"><Label>Search</Label><Input /><Label>Status</Label><Input /></div>
                <SheetFooter><Button>Apply</Button></SheetFooter>
              </SheetContent>
            </Sheet>
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline">Open drawer</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader><DrawerTitle>Quick edit</DrawerTitle><DrawerDescription>Make changes inline.</DrawerDescription></DrawerHeader>
                <div className="px-4 pb-4"><Input placeholder="Name" /></div>
                <DrawerFooter><Button>Save</Button></DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Accordion</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {["Getting started","Billing","Security","Integrations"].map((t, i) => (
                <AccordionItem key={t} value={`i${i}`}>
                  <AccordionTrigger>{t}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">Detailed information about {t.toLowerCase()} goes here.</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Empty state</CardTitle></CardHeader>
          <CardContent><EmptyState icon={Inbox} title="No invoices yet" description="Create your first invoice to start tracking revenue." action={<Button>Create invoice</Button>} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Loading skeletons</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
            <TableSkeleton rows={3} />
            <Button disabled className="w-fit"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-success/15 text-success border-success/20" variant="outline">Success</Badge>
            <Badge className="bg-warning/15 text-warning-foreground border-warning/20" variant="outline">Warning</Badge>
            <Badge className="gradient-primary text-primary-foreground border-0">Premium</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">Gradient</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
