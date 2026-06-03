import { ApiError } from "@/lib/api-client";
import { setAccessToken } from "@/lib/api-auth";

const TENANT_LOGIN_CODES = new Set([
  "TENANT_MISMATCH",
  "TENANT_INACTIVE",
  "TENANT_HOST_MISMATCH",
  "INVALID_SUBDOMAIN",
  "TENANT_NOT_FOUND",
]);

const SUBSCRIPTION_BLOCK_CODES = new Set(["SUBSCRIPTION_SUSPENDED", "SUBSCRIPTION_EXPIRED"]);

type ErrorPayload = {
  error?: { code?: string; message?: string };
};

export function getTenantErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const payload = error.payload as ErrorPayload;
  return payload?.error?.code ?? null;
}

/** Clears session and redirects to login when tenant context is invalid. Returns true if handled. */
export function handleTenantApiError(error: unknown): boolean {
  const code = getTenantErrorCode(error);
  if (!code) {
    return false;
  }

  if (SUBSCRIPTION_BLOCK_CODES.has(code)) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/app/subscription")) {
      window.location.href = "/app/subscription?reason=trial_expired";
    }
    return true;
  }

  if (!TENANT_LOGIN_CODES.has(code)) {
    return false;
  }

  setAccessToken(null);
  if (typeof window !== "undefined") {
    const params = new URLSearchParams({ reason: code });
    if (code === "TENANT_NOT_FOUND") {
      window.location.href = `/workspace-not-found?${params.toString()}`;
    } else {
      window.location.href = `/login?${params.toString()}`;
    }
  }

  return true;
}
