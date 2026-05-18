import { api } from "@/lib/api-client";
import { buildApiHeaders } from "@/lib/api-auth";
import type {
  ApiEnvelope,
  DashboardPayload,
  ModuleReportPayload,
  ModulesKpiPayload,
  ReportChartPayload,
  ReportFilters,
  ReportingModule,
} from "@/modules/reporting/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

function normalizeFilters(filters?: ReportFilters): Record<string, string | number | undefined> {
  return {
    from: filters?.from,
    to: filters?.to,
    group_by: filters?.group_by,
    limit: filters?.limit,
  };
}

async function exportCsv(module: ReportingModule, filters?: ReportFilters): Promise<void> {
  const query = buildQuery(normalizeFilters(filters));
  const url = `${API_BASE_URL.replace(/\/$/, "")}/v1/reports/export/${module}${query}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...buildApiHeaders(),
      Accept: "text/csv",
    },
  });
  if (!res.ok) throw new Error(`Export failed with status ${res.status}`);

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition");
  const fileName = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? `${module}-report.csv`;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export const reportingApi = {
  dashboard: (filters?: ReportFilters) =>
    api.get<ApiEnvelope<DashboardPayload>>(`/v1/reports/dashboard${buildQuery(normalizeFilters(filters))}`),

  modules: (filters?: ReportFilters) =>
    api.get<ApiEnvelope<ModulesKpiPayload>>(`/v1/reports/modules${buildQuery(normalizeFilters(filters))}`),

  moduleReport: (module: ReportingModule, filters?: ReportFilters) =>
    api.get<ApiEnvelope<ModuleReportPayload>>(`/v1/reports/${module}${buildQuery(normalizeFilters(filters))}`),

  moduleChart: (module: ReportingModule, filters?: ReportFilters) =>
    api.get<ApiEnvelope<ReportChartPayload>>(`/v1/reports/charts/${module}${buildQuery(normalizeFilters(filters))}`),

  exportModule: (module: ReportingModule, filters?: ReportFilters) => exportCsv(module, filters),
};

