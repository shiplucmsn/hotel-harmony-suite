import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { redirectIfAuthenticated } from "@/core/auth/redirect-if-authenticated";
import { DEFAULT_APP_ROUTE } from "@/config/routes";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useResetPassword } from "@/hooks/auth/use-reset-password";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/modules/auth/schemas";
import { createZodResolver } from "@/shared/components/forms/zod-form";
import { PasswordField } from "@/shared/components/auth/password-field";
import { PasswordStrength } from "@/shared/components/auth/password-strength";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    email: typeof search.email === "string" ? search.email : "",
  }),
  beforeLoad: () => redirectIfAuthenticated(DEFAULT_APP_ROUTE),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, email } = Route.useSearch();
  const guestReady = useGuestGate();
  const reset = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: createZodResolver(resetPasswordSchema),
    defaultValues: {
      email: email ?? "",
      token: token ?? "",
      password: "",
      passwordConfirmation: "",
    },
  });

  useEffect(() => {
    if (email) form.setValue("email", email);
    if (token) form.setValue("token", token);
  }, [email, token, form]);

  const password = form.watch("password");
  const passwordConfirmation = form.watch("passwordConfirmation");
  const hasToken = Boolean(token && token.length >= 32);

  if (!guestReady) {
    return null;
  }

  if (!hasToken) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="Request a new password reset email to continue."
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Request reset link
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          This link is missing or expired. Password reset links are valid for a limited time.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link to="/login" search={{}} className="font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit((v) => reset.mutate(v))}>
          <PasswordField control={form.control} name="password" label="New password" />
          <PasswordStrength password={password} confirm={passwordConfirmation} />
          <PasswordField control={form.control} name="passwordConfirmation" label="Confirm password" />
          <Button
            type="submit"
            className="w-full border-0 gradient-primary text-primary-foreground"
            disabled={reset.isPending || !form.formState.isValid}
          >
            {reset.isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
