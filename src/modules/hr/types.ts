import type { ApiEnvelope } from "@/services/api/types";

export type PaginatedResult<T> = {
  data: T[];
  pagination?: ApiEnvelope<T[]>["meta"]["pagination"];
};

export type HrEmployeeDto = {
  id: number;
  user_id?: number | null;
  employee_no: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department_id?: number | null;
  department?: string | null;
  department_name?: string | null;
  designation_id?: number | null;
  designation?: string | null;
  designation_name?: string | null;
  join_date?: string | null;
  basic_salary: number;
  payroll_frequency?: "weekly" | "biweekly" | "monthly" | string;
  bank_account?: string | null;
  status: "active" | "inactive" | "terminated" | string;
  login_provision_status?: "not_provisioned" | "provisioned" | "invite_sent" | "failed" | string;
  meta?: Record<string, unknown> | null;
};

export type HrDepartmentDto = {
  id: number;
  name: string;
  head_employee_id?: number | null;
  head_employee_name?: string | null;
  description?: string | null;
  status: "active" | "inactive" | string;
  members_count: number;
};

export type HrDesignationDto = {
  id: number;
  title: string;
  level?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  description?: string | null;
  status: "active" | "inactive" | string;
  members_count: number;
};

export type HrAttendanceDto = {
  id: number;
  employee_id: number;
  employee_no?: string | null;
  employee_name?: string | null;
  attendance_date: string;
  check_in_at?: string | null;
  check_out_at?: string | null;
  worked_minutes: number;
  status: "present" | "absent" | "late" | "half_day" | "leave" | string;
  source: "manual" | "device" | "api" | string;
  external_ref?: string | null;
  sync_status?: "synced" | "pending" | "failed" | string;
  synced_at?: string | null;
  notes?: string | null;
};

export type HrLeaveDto = {
  id: number;
  employee_id: number;
  employee_no?: string | null;
  employee_name?: string | null;
  leave_type: "annual" | "sick" | "casual" | "unpaid" | string;
  start_date: string;
  end_date: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | string;
  reason?: string | null;
  approved_by_user_id?: number | null;
  approved_at?: string | null;
};

export type HrPayrollDto = {
  id: number;
  employee_id: number;
  employee_no?: string | null;
  employee_name?: string | null;
  number: string;
  period_start: string;
  period_end: string;
  basic_amount: number;
  allowance_amount: number;
  deduction_amount: number;
  tax_amount: number;
  net_amount: number;
  status: "draft" | "posted" | "paid" | "void" | string;
  payment_method: "cash" | "bank" | string;
  paid_at?: string | null;
  journal_entry_id?: number | null;
  idempotency_key?: string | null;
  memo?: string | null;
};

export type CreateHrEmployeeInput = {
  employee_no: string;
  name: string;
  email?: string;
  phone?: string;
  department_id?: number;
  department?: string;
  designation_id?: number;
  designation?: string;
  join_date?: string;
  basic_salary?: number;
  payroll_frequency?: "weekly" | "biweekly" | "monthly";
  bank_account?: string;
  status?: "active" | "inactive" | "terminated";
  create_login?: boolean;
  force_reprovision_login?: boolean;
};

export type CreateHrDepartmentInput = {
  name: string;
  head_employee_id?: number;
  description?: string;
  status?: "active" | "inactive";
};

export type UpdateHrDepartmentInput = Partial<CreateHrDepartmentInput>;

export type CreateHrDesignationInput = {
  title: string;
  level?: string;
  department_id?: number;
  description?: string;
  status?: "active" | "inactive";
};

export type UpdateHrDesignationInput = Partial<CreateHrDesignationInput>;

export type CreateHrAttendanceInput = {
  employee_id: number;
  attendance_date: string;
  check_in_at?: string;
  check_out_at?: string;
  worked_minutes?: number;
  status?: "present" | "absent" | "late" | "half_day" | "leave";
  source?: "manual" | "device" | "api";
  external_ref?: string;
  notes?: string;
};

export type SyncHrAttendanceInput = {
  source?: "manual" | "device" | "api";
  rows: Array<{
    employee_id?: number;
    employee_no?: string;
    attendance_date?: string;
    date?: string;
    check_in_at?: string;
    check_out_at?: string;
    worked_minutes?: number;
    status?: "present" | "absent" | "late" | "half_day" | "leave";
    external_ref?: string;
    notes?: string;
  }>;
};

export type CreateHrLeaveInput = {
  employee_id: number;
  leave_type?: "annual" | "sick" | "casual" | "unpaid";
  start_date: string;
  end_date: string;
  days?: number;
  reason?: string;
};

export type CreateHrPayrollInput = {
  employee_id: number;
  number?: string;
  period_start: string;
  period_end: string;
  basic_amount?: number;
  allowance_amount?: number;
  deduction_amount?: number;
  tax_amount?: number;
  payment_method?: "cash" | "bank";
  idempotency_key?: string;
  memo?: string;
};

