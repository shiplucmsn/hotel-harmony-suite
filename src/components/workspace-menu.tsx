import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, ChevronDown, CreditCard, ExternalLink, LayoutTemplate, MapPin, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { userHasPermission } from "@/modules/auth/auth-redirect";
import { openApexSignup } from "@/lib/workspace-links";
import { buildWorkspaceUrl } from "@/lib/tenant-resolve";

function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatTrialLabel(trialEndsAt?: string | null): string | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
  return days === 0 ? "Trial ends today" : `${days}d left in trial`;
}

type WorkspaceMenuProps = {
  /** Compact trigger for collapsed sidebar contexts */
  compact?: boolean;
};

export function WorkspaceMenu({ compact = false }: WorkspaceMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tenantCtx } = useTenantContext();

  const workspaceName = tenantCtx?.name ?? tenantCtx?.tenant_id ?? "Workspace";
  const initials = workspaceInitials(workspaceName);
  const trialLabel =
    tenantCtx?.subscription_status === "trial" ? formatTrialLabel(tenantCtx.trial_ends_at) : null;
  const isPlatformAdmin =
    user?.userType === "super_admin" || userHasPermission(user, "platform.tenants.manage");
  const primaryHost = tenantCtx?.primary_host ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 max-w-[220px]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          {!compact ? (
            <>
              <div className="hidden min-w-0 flex-col items-start leading-tight md:flex">
                <span className="truncate text-sm font-medium">{workspaceName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {trialLabel ?? tenantCtx?.subscription_status ?? "workspace"}
                </span>
              </div>
              {trialLabel ? (
                <Badge variant="secondary" className="hidden shrink-0 text-[10px] lg:inline-flex">
                  Trial
                </Badge>
              ) : null}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{workspaceName}</span>
            {primaryHost ? (
              <span className="text-xs font-mono text-muted-foreground">{primaryHost}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/app/settings", search: { tab: "workspace" } })}>
          <LayoutTemplate className="h-4 w-4" />
          Company & branding
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/app/settings", search: { tab: "branches" } })}>
          <MapPin className="h-4 w-4" />
          Branches & locations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/app/subscription" })}>
          <CreditCard className="h-4 w-4" />
          Plans & subscription
        </DropdownMenuItem>
        {primaryHost ? (
          <DropdownMenuItem
            onClick={() => {
              const slug = tenantCtx?.slug ?? tenantCtx?.tenant_id ?? "";
              const url = buildWorkspaceUrl(slug, "/app/dashboard", primaryHost);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open workspace URL
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openApexSignup()}>
          <Plus className="h-4 w-4" />
          Register another company
        </DropdownMenuItem>
        {isPlatformAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Platform</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate({ to: "/app/saas/tenants" })}>
              <Sparkles className="h-4 w-4" />
              Provision & manage all
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/tenants">
                <Building2 className="h-4 w-4" />
                Workspace directory
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
