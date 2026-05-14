import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/activity-timeline";
import { StatCard } from "@/components/stat-card";
import { Mail, Phone, MapPin, Globe, Edit, FileText, DollarSign, ShoppingCart, MessageSquare, Building2 } from "lucide-react";
import { customers, crmInvoices, deals, ledgerEntries } from "@/lib/crm-mock";

export const Route = createFileRoute("/app/crm/customers/$customerId")({
  component: () => {
    const { customerId } = Route.useParams();
    const c = customers.find((x) => x.id === customerId) ?? customers[0];

    return (
      <div className="space-y-6">
        <PageHeader
          title={c.name}
          breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customers", to: "/app/crm/customers" }, { label: c.name }]}
          actions={
            <>
              <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
              <Button className="gradient-primary text-primary-foreground border-0"><FileText className="h-4 w-4 mr-2" />New Invoice</Button>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto"><AvatarFallback className="text-2xl gradient-primary text-primary-foreground">{c.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <h2 className="mt-4 text-lg font-semibold">{c.name}</h2>
              <Badge className="mt-1" variant="outline">{c.type}</Badge>
              <Badge className={`ml-2 ${c.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{c.status}</Badge>
              <div className="mt-6 space-y-3 text-left text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{c.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{c.phone}</div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{c.company}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />San Francisco, CA</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{c.company.toLowerCase().replace(/ /g, "")}.io</div>
              </div>
              <div className="mt-6 flex gap-2 justify-center">
                <Button size="sm" variant="outline"><Mail className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline"><Phone className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Spent" value={`$${c.totalSpent.toLocaleString()}`} icon={DollarSign} />
              <StatCard label="Open Invoices" value={String(c.openInvoices)} icon={FileText} accent="bg-amber-500" />
              <StatCard label="Orders" value="14" icon={ShoppingCart} accent="bg-emerald-500" />
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="ledger">Ledger</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card><CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader><CardContent><ActivityTimeline /></CardContent></Card>
              </TabsContent>

              <TabsContent value="deals">
                <Card><CardContent className="p-4 space-y-2">
                  {deals.slice(0, 4).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div><div className="font-medium text-sm">{d.title}</div><div className="text-xs text-muted-foreground">{d.owner} · closes {d.closeDate}</div></div>
                      <div className="flex items-center gap-3"><Badge variant="outline">{d.stage}</Badge><span className="font-semibold text-sm">${d.value.toLocaleString()}</span></div>
                    </div>
                  ))}
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card><CardContent className="p-4 space-y-2">
                  {crmInvoices.slice(0, 4).map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div><div className="font-medium">{i.number}</div><div className="text-xs text-muted-foreground">Issued {i.issued} · due {i.due}</div></div>
                      <div className="flex items-center gap-3"><Badge>{i.status}</Badge><span className="font-semibold">${i.amount.toLocaleString()}</span></div>
                    </div>
                  ))}
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="ledger">
                <Card><CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    {ledgerEntries.map((e) => (
                      <div key={e.id} className="grid grid-cols-5 gap-2 border-b pb-2">
                        <span className="text-muted-foreground">{e.date}</span>
                        <span>{e.reference}</span>
                        <span className="col-span-1 text-right">{e.debit ? `$${e.debit.toLocaleString()}` : "—"}</span>
                        <span className="text-right">{e.credit ? `$${e.credit.toLocaleString()}` : "—"}</span>
                        <span className="text-right font-medium">${e.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="activity"><Card><CardContent className="p-6"><ActivityTimeline /></CardContent></Card></TabsContent>
              <TabsContent value="notes"><Card><CardContent className="p-6 text-sm text-muted-foreground">No notes yet.</CardContent></Card></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  },
});
