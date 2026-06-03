import { useNavigate } from "@tanstack/react-router";
import { Search, Sun, Moon, LogOut, User, Settings, CreditCard, HelpCircle, Building2 } from "lucide-react";
import { BranchSwitcher } from "@/components/branch-switcher";
import { WorkspaceMenu } from "@/components/workspace-menu";
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
import { NotificationBell } from "@/components/notification-bell";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/auth/use-logout";

function personInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Topbar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <WorkspaceMenu />
      <BranchSwitcher />

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                  {user?.name ? personInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-tight lg:flex">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-[10px] text-muted-foreground">Account</span>
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
              <DropdownMenuItem
                onClick={() => navigate({ to: "/app/settings", search: { tab: "workspace" } })}
                className="gap-2"
              >
                <Building2 className="h-4 w-4" /> Workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/app/settings", search: { tab: "company" } })}
                className="gap-2"
              >
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
