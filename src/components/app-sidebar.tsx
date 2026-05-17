import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { isNavItemActive, mergeSectionsOpen, resolveNavMenu, sectionHasActiveRoute } from "@/config/navigation";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";

 
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const menu = useMemo(() => resolveNavMenu(undefined, user), [user]);
  const sidebarSectionsOpen = useUiStore((s) => s.sidebarSectionsOpen);
  const setSectionOpen = useUiStore((s) => s.setSectionOpen);
  const setSectionsOpen = useUiStore((s) => s.setSectionsOpen);

  const open = useMemo(
    () => mergeSectionsOpen(sidebarSectionsOpen, pathname),
    [pathname, sidebarSectionsOpen]
  );

  useEffect(() => {
    setSectionsOpen((prev) => mergeSectionsOpen(prev, pathname));
  }, [pathname, setSectionsOpen]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Nebula ERP</span>
              <span className="text-xs text-muted-foreground">{user?.name ?? "Acme Industries"}</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((section) => {
                const isActive = sectionHasActiveRoute(pathname, section);
                const isOpen = !!open[section.title];

                if (collapsed) {
                  return (
                    <SidebarMenuItem key={section.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={section.title}>
                        <Link to={section.items[0].url}>
                          <section.icon className="h-4 w-4" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={section.title}
                    open={isOpen}
                    onOpenChange={(v) => setSectionOpen(section.title, v)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isActive} className="group/menu w-full justify-between font-medium">
                          <span className="flex items-center gap-2">
                            <section.icon className="h-4 w-4 text-primary" />
                            <span>{section.title}</span>
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            const active = isNavItemActive(pathname, item.url);
                            return (
                              <SidebarMenuSubItem key={item.url}>
                                <SidebarMenuSubButton asChild isActive={active}>
                                  <Link to={item.url} className="flex items-center gap-2">
                                    <item.icon className="h-3.5 w-3.5" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/60 p-3 text-xs">
            <div className="font-semibold text-sidebar-accent-foreground">Upgrade to Enterprise</div>
            <div className="mt-1 text-sidebar-foreground/70">Unlock SSO, audit logs and dedicated support.</div>
            <Link to="/pricing" className="mt-2 inline-flex text-primary font-medium hover:underline">
              View plans →
            </Link>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
