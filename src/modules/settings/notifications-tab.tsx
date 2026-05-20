import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-errors";
import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import {
  companyNotificationsApi,
  type NotificationCatalogItem,
  type NotificationChannelStatus,
  type NotificationPreference,
} from "@/modules/settings/company-notifications-api";

type RoleOption = { id: number; slug: string; name: string };

export function NotificationsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<NotificationCatalogItem[]>([]);
  const [prefs, setPrefs] = useState<Record<string, NotificationPreference>>({});
  const [channels, setChannels] = useState<NotificationChannelStatus | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cat, pr, ch, rolesRes] = await Promise.all([
          companyNotificationsApi.catalog(),
          companyNotificationsApi.preferences(),
          companyNotificationsApi.channelStatus(),
          api.get<ApiEnvelope<RoleOption[]>>("/v1/rbac/roles").catch(() => ({ data: [] as RoleOption[] })),
        ]);
        if (!active) return;
        setCatalog(cat);
        setPrefs(pr);
        setChannels(ch ?? null);
        const roleRows = rolesRes.data;
        setRoles(Array.isArray(roleRows) ? roleRows : []);
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Failed to load notification settings"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationCatalogItem[]>();
    for (const item of catalog) {
      const mod = item.module ?? "other";
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  const updatePref = (key: string, patch: Partial<NotificationPreference>) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], key, ...patch },
    }));
  };

  const toggleRole = (key: string, slug: string) => {
    const current = prefs[key]?.role_slugs ?? [];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    updatePref(key, { role_slugs: next });
  };

  const channelDisabled = (ch: "email" | "push" | "sms") => !channels?.[ch]?.configured;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading notification settings…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification channels
          </CardTitle>
          <CardDescription>Alerts only send when the channel is configured in Email, Realtime, or SMS tabs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(["email", "push", "sms"] as const).map((ch) => (
            <Badge key={ch} variant={channels?.[ch]?.configured ? "default" : "secondary"} className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {channels?.[ch]?.label ?? ch}
              {channels?.[ch]?.configured ? " ready" : " not configured"}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {grouped.map(([module, items]) => (
        <Card key={module}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{module}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>On</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Push</TableHead>
                  <TableHead>SMS</TableHead>
                  <TableHead className="min-w-[200px]">Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const p = prefs[item.key];
                  if (!p) return null;
                  return (
                    <TableRow key={item.key}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.enabled}
                          onCheckedChange={(v) => updatePref(item.key, { enabled: v })}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.channels.email}
                          disabled={channelDisabled("email") || !p.enabled}
                          onCheckedChange={(v) =>
                            updatePref(item.key, { channels: { ...p.channels, email: v } })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.channels.push}
                          disabled={channelDisabled("push") || !p.enabled}
                          onCheckedChange={(v) =>
                            updatePref(item.key, { channels: { ...p.channels, push: v } })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.channels.sms}
                          disabled={channelDisabled("sms") || !p.enabled}
                          onCheckedChange={(v) =>
                            updatePref(item.key, { channels: { ...p.channels, sms: v } })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roles.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No roles</span>
                          ) : (
                            roles.map((r) => (
                              <Button
                                key={r.id}
                                type="button"
                                size="sm"
                                variant={p.role_slugs.includes(r.slug) ? "default" : "outline"}
                                className="h-7 text-xs"
                                disabled={!p.enabled}
                                onClick={() => toggleRole(item.key, r.slug)}
                              >
                                {r.name}
                              </Button>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Button
        className="gradient-primary border-0 text-primary-foreground"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            const saved = await companyNotificationsApi.savePreferences(prefs);
            setPrefs(saved);
            toast.success("Notification preferences saved");
          } catch (e) {
            toast.error(getApiErrorMessage(e, "Failed to save"));
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Save notification preferences"}
      </Button>
    </div>
  );
}
