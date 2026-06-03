import { useAuthStore } from "@/stores/auth-store";
import { setAccessToken } from "@/lib/api-auth";
import { buildWorkspaceUrl, resolveTenantFromHostname } from "@/lib/tenant-resolve";

/** Block company users on another workspace subdomain (e.g. acme user on scl.localhost). */
export function enforceWorkspaceHostForUser(): boolean {
  if (typeof window === "undefined") return true;

  const hostSlug = resolveTenantFromHostname();
  if (!hostSlug) return true;

  const user = useAuthStore.getState().user;
  if (!user || user.userType === "super_admin") return true;

  const userSlug = (user.tenantId ?? user.company?.slug ?? "").trim().toLowerCase();
  if (!userSlug || userSlug === hostSlug) return true;

  setAccessToken(null);
  useAuthStore.getState().clearSession();

  const params = new URLSearchParams({
    reason: "INVALID_SUBDOMAIN",
    expected: userSlug,
    workspace_url: buildWorkspaceUrl(userSlug, "/login"),
  });
  window.location.replace(`/login?${params.toString()}`);
  return false;
}
