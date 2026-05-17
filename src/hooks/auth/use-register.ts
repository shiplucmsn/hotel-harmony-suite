import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/stores/auth-store";
import type { RegisterFormValues } from "@/modules/auth/schemas";

export function useRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        tenantSlug: values.tenantSlug,
      }),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Account created — verify your email");
      navigate({ to: "/verify-email", search: { registered: "1" }, replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Registration failed"));
    },
  });
}
