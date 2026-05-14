import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/app/subscription")({ component: SubscriptionPage });

const invoices = [
  { id: "INV-2049", date: "Nov 1, 2026", amount: "$245.00", status: "Paid" },
  { id: "INV-2018", date: "Oct 1, 2026", amount: "$245.00", status: "Paid" },
  { id: "INV-1990", date: "Sep 1, 2026", amount: "$245.00", status: "Paid" },
  { id: "INV-1962", date: "Aug 1, 2026", amount: "$215.00", status: "Paid" },
];

function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" description="Manage your plan, payment method and invoices." breadcrumbs={[{ label: "Account" }, { label: "Subscription" }]} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="gradient-primary text-primary-foreground border-0 mb-2">Current plan</Badge>
                <h2 className="text-2xl font-semibold">Business</h2>
                <p className="text-sm text-muted-foreground mt-1">Renews on December 12, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold">$245<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-muted-foreground">Users</span><span className="font-medium">28 / 50</span></div>
                <Progress value={56} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-muted-foreground">Storage</span><span className="font-medium">62 / 100 GB</span></div>
                <Progress value={62} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="gradient-primary text-primary-foreground border-0"><Link to="/pricing">Change plan</Link></Button>
              <Button variant="outline">Cancel subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment method</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl gradient-primary p-4 text-primary-foreground shadow-elegant">
              <p className="text-xs opacity-80">Visa</p>
              <p className="mt-6 font-mono">•••• •••• •••• 4242</p>
              <div className="mt-2 flex justify-between text-xs opacity-80"><span>Alicia Romero</span><span>12/27</span></div>
            </div>
            <Button variant="outline" className="w-full">Update payment method</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Billing history</CardTitle><CardDescription>Download your past invoices.</CardDescription></div>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export all</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.id}</TableCell>
                  <TableCell className="text-muted-foreground">{i.date}</TableCell>
                  <TableCell>{i.amount}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-success/15 text-success border-success/20">{i.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
