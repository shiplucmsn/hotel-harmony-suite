import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { reportingApi } from "@/modules/reporting/reporting-api";
import type { ReportFilters, ReportingModule } from "@/modules/reporting/types";

export const reportingKeys = {
  all: ["reporting"] as const,
  dashboard: (filters?: ReportFilters) => ["reporting", "dashboard", filters] as const,
  modules: (filters?: ReportFilters) => ["reporting", "modules", filters] as const,
  moduleReport: (module: ReportingModule, filters?: ReportFilters) =>
    ["reporting", "module-report", module, filters] as const,
  moduleChart: (module: ReportingModule, filters?: ReportFilters) =>
    ["reporting", "module-chart", module, filters] as const,
};

export function useReportsDashboard(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportingKeys.dashboard(filters),
    queryFn: () => reportingApi.dashboard(filters),
  });
}

export function useReportsModules(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportingKeys.modules(filters),
    queryFn: () => reportingApi.modules(filters),
  });
}

export function useModuleReport(module: ReportingModule, filters?: ReportFilters) {
  return useQuery({
    queryKey: reportingKeys.moduleReport(module, filters),
    queryFn: () => reportingApi.moduleReport(module, filters),
  });
}

export function useModuleChart(module: ReportingModule, filters?: ReportFilters) {
  return useQuery({
    queryKey: reportingKeys.moduleChart(module, filters),
    queryFn: () => reportingApi.moduleChart(module, filters),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ module, filters }: { module: ReportingModule; filters?: ReportFilters }) =>
      reportingApi.exportModule(module, filters),
    onSuccess: () => toast.success("Report downloaded"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to export report")),
  });
}

