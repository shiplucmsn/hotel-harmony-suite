import { ApiError } from "@/lib/api-client";
import { getTenantId, setTenantId } from "@/lib/api-auth";
import { tenantApi } from "@/modules/platform/tenant-api";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "staging", "mail"]);

export type TenantHostStatus = "apex" | "workspace" | "not_found";

let bootstrapHost: string | null = null;
let bootstrapPromise: Promise<TenantHostStatus> | null = null;

/**
 * Resolve workspace slug from hostname pattern (not API validation).
 * Examples: acme.localhost → acme; acme.erp.example.com → acme; localhost → null.
 */
export function resolveTenantFromHostname(hostname: string = window.location.hostname): string | null {
  if (!hostname || hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return null;
  }

  const parts = hostname.split(".").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const sub = parts[0].toLowerCase();
  if (RESERVED_SUBDOMAINS.has(sub)) {
    return null;
  }

  if (parts[parts.length - 1] === "localhost" && parts.length >= 2) {
    return sub;
  }

  if (parts.length >= 3) {
    return sub;
  }

  return null;
}

export function hostnameLooksLikeWorkspace(host: string = window.location.hostname): boolean {
  if (!host || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return false;
  }
  return resolveTenantFromHostname(host) !== null || (!host.endsWith(".localhost") && host.includes("."));
}

export function isApexHostname(hostname: string = window.location.hostname): boolean {
  return !hostnameLooksLikeWorkspace(hostname);
}

export function getTenantBaseDomain(): string {
  const host = window.location.hostname;
  const slug = resolveTenantFromHostname(host);
  if (slug && host.toLowerCase().startsWith(`${slug}.`)) {
    return host.slice(slug.length + 1);
  }
  const envBase = import.meta.env.VITE_TENANT_BASE_DOMAIN;
  if (typeof envBase === "string" && envBase.length > 0) {
    return envBase;
  }
  return host === "localhost" ? "localhost" : host;
}

export function getSubdomainPreviewHost(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  const base = getTenantBaseDomain();
  if (!trimmed) {
    return base;
  }
  return `${trimmed}.${base}`;
}

/** Workspace URL on current SPA origin (not Laravel :8000). */
export function buildWorkspaceUrl(tenantId: string, path = "/", primaryHost?: string | null): string {
  const host = (primaryHost ?? getSubdomainPreviewHost(tenantId)).replace(/^https?:\/\//, "");
  const port = window.location.port ? `:${window.location.port}` : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.protocol}//${host}${port}${normalizedPath}`;
}

/** Post-signup login on the workspace subdomain. */
export function buildWorkspaceLoginUrl(tenantId: string, primaryHost?: string | null): string {
  return buildWorkspaceUrl(tenantId, "/login?registered=1", primaryHost);
}

/** @deprecated Use bootstrapTenantFromHostAsync */
export function bootstrapTenantFromHost(): string | null {
  const fromHost = resolveTenantFromHostname();
  if (fromHost) {
    setTenantId(fromHost);
    return fromHost;
  }
  return getTenantId();
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

async function resolveTenantHost(): Promise<TenantHostStatus> {
  const host = window.location.hostname;
  const looksLikeWorkspace = hostnameLooksLikeWorkspace(host);

  if (host && host !== "localhost" && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    try {
      const res = await tenantApi.resolvePublic(host);
      const tenantId = res.data?.tenant_id;
      if (tenantId) {
        setTenantId(tenantId);
        return "workspace";
      }
    } catch (error) {
      if (isNotFoundError(error) && looksLikeWorkspace) {
        return "not_found";
      }
    }
  }

  if (looksLikeWorkspace) {
    return "not_found";
  }

  return "apex";
}

/** Resolve tenant from host via public API only (no blind subdomain shortcut). */
export async function bootstrapTenantFromHostAsync(): Promise<TenantHostStatus> {
  const host = window.location.hostname;
  if (bootstrapHost !== host) {
    bootstrapHost = host;
    bootstrapPromise = null;
  }
  if (!bootstrapPromise) {
    bootstrapPromise = resolveTenantHost();
  }
  return bootstrapPromise;
}

export function resetTenantHostBootstrap(): void {
  bootstrapHost = null;
  bootstrapPromise = null;
}

export function shouldHideManualTenantField(): boolean {
  return !isApexHostname();
}
