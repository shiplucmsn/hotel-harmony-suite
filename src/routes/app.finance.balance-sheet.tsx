import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

export const Route = createFileRoute("/app/finance/balance-sheet")({ component: BalanceSheet });

const sections = [
  {
    title: "Assets",
    items: [
      ["Cash & equivalents", 1281040],
      ["Accounts receivable", 184500],
      ["Inventory", 268900],
      ["Property & equipment", 420000],
    ],
  },
  {
    title: "Liabilities",
    items: [
      ["Accounts payable", 142300],
      ["VAT payable", 28400],
      ["Long-term debt", 320000],
    ],
  },
  {
    title: "Equity",
    items: [
      ["Owner's equity", 1200000],
      ["Retained earnings", 463740],
    ],
  },
];

function BalanceSheet() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        description="Snapshot of assets, liabilities and equity."
        breadcrumbs={[{ label: "Finance" }, { label: "Balance Sheet" }]}
        actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export PDF</Button>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-44" defaultValue="2026-05-31" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map(s => {
          const total = s.items.reduce((sum, [, v]) => sum + (v as number), 0);
          return (
            <Card key={s.title}>
              <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {s.items.map(([label, v]) => (
                  <div key={label as string} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{label}</span>
                    <span className="tabular-nums">${(v as number).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 mt-2 border-t font-semibold">
                  <span>Total {s.title.toLowerCase()}</span>
                  <span className="tabular-nums">${total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
