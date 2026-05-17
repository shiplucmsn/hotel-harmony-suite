import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/auth/use-logout";

export const Route = createFileRoute("/access-pending")({
  ssr: false,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login", search: {} });
    }
  },
  component: AccessPendingPage,
});

function AccessPendingPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  if (user.mustChangePassword) {
    throw redirect({ to: "/change-password" });
  }

  if (!user.requiresRoleAssignment) {
    throw redirect({ to: "/app/dashboard" });
  }

  return (
    <AuthLayout title="Access pending" subtitle="Your account is active but no role is assigned yet. Contact your admin to grant module access.">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Logged in as <span className="font-medium text-foreground">{user.email}</span>
        </p>
        <Button variant="outline" className="w-full" onClick={() => logout.mutate()}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  );
}

