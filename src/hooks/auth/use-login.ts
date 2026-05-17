import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { getPostAuthRoute } from "@/modules/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginFormValues } from "@/modules/auth/schemas";

export function useLogin(redirect?: string) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      authApi.login({
        email: values.email,
        password: values.password,
        tenantSlug: values.tenantSlug,
      }),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Signed in successfully");
      navigate({ to: getPostAuthRoute(session.user, redirect), replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid credentials"));
    },
  });
}
