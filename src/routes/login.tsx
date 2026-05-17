import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import type { ApiEnvelope } from "@/services/api/types";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestGate } from "@/hooks/use-guest-gate";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    redirectIfAuthenticated(search.redirect ?? DEFAULT_APP_ROUTE);
  },
  component: Login,
});

/** Remove before production — quick-fill seeded demo accounts */
const DEV_LOGIN_ACCOUNTS = [
  { label: "Super Admin", email: "superadmin@example.com", password: "password" },
  { label: "Company Admin", email: "admin@example.com", password: "password" },
  { label: "Employee", email: "employee@example.com", password: "password" },
] as const;

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const guestReady = useGuestGate(redirect);

  if (!guestReady) {
    return null;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Nebula workspace"
      footer={<>Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await api.post<ApiEnvelope<{ token: string; user: { id: string | number; name: string; email: string; tenant_id?: string } }>>(
              "/v1/auth/login",
              { email, password }
            );
            useAuthStore.getState().setSession(res.data.token, {
              id: res.data.user.id,
              name: res.data.user.name,
              email: res.data.user.email,
              tenantId: res.data.user.tenant_id,
            });
            toast.success("Signed in");
            const target = redirect?.startsWith("/app") ? redirect : DEFAULT_APP_ROUTE;
            navigate({ to: target });
          } catch {
            toast.error("Invalid credentials or API unavailable");
          }
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.8 0 3 .77 3.7 1.43l2.5-2.4C16.7 4.2 14.6 3.2 12 3.2 6.95 3.2 2.85 7.3 2.85 12.5S6.95 21.8 12 21.8c6.95 0 9.4-4.85 9.4-7.45 0-.5-.05-.9-.05-1.25z"/></svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.18c-3.2.69-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17a11 11 0 0 1 5.76 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.7 5.36-5.27 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            GitHub
          </Button>
        </div>
        <div className="relative my-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or continue with email</span>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal">Keep me signed in for 30 days</Label>
        </div>
        {import.meta.env.DEV ? (
          <div className="space-y-2 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Dev quick login</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {DEV_LOGIN_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal py-2 text-xs"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    toast.message(`Filled ${account.label}`);
                  }}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Sign in</Button>
      </form>
    </AuthLayout>
  );
}
