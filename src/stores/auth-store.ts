import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/modules/auth/auth-api";
import type { AuthSessionResponse, AuthUser } from "@/modules/auth/types";
import { getAccessToken, setAccessToken as persistToken, setTenantId as persistTenant } from "@/lib/api-auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: AuthSessionResponse) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
  fetchMe: () => Promise<AuthUser>;
  refreshSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setSession: (session) => {
        persistToken(session.token);
        if (session.user.tenantId) {
          persistTenant(session.user.tenantId);
        }
        set({
          token: session.token,
          user: session.user,
          isAuthenticated: true,
          isHydrated: true,
        });
      },

      setUser: (user) => set({ user }),

      clearSession: () => {
        persistToken(null);
        set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
      },

      hydrate: () => {
        const token = getAccessToken();
        const state = get();
        set({
          token,
          isAuthenticated: Boolean(token),
          isHydrated: true,
          user: state.user,
        });
      },

      fetchMe: async () => {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isHydrated: true });
        return user;
      },

      refreshSession: async () => {
        const session = await authApi.refresh();
        get().setSession(session);
      },
    }),
    {
      name: "erp-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
