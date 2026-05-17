import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type { PermissionGroup, RbacUserDto, RoleDto } from "@/modules/rbac/types";

type PaginatedMeta = {
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
};

export const rbacApi = {
  permissions: () =>
    api.get<ApiEnvelope<PermissionGroup>>("/v1/rbac/permissions").then((r) => r.data),

  roles: () => api.get<ApiEnvelope<RoleDto[]>>("/v1/rbac/roles").then((r) => r.data),

  role: (id: number) => api.get<ApiEnvelope<RoleDto>>(`/v1/rbac/roles/${id}`).then((r) => r.data),

  createRole: (body: { name: string; slug?: string; description?: string }) =>
    api.post<ApiEnvelope<RoleDto>>("/v1/rbac/roles", body).then((r) => r.data),

  updateRole: (id: number, body: { name?: string; description?: string }) =>
    api.patch<ApiEnvelope<RoleDto>>(`/v1/rbac/roles/${id}`, body).then((r) => r.data),

  deleteRole: (id: number) =>
    api.delete<ApiEnvelope<{ deleted: boolean }>>(`/v1/rbac/roles/${id}`).then((r) => r.data),

  syncRolePermissions: (id: number, permissionIds: number[]) =>
    api
      .put<ApiEnvelope<RoleDto>>(`/v1/rbac/roles/${id}/permissions`, { permission_ids: permissionIds })
      .then((r) => r.data),

  users: (params?: { search?: string; page?: number; per_page?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.per_page) q.set("per_page", String(params.per_page));
    const qs = q.toString();

    return api
      .get<ApiEnvelope<RbacUserDto[]> & PaginatedMeta>(`/v1/rbac/users${qs ? `?${qs}` : ""}`)
      .then((r) => ({ data: r.data, meta: r.meta }));
  },

  syncUserRoles: (userId: number, roleIds: number[], branchId?: number) =>
    api
      .put<ApiEnvelope<RbacUserDto>>(`/v1/rbac/users/${userId}/roles`, {
        role_ids: roleIds,
        branch_id: branchId,
      })
      .then((r) => r.data),
};
