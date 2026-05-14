import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPw });

function ResetPw() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const nav = useNavigate();
  const checks = useMemo(() => ([
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "One number", ok: /[0-9]/.test(pw) },
    { label: "Passwords match", ok: pw.length > 0 && pw === confirm },
  ]), [pw, confirm]);

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={<Link to="/login" className="text-primary font-medium hover:underline">← Back to sign in</Link>}
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Password updated"); nav({ to: "/login" }); }}>
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
        <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-xs">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.ok ? <Check className="h-3.5 w-3.5 text-success" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
            </li>
          ))}
        </ul>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={!checks.every((c) => c.ok)}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
