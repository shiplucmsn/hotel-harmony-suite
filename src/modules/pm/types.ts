export type PmTaskStatus = "todo" | "in_progress" | "review" | "done";
export type PmTaskPriority = "low" | "med" | "high" | "urgent";

export type PmProjectDto = {
  id: number;
  code: string;
  name: string;
  status: string;
  deadline?: string | null;
};

export type PmTaskAssigneeDto = {
  id: number;
  employee_no: string;
  name: string;
};

export type PmTaskDto = {
  id: number;
  uuid?: string;
  reference?: string;
  title: string;
  description?: string | null;
  project_id: number;
  project?: string | null;
  project_name?: string | null;
  project_code?: string | null;
  assignee_ids?: number[];
  assignees?: PmTaskAssigneeDto[];
  assignee?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  due?: string | null;
  priority: PmTaskPriority;
  status: PmTaskStatus;
  estimate_hours: number;
  estimate?: number;
  logged_hours: number;
  logged?: number;
  progress_percent?: number;
};

export type PmTasksSummary = {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
};

export type PmTasksListResult = {
  data: PmTaskDto[];
  pagination?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  summary?: PmTasksSummary;
};

export type PmProjectsListResult = {
  data: PmProjectDto[];
  pagination?: PmTasksListResult["pagination"];
};

export type CreatePmTaskInput = {
  project_id: number;
  title: string;
  description?: string;
  assignee_ids?: number[];
  assignee_name?: string;
  due_date?: string;
  priority?: PmTaskPriority;
  status?: PmTaskStatus;
  estimate_hours?: number;
};

export type UpdatePmTaskInput = Partial<CreatePmTaskInput>;

export type LogPmTaskTimeInput = {
  hours: number;
};

export type CreatePmProjectInput = {
  code?: string;
  name: string;
  status?: string;
  deadline?: string;
};
