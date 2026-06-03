import { getTenantBaseDomain } from "@/lib/tenant-resolve";

/** Marketing/signup host (apex), e.g. http://localhost:8080 from scl.localhost:8080 */
export function getApexAppUrl(path = "/"): string {
  const port = window.location.port ? `:${window.location.port}` : "";
  const protocol = window.location.protocol;
  const base = getTenantBaseDomain();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${protocol}//${base}${port}${normalized}`;
}

export function openApexSignup(): void {
  window.open(getApexAppUrl("/signup"), "_blank", "noopener,noreferrer");
}
