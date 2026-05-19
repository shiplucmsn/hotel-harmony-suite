import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";

export function NotificationBell() {
  const navigate = useNavigate();
  const { data: count = 0 } = useUnreadNotificationCount();
  const { data: listRes, isLoading } = useNotifications({ per_page: 15 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = listRes?.data ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            {count > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {count} unread
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Mark all as read"
              disabled={count === 0 || markAllRead.isPending}
              onClick={(e) => {
                e.preventDefault();
                void markAllRead.mutateAsync();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {isLoading && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">Loading…</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications yet</p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cn(
                "flex w-full gap-3 rounded-md px-2 py-2 text-left hover:bg-muted",
                n.unread && "bg-primary/5",
              )}
              onClick={() => {
                if (n.unread) void markRead.mutate(n.id);
                const url = typeof n.data?.action_url === "string" ? n.data.action_url : "/app/notifications";
                navigate({ to: url });
              }}
            >
              <div
                className={cn(
                  "mt-2 h-2 w-2 shrink-0 rounded-full",
                  n.unread ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                {n.body && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                )}
                <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time ?? "—"}</p>
              </div>
            </button>
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ to: "/app/notifications" })}
          className="justify-center text-primary"
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
