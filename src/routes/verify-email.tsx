import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({ component: VerifyEmail });

function VerifyEmail() {
  const [code, setCode] = useState("");
  const nav = useNavigate();
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a 6-digit code to alicia@acme.io"
      footer={<>Wrong email? <Link to="/register" className="text-primary font-medium hover:underline">Use another</Link></>}
    >
      <div className="space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button onClick={() => { toast.success("Email verified"); nav({ to: "/app/dashboard" }); }}
          disabled={code.length < 6} className="w-full gradient-primary text-primary-foreground border-0">
          Verify email
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't get it? <button onClick={() => toast("Code resent")} className="text-primary hover:underline">Resend code</button>
        </p>
      </div>
    </AuthLayout>
  );
}
