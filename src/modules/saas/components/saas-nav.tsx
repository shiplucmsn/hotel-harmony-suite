import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, CreditCard, LayoutDashboard, Receipt, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/app/saas", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/saas/tenants", label: "Tenants", icon: Building2 },
  { to: "/app/saas/plans", label: "Plans", icon: CreditCard },
  { to: "/app/saas/billing", label: "Billing", icon: Receipt },
  { to: "/app/saas/revenue", label: "Revenue", icon: TrendingUp },
];

export function SaasNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-wrap gap-2 rounded-lg border bg-card p-1">
      {links.map((link) => {
        const active = link.exact ? pathname === link.to : pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
