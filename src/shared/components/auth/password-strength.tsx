import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function PasswordStrength({ password, confirm }: { password: string; confirm?: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s += 25;
    if (/[A-Z]/.test(password)) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    return s;
  }, [password]);

  const label = score < 50 ? "Weak" : score < 75 ? "Fair" : score < 100 ? "Good" : "Strong";

  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
    ...(confirm !== undefined
      ? [{ label: "Passwords match", ok: password.length > 0 && password === confirm }]
      : []),
  ];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={score} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-xs">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            {c.ok ? <Check className="h-3.5 w-3.5 text-green-600" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
