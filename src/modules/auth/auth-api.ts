import { api } from "@/lib/api-client";
import { getTenantId, setTenantId } from "@/lib/api-auth";
import type { ApiEnvelope } from "@/services/api/types";
import type { AuthMessageResponse, AuthSessionResponse, AuthUser } from "@/modules/auth/types";

function tenantHeaders(tenantSlug?: string) {
  const slug = tenantSlug ?? getTenantId();
  return slug ? { "X-Tenant-Id": slug } : undefined;
}

function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: raw.id as string | number,
    uuid: raw.uuid as string | undefined,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    tenantId: (raw.tenant_id as string | null) ?? null,
    companyId: (raw.company_id as number | null) ?? null,
    branchId: (raw.branch_id as number | null) ?? null,
    userType: (raw.user_type as AuthUser["userType"]) ?? "employee",
    isActive: Boolean(raw.is_active ?? true),
    mustChangePassword: Boolean(raw.must_change_password ?? false),
    requiresRoleAssignment: Boolean(raw.requires_role_assignment ?? false),
    emailVerified: Boolean(raw.email_verified),
    roles: Array.isArray(raw.roles) ? (raw.roles as string[]) : [],
    permissions: Array.isArray(raw.permissions) ? (raw.permissions as string[]) : [],
    enabledModules: Array.isArray(raw.enabled_modules)
      ? (raw.enabled_modules as string[])
      : [],
    company: (raw.company as AuthUser["company"]) ?? null,
    branch: (raw.branch as AuthUser["branch"]) ?? null,
  };
}

function unwrapSession(res: ApiEnvelope<{ token: string; user: Record<string, unknown> }>): AuthSessionResponse {
  return {
    token: res.data.token,
    user: mapUser(res.data.user),
  };
}

export const authApi = {
  login: async (body: { email: string; password: string; tenantSlug?: string }) => {
    const slug = body.tenantSlug?.trim() ?? "";
    if (slug) setTenantId(slug);
    const res = await api.post<ApiEnvelope<{ token: string; user: Record<string, unknown> }>>(
      "/v1/auth/login",
      { email: body.email, password: body.password },
      { headers: tenantHeaders(slug || undefined) }
    );
    const session = unwrapSession(res);
    if (session.user.tenantId) {
      setTenantId(session.user.tenantId);
    }
    return session;
  },

  register: async (body: {
    name: string;
    email: string;
    password: string;
    tenantSlug: string;
  }) => {
    setTenantId(body.tenantSlug);
    const res = await api.post<ApiEnvelope<{ token: string; user: Record<string, unknown> }>>(
      "/v1/auth/register",
      {
        name: body.name,
        email: body.email,
        password: body.password,
        password_confirmation: body.password,
        tenant_id: body.tenantSlug,
      },
      { headers: tenantHeaders(body.tenantSlug) }
    );
    return unwrapSession(res);
  },

  me: async () => {
    const res = await api.get<ApiEnvelope<Record<string, unknown>>>("/v1/auth/me", {
      headers: tenantHeaders(),
    });
    return mapUser(res.data);
  },

  refresh: async () => {
    const res = await api.post<ApiEnvelope<{ token: string; user: Record<string, unknown> }>>(
      "/v1/auth/refresh",
      {}
    );
    return unwrapSession(res);
  },

  logout: async (allDevices = false) => {
    const path = allDevices ? "/v1/auth/logout?all_devices=1" : "/v1/auth/logout";
    await api.post<ApiEnvelope<AuthMessageResponse>>(path, {});
  },

  forgotPassword: async (body: { email: string; tenantSlug?: string }) => {
    const res = await api.post<ApiEnvelope<AuthMessageResponse>>(
      "/v1/auth/forgot-password",
      { email: body.email },
      { headers: tenantHeaders(body.tenantSlug) }
    );
    return res.data;
  },

  resetPassword: async (body: {
    email: string;
    token: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    const res = await api.post<ApiEnvelope<AuthMessageResponse>>("/v1/auth/reset-password", {
      email: body.email,
      token: body.token,
      password: body.password,
      password_confirmation: body.passwordConfirmation,
    });
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.post<ApiEnvelope<{ message: string; user: Record<string, unknown> }>>(
      "/v1/auth/verify-email",
      { token }
    );
    return { message: res.data.message, user: mapUser(res.data.user) };
  },

  resendVerification: async () => {
    const res = await api.post<ApiEnvelope<AuthMessageResponse>>("/v1/auth/resend-verification", {});
    return res.data;
  },

  changePassword: async (body: { currentPassword: string; password: string; passwordConfirmation: string }) => {
    const res = await api.post<ApiEnvelope<{ message: string; user: Record<string, unknown> }>>("/v1/auth/change-password", {
      current_password: body.currentPassword,
      password: body.password,
      password_confirmation: body.passwordConfirmation,
    });
    return { message: res.data.message, user: mapUser(res.data.user) };
  },
};
