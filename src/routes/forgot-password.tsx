import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/modules/auth/schemas";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { AuthTextField } from "@/shared/components/auth/auth-text-field";
import { TenantField } from "@/shared/components/auth/tenant-field";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  beforeLoad: () => redirectIfAuthenticated(DEFAULT_APP_ROUTE),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const guestReady = useGuestGate();
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: createZodResolver(forgotPasswordSchema),
    defaultValues: { email: "", tenantSlug: "" },
  });

  if (!guestReady) {
    return null;
  }

  const sent = forgot.isSuccess;

  return (
    <AuthLayout
      title={sent ? "Check your email" : "Forgot your password?"}
      subtitle={
        sent
          ? "We've sent reset instructions to your inbox."
          : "Enter your email and we'll send you a reset link."
      }
      footer={
        <Link to="/login" search={{}} className="font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, you&apos;ll receive a message shortly. The link expires in 1 hour.
          </p>
          <Button variant="outline" className="w-full" onClick={() => forgot.reset()}>
            Try another email
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => forgot.mutate(v))}>
            <TenantField control={form.control} name="tenantSlug" optional />
            <AuthTextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
            <Button
              type="submit"
              className="w-full border-0 gradient-primary text-primary-foreground"
              disabled={forgot.isPending}
            >
              {forgot.isPending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
}
