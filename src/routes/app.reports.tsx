import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Boxes, DollarSign, Download, Factory, Filter, ShoppingCart, UserCog } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { useExportReport, useModuleChart, useModuleReport, useReportsDashboard, useReportsModules } from "@/hooks/reporting/use-reporting";
import type { ReportFilters, ReportingModule } from "@/modules/reporting/types";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

const MODULES: Array<{ key: ReportingModule; label: string; icon: typeof ShoppingCart }> = [
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "hr", label: "HR", icon: UserCog },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "production", label: "Production", icon: Factory },
];

function ReportsPage() {
  const [activeModule, setActiveModule] = useState<ReportingModule>("sales");
  const [from, setFrom] = useState<string>(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [limit, setLimit] = useState<number>(20);

  const filters: ReportFilters = { from, to, group_by: groupBy, limit };
  const { data: dashboardData } = useReportsDashboard(filters);
  const { data: modulesData } = useReportsModules(filters);
  const { data: moduleReportData, isLoading: moduleLoading } = useModuleReport(activeModule, filters);
  const { data: moduleChartData } = useModuleChart(activeModule, filters);
  const exportMutation = useExportReport();

  const chartData = useMemo(() => {
    const chart = moduleChartData?.data.chart;
    if (!chart?.labels?.length) return [];
    return chart.labels.map((label, idx) => {
      const row: Record<string, string | number> = { label };
      chart.series.forEach((series) => {
        row[series.name] = series.data[idx] ?? 0;
      });
      return row;
    });
  }, [moduleChartData]);

  const moduleKpis = moduleReportData?.data.report.kpis ?? {};
  const moduleDetails = moduleReportData?.data.report ?? {};
  const summary = dashboardData?.data.summary ?? {};
  const crossKpis = modulesData?.data.cross_module?.cross_module_kpis ?? {};

  const detailRows = Object.entries(moduleDetails)
    .filter(([key, value]) => key !== "kpis" && Array.isArray(value))
    .slice(0, 1);

  const activeModuleDef = MODULES.find((module) => module.key === activeModule) ?? MODULES[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Cross-module reporting dashboards with filters, charts and exports."
        breadcrumbs={[{ label: "Workspace" }, { label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportMutation.mutate({ module: activeModule, filters })}>
              <Download className="mr-2 h-4 w-4" />
              Export {activeModule}
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">From</p>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">To</p>
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Group by</p>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as "day" | "week" | "month")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Limit</p>
            <Input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value || 20))}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => exportMutation.mutate({ module: activeModule, filters })}>
              <Filter className="mr-2 h-4 w-4" />
              Apply + Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(summary.revenue)} icon={DollarSign} />
        <StatCard label="Inventory Value" value={formatMoney(summary.inventory_value)} icon={Boxes} />
        <StatCard label="Payroll Total" value={formatMoney(summary.payroll_total)} icon={UserCog} />
        <StatCard label="Health Score" value={`${Number(summary.health_score ?? 0).toFixed(2)}%`} icon={BarChart3} />
      </div>

      <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as ReportingModule)}>
        <TabsList className="flex h-auto flex-wrap">
          {MODULES.map((module) => (
            <TabsTrigger key={module.key} value={module.key}>
              <module.icon className="mr-1.5 h-3.5 w-3.5" />
              {module.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeModuleDef.key} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(moduleKpis).slice(0, 4).map(([key, value]) => (
                <StatCard
                  key={key}
                  label={humanizeKey(key)}
                  value={formatMetricValue(value)}
                  icon={activeModuleDef.icon}
                />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{moduleChartData?.data.chart.title ?? `${activeModuleDef.label} Trend`}</CardTitle>
                  <CardDescription>
                    {from} to {to} · grouped by {groupBy}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {moduleLoading ? (
                    <div className="h-[320px] flex items-center text-sm text-muted-foreground">Loading chart data...</div>
                  ) : chartData.length === 0 ? (
                    <EmptyState title="No chart data" description="No trend values found for selected filters." />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Legend />
                        {(moduleChartData?.data.chart.series ?? []).map((series, index) => (
                          index === 0 ? (
                            <Bar key={series.name} dataKey={series.name} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          ) : (
                            <Line key={series.name} type="monotone" dataKey={series.name} stroke={index % 2 === 0 ? "hsl(var(--success))" : "hsl(var(--warning))"} />
                          )
                        ))}
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-module KPIs</CardTitle>
                  <CardDescription>Linked financial and operational indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(crossKpis).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                      <span className="text-muted-foreground">{humanizeKey(key)}</span>
                      <span className="font-medium">{formatMetricValue(value)}</span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2" onClick={() => exportMutation.mutate({ module: activeModuleDef.key, filters })}>
                    <Download className="mr-2 h-4 w-4" />
                    Export {activeModuleDef.label}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{activeModuleDef.label} Details</CardTitle>
                <CardDescription>Top aggregated rows from report dataset</CardDescription>
              </CardHeader>
              <CardContent>
                {detailRows.length === 0 ? (
                  <EmptyState title="No detail rows" description="No detailed breakdown array returned for current module." />
                ) : (
                  detailRows.map(([section, rows]) => (
                    <div key={section} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{humanizeKey(section)}</Badge>
                        <span className="text-xs text-muted-foreground">Top {Array.isArray(rows) ? rows.length : 0} rows</span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys((rows as Array<Record<string, unknown>>)[0] ?? {}).map((column) => (
                              <TableHead key={column}>{humanizeKey(column)}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(rows as Array<Record<string, unknown>>).slice(0, limit).map((row, idx) => (
                            <TableRow key={idx}>
                              {Object.entries(row).map(([column, value]) => (
                                <TableCell key={column}>{formatMetricValue(value)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value: unknown): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatMetricValue(value: unknown): string {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return Number(value).toFixed(value % 1 === 0 ? 0 : 2);
  }
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "-";
  return JSON.stringify(value);
}
