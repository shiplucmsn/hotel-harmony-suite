import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { ResetPasswordFormValues } from "@/modules/auth/schemas";

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      authApi.resetPassword({
        email: values.email,
        token: values.token,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      }),
    onSuccess: () => {
      toast.success("Password updated — sign in with your new password");
      navigate({ to: "/login", search: {}, replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to reset password"));
    },
  });
}
