import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/modules/auth/auth-api";
import { getPostAuthRoute } from "@/modules/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api-errors";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/change-password")({
  ssr: false,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login", search: {} });
    }

    const user = useAuthStore.getState().user;
    if (user && !user.mustChangePassword) {
      throw redirect({ to: getPostAuthRoute(user) });
    }
  },
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      navigate({ to: getPostAuthRoute(user), replace: true });
    }
  }, [user, navigate]);

  if (!user?.mustChangePassword) {
    return null;
  }

  return (
    <AuthLayout title="Change your password" subtitle="You must set a new password before accessing the system.">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (password !== passwordConfirmation) {
            toast.error("Passwords do not match");
            return;
          }
          setSubmitting(true);
          try {
            const response = await authApi.changePassword({ currentPassword, password, passwordConfirmation });
            setUser(response.user);
            toast.success(response.message);
            navigate({ to: getPostAuthRoute(response.user), replace: true });
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to change password"));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="current_password">Current password</Label>
          <Input
            id="current_password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm new password</Label>
          <Input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={submitting}>
          {submitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
