import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreatePmProjectInput,
  CreatePmTaskInput,
  LogPmTaskTimeInput,
  PmProjectDto,
  PmProjectsListResult,
  PmTaskDto,
  PmTasksListResult,
  UpdatePmTaskInput,
} from "@/modules/pm/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  priority?: string;
  project_id?: number | string;
};

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export const pmApi = {
  projects: (params?: ListParams) =>
    api.get<ApiEnvelope<PmProjectDto[]>>(`/v1/pm/projects${buildQuery(params)}`).then((r) => ({
      data: Array.isArray(r.data) ? r.data : [],
      pagination: r.meta?.pagination,
    }) satisfies PmProjectsListResult),

  createProject: (body: CreatePmProjectInput) =>
    api.post<ApiEnvelope<PmProjectDto>>("/v1/pm/projects", body, { idempotent: true }),

  tasks: (params?: ListParams) =>
    api.get<ApiEnvelope<PmTaskDto[]>>(`/v1/pm/tasks${buildQuery(params)}`).then((r) => ({
      data: Array.isArray(r.data) ? r.data : [],
      pagination: r.meta?.pagination,
      summary: r.meta?.summary as PmTasksListResult["summary"],
    }) satisfies PmTasksListResult),

  task: (id: number | string) =>
    api.get<ApiEnvelope<PmTaskDto>>(`/v1/pm/tasks/${id}`).then((r) => r.data),

  createTask: (body: CreatePmTaskInput) =>
    api.post<ApiEnvelope<PmTaskDto>>("/v1/pm/tasks", body, { idempotent: true }),

  updateTask: (id: number | string, body: UpdatePmTaskInput) =>
    api.patch<ApiEnvelope<PmTaskDto>>(`/v1/pm/tasks/${id}`, body, { idempotent: true }),

  logTaskTime: (id: number | string, body: LogPmTaskTimeInput) =>
    api.post<ApiEnvelope<PmTaskDto>>(`/v1/pm/tasks/${id}/log-time`, body, { idempotent: true }),

  deleteTask: (id: number | string) =>
    api.delete<ApiEnvelope<null>>(`/v1/pm/tasks/${id}`, { idempotent: true }),
};
