import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { getPostAuthRoute } from "@/modules/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/stores/auth-store";

export function useVerifyEmail() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: ({ user: verifiedUser }) => {
      setUser(verifiedUser);
      toast.success("Email verified");
      const targetUser = verifiedUser ?? user;
      if (targetUser) {
        navigate({ to: getPostAuthRoute(targetUser, undefined), replace: true });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Verification failed"));
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => toast.success("Verification email sent"),
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to resend email")),
  });
}
