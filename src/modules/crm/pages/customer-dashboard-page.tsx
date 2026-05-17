import { useMemo, useState } from "react";
import { FileText, Mail, Phone, ShoppingCart, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrmStatusBadge } from "@/modules/crm/components/crm-status-badge";
import { InvoiceFormSheet } from "@/modules/crm/components/invoice-form-sheet";
import { PaymentFormSheet } from "@/modules/crm/components/payment-form-sheet";
import {
  useCrmCustomer,
  useCrmInvoices,
  useCrmOrders,
  useCustomerLedger,
} from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";

type CustomerDashboardPageProps = {
  customerId: string;
};

export function CustomerDashboardPage({ customerId }: CustomerDashboardPageProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: customer, isLoading } = useCrmCustomer(customerId);
  const { data: ledgerData } = useCustomerLedger(customerId);
  const { data: ordersData } = useCrmOrders({ per_page: 100 });
  const { data: invoicesData } = useCrmInvoices({ per_page: 100, customer_id: customerId });

  const ledger = ledgerData?.data ?? [];
  const orders = useMemo(
    () => (ordersData?.data ?? []).filter((o) => String(o.customer_id) === customerId),
    [ordersData, customerId],
  );
  const invoices = invoicesData?.data ?? [];
  const openInvoices = invoices.filter((i) => i.balance_due > 0);

  if (isLoading || !customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer" breadcrumbs={[{ label: "CRM & Sales" }, { label: "Customers", to: "/app/crm/customers" }]} />
        <Card className="p-8 text-center text-muted-foreground">Loading customer…</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: "CRM & Sales" },
          { label: "Customers", to: "/app/crm/customers" },
          { label: customer.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setPaymentOpen(true)}>
              <Wallet className="mr-2 h-4 w-4" />
              Record payment
            </Button>
            <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setInvoiceOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              New invoice
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarFallback className="gradient-primary text-2xl text-primary-foreground">
                {customer.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold">{customer.name}</h2>
            <p className="text-sm text-muted-foreground">{customer.code}</p>
            <div className="mt-6 space-y-3 text-left text-sm">
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <p className="text-muted-foreground">{customer.address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="AR Balance" value={formatMoney(customer.balance)} icon={Wallet} />
            <StatCard label="Open invoices" value={String(openInvoices.length)} icon={FileText} accent="bg-amber-500" />
            <StatCard label="Orders" value={String(orders.length)} icon={ShoppingCart} accent="bg-emerald-500" />
          </div>

          <Tabs defaultValue="ledger">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="ledger">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer ledger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {ledger.length === 0 ? (
                    <p className="text-muted-foreground">No ledger entries yet.</p>
                  ) : (
                    ledger.map((e) => (
                      <div key={e.id} className="grid grid-cols-5 gap-2 border-b pb-2">
                        <span className="text-muted-foreground">{e.entry_date}</span>
                        <span className="col-span-2">{e.description ?? e.reference_type}</span>
                        <span className="text-right">{e.debit ? formatMoney(e.debit) : "—"}</span>
                        <span className="text-right font-medium">{formatMoney(e.balance_after)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardContent className="space-y-2 p-4">
                  {invoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No invoices.</p>
                  ) : (
                    invoices.map((i) => (
                      <div key={i.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <div>
                          <div className="font-medium">{i.number}</div>
                          <div className="text-xs text-muted-foreground">
                            Issued {i.issued ?? "—"} · due {i.due ?? "—"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CrmStatusBadge kind="invoice" status={i.status} />
                          <span className="font-semibold">{formatMoney(i.total_amount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardContent className="space-y-2 p-4">
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders.</p>
                  ) : (
                    orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <div>
                          <div className="font-medium">{o.number}</div>
                          <div className="text-xs text-muted-foreground">{o.order_date ?? "—"}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CrmStatusBadge kind="order" status={o.status} />
                          <span className="font-semibold">{formatMoney(o.total_amount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <InvoiceFormSheet
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        defaultCustomerId={customerId}
      />
      <PaymentFormSheet open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  );
}
