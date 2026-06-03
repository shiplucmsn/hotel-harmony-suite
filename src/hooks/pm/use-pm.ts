import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { withTenantKey } from "@/lib/tenant-query";
import { pmApi } from "@/modules/pm/pm-api";
import type {
  CreatePmProjectInput,
  CreatePmTaskInput,
  LogPmTaskTimeInput,
  UpdatePmTaskInput,
} from "@/modules/pm/types";

export const pmKeys = {
  all: () => withTenantKey(["pm"] as const),
  projects: (params?: Record<string, unknown>) => withTenantKey(["pm", "projects", params] as const),
  tasks: (params?: Record<string, unknown>) => withTenantKey(["pm", "tasks", params] as const),
  task: (id: number | string) => withTenantKey(["pm", "tasks", id] as const),
};

function invalidatePm(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: pmKeys.all() });
}

export function usePmProjects(params?: { per_page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: pmKeys.projects(params),
    queryFn: () => pmApi.projects(params),
  });
}

export function usePmTasks(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  priority?: string;
  project_id?: number | string;
}) {
  return useQuery({
    queryKey: pmKeys.tasks(params),
    queryFn: () => pmApi.tasks(params),
  });
}

export function usePmTask(id: number | string | null | undefined) {
  return useQuery({
    queryKey: pmKeys.task(id ?? "none"),
    queryFn: () => pmApi.task(id as number | string),
    enabled: id != null && id !== "",
  });
}

export function useCreatePmProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePmProjectInput) => pmApi.createProject(body),
    onSuccess: (res) => {
      invalidatePm(qc);
      showSideEffects(res.meta);
      toast.success("Project created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create project")),
  });
}

export function useCreatePmTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePmTaskInput) => pmApi.createTask(body),
    onSuccess: (res) => {
      invalidatePm(qc);
      showSideEffects(res.meta);
      toast.success("Task created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create task")),
  });
}

export function useUpdatePmTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdatePmTaskInput }) =>
      pmApi.updateTask(id, body),
    onSuccess: (res) => {
      invalidatePm(qc);
      showSideEffects(res.meta);
      toast.success("Task updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update task")),
  });
}

export function useLogPmTaskTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: LogPmTaskTimeInput }) =>
      pmApi.logTaskTime(id, body),
    onSuccess: (res) => {
      invalidatePm(qc);
      showSideEffects(res.meta);
      toast.success("Time logged");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to log time")),
  });
}

export function useDeletePmTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => pmApi.deleteTask(id),
    onSuccess: (res) => {
      invalidatePm(qc);
      showSideEffects(res.meta);
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete task")),
  });
}
