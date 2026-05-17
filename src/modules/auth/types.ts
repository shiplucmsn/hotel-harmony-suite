export type UserType = "super_admin" | "company_admin" | "employee";

export type AuthCompany = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
};

export type AuthBranch = {
  id: number;
  uuid: string;
  code: string;
  name: string;
};

export type AuthUser = {
  id: string | number;
  uuid?: string;
  name: string;
  email: string;
  tenantId?: string | null;
  companyId?: number | null;
  branchId?: number | null;
  userType: UserType;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
  enabledModules: string[];
  company?: AuthCompany | null;
  branch?: AuthBranch | null;
};

export type AuthSessionResponse = {
  token: string;
  user: AuthUser;
};

export type AuthMessageResponse = {
  message: string;
};
