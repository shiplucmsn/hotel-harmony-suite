import { Outlet, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthGate } from "@/hooks/use-auth-gate";

export function AppShell() {
  const href = useRouterState({ select: (s) => s.location.href });
  const allowed = useAuthGate(href);

  if (!allowed) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <Topbar />
          <main className="flex-1 animate-fade-in p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
