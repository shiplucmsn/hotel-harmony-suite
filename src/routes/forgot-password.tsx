import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPw });

function ForgotPw() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout
      title={sent ? "Check your email" : "Forgot your password?"}
      subtitle={sent ? "We've sent reset instructions to your inbox." : "Enter your email and we'll send you a reset link."}
      footer={<Link to="/login" className="text-primary font-medium hover:underline">← Back to sign in</Link>}
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">If an account exists for that email, you'll receive a message shortly. The link expires in 1 hour.</p>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>Try another email</Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); toast.success("Reset email sent"); setSent(true); }}
        >
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="you@company.com" required />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}
