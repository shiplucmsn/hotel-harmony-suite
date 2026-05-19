import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Sun, Moon, LogOut, User, Settings, CreditCard, HelpCircle, Check, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { tenants } from "@/lib/mock-data";
import { NotificationBell } from "@/components/notification-bell";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/auth/use-logout";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  const [tenant, setTenant] = useState(tenants[0]);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      {/* Tenant switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
              {tenant.initials}
            </div>
            <div className="hidden flex-col items-start leading-tight md:flex">
              <span className="text-sm font-medium">{tenant.name}</span>
              <span className="text-[10px] text-muted-foreground">{tenant.plan} plan</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {tenants.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => setTenant(t)} className="gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
                {t.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{t.name}</span>
                <span className="text-[10px] text-muted-foreground">{t.plan}</span>
              </div>
              {t.id === tenant.id && <Check className="ml-auto h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2"><Building2 className="h-4 w-4" /> New workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <div className="ml-2 hidden flex-1 max-w-md md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search anything…" className="pl-9 bg-muted/50 border-0" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">⌘K</kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs">AR</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-tight lg:flex">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-[10px] text-muted-foreground">Administrator</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })} className="gap-2">
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/app/subscription" })} className="gap-2">
                <CreditCard className="h-4 w-4" /> Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <HelpCircle className="h-4 w-4" /> Help & support
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate(false)}
              disabled={logout.isPending}
              className="gap-2 text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
