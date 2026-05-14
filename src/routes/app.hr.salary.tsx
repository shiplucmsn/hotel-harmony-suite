import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/hr/salary")({ component: SalaryPage });

const earnings = [
  { name: "Basic", value: 60, type: "% of gross" },
  { name: "House Rent Allowance", value: 20, type: "% of basic" },
  { name: "Transport Allowance", value: 1500, type: "Fixed" },
  { name: "Performance Bonus", value: 10, type: "% of basic" },
];
const deductions = [
  { name: "Income Tax", value: 18, type: "% of gross" },
  { name: "Social Security", value: 6.2, type: "% of gross" },
  { name: "Health Insurance", value: 250, type: "Fixed" },
];

function SalaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary structure"
        description="Configure earnings, deductions and templates."
        breadcrumbs={[{ label: "HR" }, { label: "Salary structure" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Save className="mr-2 h-4 w-4" />Save template</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Earnings</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnings.map((e,i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5"><Label className="text-xs">Component</Label><Input defaultValue={e.name} /></div>
                <div className="col-span-3"><Label className="text-xs">Value</Label><Input defaultValue={e.value} /></div>
                <div className="col-span-3"><Label className="text-xs">Type</Label><Input defaultValue={e.type} /></div>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Deductions</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {deductions.map((d,i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5"><Label className="text-xs">Component</Label><Input defaultValue={d.name} /></div>
                <div className="col-span-3"><Label className="text-xs">Value</Label><Input defaultValue={d.value} /></div>
                <div className="col-span-3"><Label className="text-xs">Type</Label><Input defaultValue={d.type} /></div>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sample preview · gross $5,000</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Basic</span><span>$3,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">HRA</span><span>$600</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span>$1,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bonus</span><span>$300</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold"><span>Gross earnings</span><span>$5,400</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Income tax</span><span className="text-destructive">-$972</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Social security</span><span className="text-destructive">-$334</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Health insurance</span><span className="text-destructive">-$250</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold"><span>Net pay</span><span className="text-success">$3,844</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
