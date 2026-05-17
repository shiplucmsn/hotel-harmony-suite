import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE, DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAuthGate } from "@/hooks/use-auth-gate";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
  permission?: string;
  roles?: string[];
  fallback?: string;
};

/**
 * Client-side guard for permission-gated UI sections.
 * App shell already uses useAuthGate for route-level protection.
 */
export function ProtectedRoute({
  children,
  redirectTo,
  permission,
  roles,
  fallback = DEFAULT_APP_ROUTE,
}: ProtectedRouteProps) {
  const allowed = useAuthGate(redirectTo);
  const { user, hasPermission, hasRole, isAuthenticated } = useAuth();

  if (!allowed || !isAuthenticated) {
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }

  if (roles?.length && user && !roles.some((r) => hasRole(r)) && user.userType !== "super_admin") {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={DEFAULT_APP_ROUTE} replace />;
  }

  return <>{children}</>;
}
