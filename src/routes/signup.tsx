import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { isAuthenticated } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useTenantHostGate } from "@/hooks/use-tenant-host-gate";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { AuthTextField } from "@/shared/components/auth/auth-text-field";
import { PasswordField } from "@/shared/components/auth/password-field";
import { PasswordStrength } from "@/shared/components/auth/password-strength";
import { workspaceRegisterApi } from "@/modules/platform/workspace-register-api";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  bootstrapTenantFromHostAsync,
  buildWorkspaceLoginUrl,
  buildWorkspaceUrl,
  getSubdomainPreviewHost,
  getTenantBaseDomain,
} from "@/lib/tenant-resolve";

const signupSchema = z
  .object({
    company_name: z.string().min(2, "Company name is required"),
    slug: z
      .string()
      .min(2, "Subdomain is required")
      .max(64)
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Use lowercase letters, numbers, and hyphens"),
    owner_name: z.string().min(2, "Your name is required"),
    owner_email: z.string().email("Valid email required"),
    password: z.string().min(8, "At least 8 characters"),
    passwordConfirmation: z.string().min(8),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Accept the terms to continue" }) }),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: async () => {
    const status = await bootstrapTenantFromHostAsync();
    if (status === "workspace" || status === "not_found") {
      throw redirect({ to: "/workspace-not-found" });
    }
    if (isAuthenticated()) {
      const tenantId = useAuthStore.getState().user?.tenantId;
      if (tenantId) {
        window.location.replace(buildWorkspaceUrl(tenantId, "/app/dashboard"));
        return;
      }
    }
    redirectIfAuthenticated();
  },
  component: SignupPage,
});

function SignupPage() {
  const hostReady = useTenantHostGate();
  const guestReady = useGuestGate();

  const form = useForm<SignupFormValues>({
    resolver: createZodResolver(signupSchema),
    defaultValues: {
      company_name: "",
      slug: "",
      owner_name: "",
      owner_email: "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
    },
  });

  const slug = form.watch("slug");
  const previewHost = useMemo(() => getSubdomainPreviewHost(slug), [slug]);
  const baseDomain = getTenantBaseDomain();

  const register = useMutation({
    mutationFn: workspaceRegisterApi.register,
    onSuccess: (res) => {
      const data = res.data;
      if (data?.tenant_id) {
        window.location.href = buildWorkspaceLoginUrl(data.tenant_id, data.primary_host);
        return;
      }
      toast.success("Workspace created. Sign in on your workspace URL.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not create workspace")),
  });

  const password = form.watch("password");
  const passwordConfirmation = form.watch("passwordConfirmation");

  if (!hostReady || !guestReady) {
    return null;
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="7-day free trial. Your team signs in only on your subdomain."
      footer={
        <>
          Already have a workspace?{" "}
          <Link to="/login" search={{}} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Join existing
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((v) =>
            register.mutate({
              company_name: v.company_name,
              slug: v.slug.toLowerCase(),
              owner_name: v.owner_name,
              owner_email: v.owner_email,
              password: v.password,
            }),
          )}
        >
          <AuthTextField control={form.control} name="company_name" label="Company name" placeholder="Acme Industries" />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace subdomain</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input className="rounded-r-none font-mono" placeholder="acme" {...field} />
                  </FormControl>
                  <span className="inline-flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-xs text-muted-foreground">
                    .{baseDomain}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your URL: <span className="font-mono text-foreground">{previewHost || "—"}</span>
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <AuthTextField control={form.control} name="owner_name" label="Your name" placeholder="Jane Doe" />
          <AuthTextField
            control={form.control}
            name="owner_email"
            label="Work email"
            type="email"
            placeholder="you@company.com"
          />
          <PasswordField control={form.control} name="password" label="Password" />
          <PasswordStrength password={password} confirm={passwordConfirmation} />
          <PasswordField control={form.control} name="passwordConfirmation" label="Confirm password" />
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value === true} onCheckedChange={(v) => field.onChange(v === true)} />
                </FormControl>
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  I agree to the terms and privacy policy.
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full border-0 gradient-primary text-primary-foreground"
            disabled={register.isPending}
          >
            {register.isPending ? "Creating workspace…" : "Start 7-day trial"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
