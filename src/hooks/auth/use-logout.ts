import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/modules/auth/auth-api";
import { DEFAULT_AUTH_ROUTE } from "@/config/routes";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/stores/auth-store";

export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: (allDevices = false) => authApi.logout(allDevices),
    onSettled: () => {
      clearSession();
      navigate({ to: DEFAULT_AUTH_ROUTE, search: {}, replace: true });
    },
    onSuccess: () => {
      toast.success("Signed out");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Sign out failed"));
    },
  });
}
