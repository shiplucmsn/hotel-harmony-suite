import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rbacApi } from "@/modules/rbac/rbac-api";
import { getApiErrorMessage } from "@/lib/api-errors";

const keys = {
  roles: ["rbac", "roles"] as const,
  role: (id: number) => ["rbac", "roles", id] as const,
  permissions: ["rbac", "permissions"] as const,
  users: (search?: string) => ["rbac", "users", search] as const,
};

export function usePermissionCatalog() {
  return useQuery({
    queryKey: keys.permissions,
    queryFn: () => rbacApi.permissions(),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: keys.roles,
    queryFn: () => rbacApi.roles(),
  });
}

export function useRole(id: number | null) {
  return useQuery({
    queryKey: keys.role(id ?? 0),
    queryFn: () => rbacApi.role(id!),
    enabled: id != null,
  });
}

export function useRbacUsers(search?: string) {
  return useQuery({
    queryKey: keys.users(search),
    queryFn: () => rbacApi.users({ search, per_page: 50 }),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rbacApi.createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles });
      toast.success("Role created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to create role")),
  });
}

export function useUpdateRole(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; description?: string }) => rbacApi.updateRole(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles });
      qc.invalidateQueries({ queryKey: keys.role(id) });
      toast.success("Role updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update role")),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rbacApi.deleteRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles });
      toast.success("Role deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to delete role")),
  });
}

export function useSyncRolePermissions(roleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: number[]) => rbacApi.syncRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles });
      qc.invalidateQueries({ queryKey: keys.role(roleId) });
      toast.success("Permissions saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to save permissions")),
  });
}

export function useSyncUserRoles(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleIds: number[]) => rbacApi.syncUserRoles(userId, roleIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users() });
      toast.success("User roles updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to update user roles")),
  });
}
