import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const score = useMemo(() => {
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 25;
    if (/[^A-Za-z0-9]/.test(pw)) s += 25;
    return s;
  }, [pw]);
  const label = score < 50 ? "Weak" : score < 75 ? "Fair" : score < 100 ? "Good" : "Strong";

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start your 14-day free trial — no credit card required."
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); toast.success("Account created — check your email"); navigate({ to: "/verify-email" }); }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input required /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input required /></div>
        </div>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" required /></div>
        <div className="space-y-1.5"><Label>Company</Label><Input required /></div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          {pw && (
            <div className="flex items-center gap-2 pt-1">
              <Progress value={score} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          )}
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="terms" required className="mt-0.5" />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
            I agree to the <a className="text-primary hover:underline">Terms</a> and <a className="text-primary hover:underline">Privacy Policy</a>.
          </Label>
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Create account</Button>
      </form>
    </AuthLayout>
  );
}
