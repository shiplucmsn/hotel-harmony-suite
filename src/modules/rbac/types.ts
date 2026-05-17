export type PermissionDto = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  module: string;
  description?: string | null;
};

export type PermissionGroup = Record<string, PermissionDto[]>;

export type RoleDto = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  company_id?: number | null;
  users_count?: number;
  permissions_count?: number;
  permissions?: PermissionDto[];
};

export type RbacUserDto = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  user_type: string;
  is_active: boolean;
  branch_id?: number | null;
  roles?: { id: number; slug: string; name: string }[];
  permissions: string[];
};
