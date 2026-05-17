const TENANT_KEY = "erp_tenant_id";
const TOKEN_KEY = "erp_access_token";

export function getTenantId(): string {
  if (typeof window === "undefined") return "demo_tenant";
  return localStorage.getItem(TENANT_KEY) ?? "demo_tenant";
}

export function setTenantId(tenantId: string) {
  localStorage.setItem(TENANT_KEY, tenantId);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function buildApiHeaders(extra?: Record<string, string>, forWrite = false): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Tenant-Id": getTenantId(),
    "X-Request-Id": crypto.randomUUID(),
    ...extra,
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (forWrite) {
    headers["Idempotency-Key"] = crypto.randomUUID();
  }

  return headers;
}
