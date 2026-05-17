import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAccessToken, setAccessToken as persistToken, setTenantId as persistTenant } from "@/lib/api-auth";

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  tenantId?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (token, user) => {
        persistToken(token);
        if (user.tenantId) persistTenant(user.tenantId);
        set({ token, user, isAuthenticated: true });
      },
      clearSession: () => {
        persistToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },
      hydrate: () => {
        const token = getAccessToken();
        set({ token, isAuthenticated: Boolean(token) });
      },
    }),
    { name: "erp-auth", partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);
