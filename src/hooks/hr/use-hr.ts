import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";
import { showSideEffects } from "@/lib/api-meta";
import { matchesTenantQueryKey, withTenantKey } from "@/lib/tenant-query";
import { hrApi } from "@/modules/hr/hr-api";
import type {
  CreateHrAttendanceInput,
  CreateHrDepartmentInput,
  CreateHrDesignationInput,
  CreateHrEmployeeInput,
  CreateHrLeaveInput,
  CreateHrPayrollInput,
  SyncHrAttendanceInput,
  UpdateHrDepartmentInput,
  UpdateHrDesignationInput,
} from "@/modules/hr/types";

export const hrKeys = {
  all: () => withTenantKey(["hr"] as const),
  departments: (params?: Record<string, unknown>) => withTenantKey(["hr", "departments", params] as const),
  designations: (params?: Record<string, unknown>) => withTenantKey(["hr", "designations", params] as const),
  employees: (params?: Record<string, unknown>) => withTenantKey(["hr", "employees", params] as const),
  attendances: (params?: Record<string, unknown>) => withTenantKey(["hr", "attendances", params] as const),
  leaves: (params?: Record<string, unknown>) => withTenantKey(["hr", "leaves", params] as const),
  payrolls: (params?: Record<string, unknown>) => withTenantKey(["hr", "payrolls", params] as const),
};

function invalidateHr(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: hrKeys.all() });
}

export function useHrEmployees(params?: { per_page?: number; search?: string; status?: string; department?: string }) {
  return useQuery({ queryKey: hrKeys.employees(params), queryFn: () => hrApi.employees(params) });
}

export function useHrDepartments(params?: { per_page?: number; search?: string; status?: string }) {
  return useQuery({ queryKey: hrKeys.departments(params), queryFn: () => hrApi.departments(params) });
}

export function useHrDesignations(params?: { per_page?: number; search?: string; status?: string; department_id?: number | string }) {
  return useQuery({ queryKey: hrKeys.designations(params), queryFn: () => hrApi.designations(params) });
}

export function useHrAttendances(params?: { per_page?: number; status?: string; employee_id?: number | string }) {
  return useQuery({ queryKey: hrKeys.attendances(params), queryFn: () => hrApi.attendances(params) });
}

export function useHrLeaves(params?: { per_page?: number; status?: string; employee_id?: number | string; leave_type?: string }) {
  return useQuery({ queryKey: hrKeys.leaves(params), queryFn: () => hrApi.leaves(params) });
}

export function useHrPayrolls(params?: { per_page?: number; status?: string; employee_id?: number | string }) {
  return useQuery({ queryKey: hrKeys.payrolls(params), queryFn: () => hrApi.payrolls(params) });
}

export function useCreateHrEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrEmployeeInput) => hrApi.createEmployee(body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Employee created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create employee")),
  });
}

export function useCreateHrDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrDepartmentInput) => hrApi.createDepartment(body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Department created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create department")),
  });
}

export function useUpdateHrDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateHrDepartmentInput }) => hrApi.updateDepartment(id, body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Department updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update department")),
  });
}

export function useDeleteHrDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => hrApi.deleteDepartment(id),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Department deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete department")),
  });
}

export function useCreateHrDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrDesignationInput) => hrApi.createDesignation(body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Designation created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create designation")),
  });
}

export function useUpdateHrDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: UpdateHrDesignationInput }) => hrApi.updateDesignation(id, body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Designation updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update designation")),
  });
}

export function useDeleteHrDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => hrApi.deleteDesignation(id),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Designation deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete designation")),
  });
}

export function useUpdateHrEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: Partial<CreateHrEmployeeInput> }) =>
      hrApi.updateEmployee(id, body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Employee updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update employee")),
  });
}

export function useCreateHrAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrAttendanceInput) => hrApi.createAttendance(body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Attendance recorded");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to record attendance")),
  });
}

export function useSyncHrAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SyncHrAttendanceInput) => hrApi.syncAttendance(body),
    onSuccess: (res) => {
      invalidateHr(qc);
      showSideEffects(res.meta);
      toast.success("Attendance sync completed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to sync attendance")),
  });
}

export function useCreateHrLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrLeaveInput) => hrApi.createLeave(body),
    onSuccess: () => {
      invalidateHr(qc);
      toast.success("Leave request submitted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create leave request")),
  });
}

export function useApproveHrLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => hrApi.approveLeave(id),
    onSuccess: (res) => {
      invalidateHr(qc);
      showSideEffects(res.meta);
      toast.success("Leave approved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to approve leave")),
  });
}

export function useRejectHrLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => hrApi.rejectLeave(id),
    onSuccess: (res) => {
      invalidateHr(qc);
      showSideEffects(res.meta);
      toast.success("Leave rejected");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to reject leave")),
  });
}

export function useCreateHrPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHrPayrollInput) => hrApi.createPayroll(body),
    onSuccess: (res) => {
      invalidateHr(qc);
      showSideEffects(res.meta);
      toast.success("Payroll draft created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create payroll draft")),
  });
}

export function usePostHrPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => hrApi.postPayroll(id),
    onSuccess: (res) => {
      invalidateHr(qc);
      showSideEffects(res.meta);
      qc.invalidateQueries({ predicate: matchesTenantQueryKey(["finance"]) });
      toast.success("Payroll posted and journals created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to post payroll")),
  });
}

