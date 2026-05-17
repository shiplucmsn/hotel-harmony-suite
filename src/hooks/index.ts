export { useApiQuery } from "@/hooks/use-api-query";
export { useApiMutation } from "@/hooks/use-api-mutation";
export { useAuth } from "@/hooks/use-auth";
export { useAuthGate } from "@/hooks/use-auth-gate";
export { useGuestGate } from "@/hooks/use-guest-gate";
export { usePermissions } from "@/hooks/rbac/use-permissions";
export {
  usePermissionCatalog,
  useRoles,
  useRole,
  useRbacUsers,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSyncRolePermissions,
  useSyncUserRoles,
} from "@/hooks/rbac";
export {
  useAuthBootstrap,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useResendVerification,
} from "@/hooks/auth";
export { useApiQuery as useLegacyApiQuery, useApiMutation as useLegacyApiMutation } from "@/lib/use-api";
