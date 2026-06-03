import { useEffect, useState } from "react";
import { Copy, Globe, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-errors";
import { tenantApi, type TenantDomainDto } from "@/modules/platform/tenant-api";
import { tenantContextKeys } from "@/hooks/use-tenant-context";
import { useTenantContext } from "@/hooks/use-tenant-context";

export function WorkspaceBrandingTab() {
  const queryClient = useQueryClient();
  const { data: ctx, isLoading } = useTenantContext();
  const [appName, setAppName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);
  const [newHost, setNewHost] = useState("");
  const [domains, setDomains] = useState<TenantDomainDto[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);

  useEffect(() => {
    const b = ctx?.branding;
    if (!b) return;
    setAppName(b.app_name ?? "");
    setLogoUrl(b.logo_url ?? "");
    setFaviconUrl(b.favicon_url ?? "");
    setPrimaryColor(b.primary_color ?? "#6366f1");
    setDomains(ctx?.domains ?? []);
  }, [ctx]);

  useEffect(() => {
    let active = true;
    tenantApi
      .listDomains()
      .then((res) => {
        if (active) setDomains(res.data ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setDomainsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveBranding = async () => {
    setSaving(true);
    try {
      await tenantApi.updateBranding({
        app_name: appName,
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        primary_color: primaryColor || null,
      });
      await queryClient.invalidateQueries({ queryKey: tenantContextKeys.context() });
      toast.success("Workspace branding saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save branding"));
    } finally {
      setSaving(false);
    }
  };

  const addDomain = async () => {
    if (!newHost.trim()) return;
    try {
      const res = await tenantApi.addDomain({ host: newHost.trim() });
      setDomains((d) => [...d, res.data!]);
      setNewHost("");
      toast.success("Domain added — add the DNS TXT record to verify");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add domain"));
    }
  };

  const verifyDomain = async (id: number) => {
    try {
      const res = await tenantApi.verifyDomain(id);
      setDomains((list) => list.map((d) => (d.id === id ? res.data! : d)));
      toast.success("Domain verified");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "DNS verification failed"));
    }
  };

  const removeDomain = async (id: number) => {
    try {
      await tenantApi.deleteDomain(id);
      setDomains((list) => list.filter((d) => d.id !== id));
      toast.success("Domain removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove domain"));
    }
  };

  const copyTxt = (value: string | null | undefined) => {
    if (!value) return;
    void navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading workspace settings…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>White-label branding</CardTitle>
          <CardDescription>App name, logo and accent color shown in the shell and login experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <div className="space-y-1.5 md:col-span-2">
            <Label>App name</Label>
            <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Acme ERP" />
          </div>
          <div className="space-y-1.5">
            <Label>Logo URL</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.svg" />
          </div>
          <div className="space-y-1.5">
            <Label>Favicon URL</Label>
            <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://…/favicon.ico" />
          </div>
          <div className="space-y-1.5">
            <Label>Primary color</Label>
            <div className="flex gap-2">
              <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 p-1" />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Button className="gradient-primary text-primary-foreground border-0" disabled={saving} onClick={saveBranding}>
              {saving ? "Saving…" : "Save branding"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Domains
          </CardTitle>
          <CardDescription>
            Default workspace URL:{" "}
            <span className="font-mono text-foreground">{ctx?.primary_host ?? "—"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-sm"
              placeholder="app.yourcompany.com"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
            />
            <Button variant="outline" onClick={addDomain}>
              <Plus className="mr-2 h-4 w-4" /> Add custom domain
            </Button>
          </div>

          {domainsLoading ? (
            <p className="text-sm text-muted-foreground">Loading domains…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.host}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.type}</Badge>
                      {d.is_primary && <Badge className="ml-1">Primary</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.status === "verified" ? "default" : "secondary"}>{d.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {d.status === "pending" && d.verification && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => copyTxt(d.verification?.txt_host)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => verifyDomain(d.id)}>
                            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Verify
                          </Button>
                        </>
                      )}
                      {!d.is_primary && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeDomain(d.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {domains.some((d) => d.verification) && (
            <p className="text-xs text-muted-foreground">
              Add the TXT record shown after adding a domain, then click Verify. Propagation can take several minutes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
