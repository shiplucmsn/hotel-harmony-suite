import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/hr/employees/new")({ component: NewEmployeePage });

function NewEmployeePage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const emailErr = email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add employee"
        description="Create a complete employee profile."
        breadcrumbs={[{ label: "HR", to: "/app/hr/employees" }, { label: "Employees", to: "/app/hr/employees" }, { label: "New" }]}
        actions={<>
          <Button asChild variant="outline" size="sm"><Link to="/app/hr/employees"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Link></Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => { toast.success("Employee created"); nav({ to: "/app/hr/employees" }); }}>
            <Save className="mr-2 h-4 w-4" />Save employee
          </Button>
        </>}
      />

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="comp">Compensation</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>First name *</Label><Input placeholder="John" /></div>
              <div className="grid gap-2"><Label>Last name *</Label><Input placeholder="Doe" /></div>
              <div className="grid gap-2">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="john@acme.io" aria-invalid={emailErr} className={emailErr ? "border-destructive" : ""} />
                {emailErr ? (
                  <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />Enter a valid email address</p>
                ) : email && (
                  <p className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" />Looks good</p>
                )}
              </div>
              <div className="grid gap-2"><Label>Phone</Label><Input placeholder="+1 415 555 0100" /></div>
              <div className="grid gap-2"><Label>Date of birth</Label><Input type="date" /></div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["Female","Male","Non-binary","Prefer not to say"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2"><Label>Address</Label><Textarea rows={2} placeholder="Street, City, Country" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job">
          <Card>
            <CardHeader><CardTitle>Job details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>Employee code *</Label><Input placeholder="EMP-013" /></div>
              <div className="grid gap-2"><Label>Join date *</Label><Input type="date" /></div>
              <div className="grid gap-2">
                <Label>Department *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{["Engineering","Sales","Finance","Marketing","Operations","Human Resources"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Designation *</Label><Input placeholder="e.g. Senior Engineer" /></div>
              <div className="grid gap-2"><Label>Reporting manager</Label><Input placeholder="Manager name" /></div>
              <div className="grid gap-2">
                <Label>Employment type</Label>
                <Select defaultValue="Full-time"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Full-time","Part-time","Contract","Intern"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Work location</Label><Input placeholder="City / Office" /></div>
              <div className="grid gap-2">
                <Label>Shift</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                  <SelectContent>{["Morning","Evening","Night","Weekend"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comp">
          <Card>
            <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>Annual gross *</Label><Input type="number" placeholder="60000" /></div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["USD","EUR","GBP","INR","JPY"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Bank account</Label><Input placeholder="IBAN / Account #" /></div>
              <div className="grid gap-2"><Label>Tax ID</Label><Input placeholder="Tax identifier" /></div>
              <div className="grid gap-2 md:col-span-2"><Label>Notes</Label><Textarea rows={3} placeholder="Compensation notes…" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader><CardTitle>Onboarding documents</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-border p-10 text-center">
                <p className="text-sm font-medium">Drop files here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Contract, ID, certificates · max 10 MB each</p>
                <Button variant="outline" size="sm" className="mt-4">Browse files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
