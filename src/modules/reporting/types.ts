import type { ApiMetaSideEffect } from "@/services/api/types";

export type ReportFilters = {
  from?: string;
  to?: string;
  group_by?: "day" | "week" | "month";
  limit?: number;
};

export type ReportingModule = "sales" | "inventory" | "hr" | "finance" | "production";

export type ReportChartDto = {
  chart_type: string;
  title: string;
  labels: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
};

export type ModuleReportPayload = {
  module: ReportingModule;
  range: {
    from: string;
    to: string;
    groupBy: string;
    limit: number;
  };
  report: {
    kpis?: Record<string, number | string>;
    trend?: Array<{ period: string; value: number }>;
    movement_trend?: Array<{ period: string; value: number }>;
    payroll_trend?: Array<{ period: string; value: number }>;
    journal_trend?: Array<{ period: string; value: number }>;
    output_trend?: Array<{ period: string; value: number }>;
    [key: string]: unknown;
  };
};

export type ModulesKpiPayload = {
  sales: Record<string, number | string>;
  inventory: Record<string, number | string>;
  hr: Record<string, number | string>;
  finance: Record<string, number | string>;
  production: Record<string, number | string>;
  cross_module: {
    cross_module_kpis: Record<string, number | string>;
    health_score: number;
  };
  range: {
    from: string;
    to: string;
    groupBy: string;
    limit: number;
  };
};

export type DashboardPayload = {
  summary: Record<string, number | string>;
  range: {
    from: string;
    to: string;
    groupBy: string;
    limit: number;
  };
};

export type ReportChartPayload = {
  module: ReportingModule;
  range: {
    from: string;
    to: string;
    groupBy: string;
    limit: number;
  };
  chart: ReportChartDto;
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
    correlationId?: string;
    sideEffects?: ApiMetaSideEffect[];
    cacheTags?: string[];
  };
};

