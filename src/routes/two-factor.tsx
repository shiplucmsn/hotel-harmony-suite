import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/two-factor")({ component: TwoFactor });

function TwoFactor() {
  const [code, setCode] = useState("");
  const nav = useNavigate();
  return (
    <AuthLayout
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app."
      footer={<Link to="/login" className="text-primary font-medium hover:underline">← Back to sign in</Link>}
    >
      <div className="space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button onClick={() => { toast.success("Verified"); nav({ to: "/app/dashboard" }); }}
          disabled={code.length < 6} className="w-full gradient-primary text-primary-foreground border-0">
          Verify and continue
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <button className="hover:text-foreground hover:underline">Use a recovery code instead</button>
        </div>
      </div>
    </AuthLayout>
  );
}
