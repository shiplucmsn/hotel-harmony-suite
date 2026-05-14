import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileBarChart, FileText, Scale, TrendingUp, Wallet, Receipt, BookOpen, PiggyBank, Download } from "lucide-react";

export const Route = createFileRoute("/app/finance/reports")({ component: ReportsPage });

const reports = [
  { title: "Profit & Loss", desc: "Revenue, expenses and net profit", icon: TrendingUp, to: "/app/finance/profit-loss" },
  { title: "Balance Sheet", desc: "Assets, liabilities and equity", icon: Scale, to: "/app/finance/balance-sheet" },
  { title: "Cash Flow", desc: "Inflow vs outflow trend", icon: Wallet, to: "/app/finance/cash-flow" },
  { title: "Trial Balance", desc: "All account debits and credits", icon: BookOpen, to: "/app/finance/trial-balance" },
  { title: "General Ledger", desc: "All posted entries by account", icon: FileText, to: "/app/finance/ledger" },
  { title: "Journal Report", desc: "Manual journal entries", icon: FileBarChart, to: "/app/finance/journal" },
  { title: "Aging Receivables", desc: "Outstanding customer invoices", icon: Receipt, to: "/app/finance/invoices" },
  { title: "Tax Summary", desc: "VAT collected and owed", icon: PiggyBank, to: "/app/finance/tax" },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Generate and export comprehensive financial statements."
        breadcrumbs={[{ label: "Finance" }, { label: "Reports" }]}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-44" defaultValue="2026-01-01" />
        <Input type="date" className="w-44" defaultValue="2026-12-31" />
        <Button variant="outline" size="sm" className="ml-auto"><Download className="mr-2 h-4 w-4" />Export all</Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map(r => (
          <Link key={r.title} to={r.to}>
            <Card className="h-full transition hover:shadow-elegant hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.desc}</div>
                <div className="mt-4 text-xs font-medium text-primary">Open →</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
