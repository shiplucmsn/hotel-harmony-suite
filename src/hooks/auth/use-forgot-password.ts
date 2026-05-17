import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { ForgotPasswordFormValues } from "@/modules/auth/schemas";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      authApi.forgotPassword({ email: values.email, tenantSlug: values.tenantSlug }),
    onSuccess: () => {
      toast.success("If an account exists, we sent reset instructions");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to send reset email"));
    },
  });
}
