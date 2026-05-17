import { getAccessToken } from "@/lib/api-auth";

/** True only in the browser when a JWT is stored. */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(getAccessToken());
}
