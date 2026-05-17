import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  CreateHrAttendanceInput,
  CreateHrDepartmentInput,
  CreateHrDesignationInput,
  CreateHrEmployeeInput,
  CreateHrLeaveInput,
  CreateHrPayrollInput,
  HrAttendanceDto,
  HrDepartmentDto,
  HrDesignationDto,
  HrEmployeeDto,
  HrLeaveDto,
  HrPayrollDto,
  PaginatedResult,
  SyncHrAttendanceInput,
  UpdateHrDepartmentInput,
  UpdateHrDesignationInput,
} from "@/modules/hr/types";

type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  department?: string;
  employee_id?: number | string;
  leave_type?: string;
  from?: string;
  to?: string;
};

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

function paginated<T>(res: ApiEnvelope<T[]>): PaginatedResult<T> {
  return {
    data: Array.isArray(res.data) ? res.data : [],
    pagination: res.meta?.pagination,
  };
}

export const hrApi = {
  departments: (params?: ListParams) =>
    api.get<ApiEnvelope<HrDepartmentDto[]>>(`/v1/hr/departments${buildQuery(params)}`).then(paginated),

  createDepartment: (body: CreateHrDepartmentInput) =>
    api.post<ApiEnvelope<HrDepartmentDto>>("/v1/hr/departments", body, { idempotent: true }).then((r) => r.data),

  updateDepartment: (id: number | string, body: UpdateHrDepartmentInput) =>
    api.patch<ApiEnvelope<HrDepartmentDto>>(`/v1/hr/departments/${id}`, body, { idempotent: true }).then((r) => r.data),

  deleteDepartment: (id: number | string) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/hr/departments/${id}`, { idempotent: true }).then((r) => r.data),

  designations: (params?: ListParams) =>
    api.get<ApiEnvelope<HrDesignationDto[]>>(`/v1/hr/designations${buildQuery(params)}`).then(paginated),

  createDesignation: (body: CreateHrDesignationInput) =>
    api.post<ApiEnvelope<HrDesignationDto>>("/v1/hr/designations", body, { idempotent: true }).then((r) => r.data),

  updateDesignation: (id: number | string, body: UpdateHrDesignationInput) =>
    api.patch<ApiEnvelope<HrDesignationDto>>(`/v1/hr/designations/${id}`, body, { idempotent: true }).then((r) => r.data),

  deleteDesignation: (id: number | string) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/hr/designations/${id}`, { idempotent: true }).then((r) => r.data),

  employees: (params?: ListParams) =>
    api.get<ApiEnvelope<HrEmployeeDto[]>>(`/v1/hr/employees${buildQuery(params)}`).then(paginated),

  createEmployee: (body: CreateHrEmployeeInput) =>
    api.post<ApiEnvelope<HrEmployeeDto>>("/v1/hr/employees", body, { idempotent: true }).then((r) => r.data),

  updateEmployee: (id: number | string, body: Partial<CreateHrEmployeeInput>) =>
    api.patch<ApiEnvelope<HrEmployeeDto>>(`/v1/hr/employees/${id}`, body, { idempotent: true }).then((r) => r.data),

  attendances: (params?: ListParams) =>
    api.get<ApiEnvelope<HrAttendanceDto[]>>(`/v1/hr/attendances${buildQuery(params)}`).then(paginated),

  createAttendance: (body: CreateHrAttendanceInput) =>
    api.post<ApiEnvelope<HrAttendanceDto>>("/v1/hr/attendances", body, { idempotent: true }).then((r) => r.data),

  syncAttendance: (body: SyncHrAttendanceInput) =>
    api.post<ApiEnvelope<{ processed: number; created: number; updated: number; failed: number }>>(
      "/v1/hr/attendances/sync",
      body,
      { idempotent: true },
    ),

  leaves: (params?: ListParams) =>
    api.get<ApiEnvelope<HrLeaveDto[]>>(`/v1/hr/leaves${buildQuery(params)}`).then(paginated),

  createLeave: (body: CreateHrLeaveInput) =>
    api.post<ApiEnvelope<HrLeaveDto>>("/v1/hr/leaves", body, { idempotent: true }).then((r) => r.data),

  approveLeave: (id: number | string) =>
    api.post<ApiEnvelope<HrLeaveDto>>(`/v1/hr/leaves/${id}/approve`, {}, { idempotent: true }),

  rejectLeave: (id: number | string) =>
    api.post<ApiEnvelope<HrLeaveDto>>(`/v1/hr/leaves/${id}/reject`, {}, { idempotent: true }),

  payrolls: (params?: ListParams) =>
    api.get<ApiEnvelope<HrPayrollDto[]>>(`/v1/hr/payrolls${buildQuery(params)}`).then(paginated),

  createPayroll: (body: CreateHrPayrollInput) =>
    api.post<ApiEnvelope<HrPayrollDto>>("/v1/hr/payrolls", body, { idempotent: true }),

  postPayroll: (id: number | string) =>
    api.post<ApiEnvelope<HrPayrollDto>>(`/v1/hr/payrolls/${id}/post`, {}, { idempotent: true }),
};

