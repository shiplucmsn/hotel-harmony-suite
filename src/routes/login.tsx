import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useLogin } from "@/hooks/auth/use-login";
import { loginSchema, type LoginFormValues } from "@/modules/auth/schemas";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { AuthTextField } from "@/shared/components/auth/auth-text-field";
import { PasswordField } from "@/shared/components/auth/password-field";
import { getTenantId } from "@/lib/api-auth";
import {
  bootstrapTenantFromHostAsync,
  resolveTenantFromHostname,
  shouldHideManualTenantField,
} from "@/lib/tenant-resolve";
import { useTenantHostGate } from "@/hooks/use-tenant-host-gate";
import { TenantField } from "@/shared/components/auth/tenant-field";

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_SUBDOMAIN:
    "Invalid subdomain. This account belongs to another workspace — open your company URL to sign in.",
  TENANT_HOST_MISMATCH:
    "Invalid subdomain. This account belongs to another workspace — open your company URL to sign in.",
  TENANT_MISMATCH: "This account does not belong to this workspace.",
  TENANT_NOT_FOUND: "Workspace not found for this URL.",
};

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    reason: typeof search.reason === "string" ? search.reason : undefined,
    expected: typeof search.expected === "string" ? search.expected : undefined,
    workspace_url: typeof search.workspace_url === "string" ? search.workspace_url : undefined,
  }),
  beforeLoad: async ({ search }) => {
    await bootstrapTenantFromHostAsync();
    redirectIfAuthenticated(search.redirect ?? DEFAULT_APP_ROUTE);
  },
  component: LoginPage,
});

const DEV_LOGIN_ACCOUNTS = [
  { label: "Super Admin", email: "superadmin@example.com", password: "password" },
  { label: "Company Admin", email: "admin@example.com", password: "password" },
  { label: "Employee", email: "employee@example.com", password: "password" },
] as const;

function LoginPage() {
  const { redirect, reason, expected, workspace_url } = useSearch({ from: "/login" });
  const hostReady = useTenantHostGate();
  const guestReady = useGuestGate(redirect);
  const login = useLogin(redirect);
  const hostTenant = getTenantId();
  const hideTenantField = shouldHideManualTenantField();

  const form = useForm<LoginFormValues>({
    resolver: createZodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenantSlug: hostTenant ?? "",
      remember: false,
    },
  });

  useEffect(() => {
    if (!reason) return;
    const message = LOGIN_ERROR_MESSAGES[reason] ?? "Sign in failed. Check your workspace URL.";
    toast.error(message);
  }, [reason]);

  if (!hostReady || !guestReady) {
    return null;
  }

  const hostSlug = resolveTenantFromHostname();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        hostSlug
          ? `Sign in to workspace “${hostSlug}”`
          : "Sign in to your Nebula workspace"
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {reason === "INVALID_SUBDOMAIN" && expected ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Invalid subdomain. Your workspace is{" "}
          <span className="font-mono font-medium">{expected}</span>.
          {workspace_url ? (
            <>
              {" "}
              <a href={workspace_url} className="font-medium underline">
                Open correct login URL
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((v) =>
            login.mutate({
              ...v,
              tenantSlug: hostSlug ?? v.tenantSlug,
            }),
          )}
        >
          <div className="relative my-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              Sign in with email
            </span>
          </div>

          {!hideTenantField && <TenantField control={form.control} name="tenantSlug" optional />}

          <AuthTextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
          />

          <PasswordField control={form.control} name="password" label="Password" />
          <p className="-mt-2 text-right text-xs">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </p>

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">Keep me signed in for 30 days</FormLabel>
              </FormItem>
            )}
          />

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
                      form.setValue("email", account.email);
                      form.setValue("password", account.password);
                      if (hostSlug) {
                        form.setValue("tenantSlug", hostSlug);
                      }
                      toast.message(`Filled ${account.label}`);
                    }}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full border-0 gradient-primary text-primary-foreground"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
