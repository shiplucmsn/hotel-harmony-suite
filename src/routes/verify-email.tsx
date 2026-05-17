import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { useGuestGate } from "@/hooks/use-guest-gate";
import { useAuth } from "@/hooks/auth/use-auth";
import { useResendVerification, useVerifyEmail } from "@/hooks/auth/use-verify-email";

export const Route = createFileRoute("/verify-email")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
    registered: search.registered === "1" || search.registered === true,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token, registered } = Route.useSearch();
  const guestReady = useGuestGate();
  const { user, isAuthenticated } = useAuth();
  const verify = useVerifyEmail();
  const resend = useResendVerification();

  useEffect(() => {
    if (token && token.length >= 32) {
      verify.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- verify once per token
  }, [token]);

  if (!guestReady) {
    return null;
  }

  const verifying = Boolean(token) && (verify.isPending || (!verify.isSuccess && !verify.isError));
  const failed = verify.isError;
  const succeeded = verify.isSuccess;

  return (
    <AuthLayout
      title={succeeded ? "Email verified" : "Verify your email"}
      subtitle={
        succeeded
          ? "Your email is confirmed. Redirecting to your workspace…"
          : registered
            ? `We sent a verification link to ${user?.email ?? "your inbox"}.`
            : "Open the link in your email, or paste it below if you were redirected here."
      }
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Use another
          </Link>
        </>
      }
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {verifying ? <Loader2 className="h-6 w-6 animate-spin" /> : <MailCheck className="h-6 w-6" />}
        </div>

        {verifying ? (
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        ) : null}

        {failed ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">Verification failed. The link may be invalid or expired.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login" search={{}}>Sign in</Link>
            </Button>
          </div>
        ) : null}

        {!token && !succeeded ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Check your inbox for a message from Nebula ERP and click the verification link.
            </p>
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={resend.isPending}
                onClick={() => resend.mutate()}
              >
                {resend.isPending ? "Sending…" : "Resend verification email"}
              </Button>
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" search={{}}>Sign in to resend</Link>
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}
