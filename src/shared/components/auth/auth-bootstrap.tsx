import { useAuthBootstrap } from "@/hooks/auth/use-auth-bootstrap";

/** Validates persisted JWT with /auth/me on app mount. */
export function AuthBootstrap() {
  useAuthBootstrap();
  return null;
}
