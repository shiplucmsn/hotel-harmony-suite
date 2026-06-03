import { Outlet, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { useTicketRealtime } from "@/hooks/use-ticket-realtime";
import { useRestrictedSubscriptionGate } from "@/hooks/use-restricted-subscription-gate";

export function AppShell() {
  const href = useRouterState({ select: (s) => s.location.href });
  const allowed = useAuthGate(href);
  useRestrictedSubscriptionGate(allowed);
  useTicketRealtime(allowed);
  useNotificationRealtime(allowed);

  if (!allowed) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-col overflow-x-hidden">
          <Topbar />
          <main className="min-w-0 flex-1 animate-fade-in overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
