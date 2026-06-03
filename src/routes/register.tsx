import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useTenantHostGate } from "@/hooks/use-tenant-host-gate";
import { useRegister } from "@/hooks/auth/use-register";
import { registerSchema, type RegisterFormValues } from "@/modules/auth/schemas";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { AuthTextField } from "@/shared/components/auth/auth-text-field";
import { PasswordField } from "@/shared/components/auth/password-field";
import { TenantField } from "@/shared/components/auth/tenant-field";
import { PasswordStrength } from "@/shared/components/auth/password-strength";

export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: () => redirectIfAuthenticated(DEFAULT_APP_ROUTE),
  component: RegisterPage,
});

function RegisterPage() {
  const hostReady = useTenantHostGate();
  const guestReady = useGuestGate();
  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: createZodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      tenantSlug: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");
  const passwordConfirmation = form.watch("passwordConfirmation");

  if (!hostReady || !guestReady) {
    return null;
  }

  return (
    <AuthLayout
      title="Join your workspace"
      subtitle="Your company already has a workspace. Ask your admin for the subdomain, then create your account."
      footer={
        <>
          Need a new company workspace?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Start 7-day trial
          </Link>
          {" · "}
          <Link to="/login" search={{}} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit((v) => register.mutate(v))}>
          <AuthTextField control={form.control} name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" />
          <AuthTextField
            control={form.control}
            name="email"
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
          <TenantField control={form.control} name="tenantSlug" />
          <PasswordField control={form.control} name="password" label="Password" />
          <PasswordStrength password={password} confirm={passwordConfirmation} />
          <PasswordField control={form.control} name="passwordConfirmation" label="Confirm password" />
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full border-0 gradient-primary text-primary-foreground"
            disabled={register.isPending}
          >
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
