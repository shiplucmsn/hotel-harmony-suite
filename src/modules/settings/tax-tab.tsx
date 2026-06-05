import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { userHasPermission } from "@/modules/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api-errors";
import { Switch } from "@/components/ui/switch";
import {
  companyTaxApi,
  formatTaxRate,
  type TaxRuleDto,
} from "@/modules/settings/company-tax-api";
import {
  companyScopedSettingsApi,
  readBooleanSetting,
  type ScopedSettingDto,
} from "@/modules/settings/company-scoped-settings-api";

export function TaxTab() {
  const { user } = useAuth();
  const canManage = userHasPermission(user, "core.settings.manage");
  const [rules, setRules] = useState<TaxRuleDto[]>([]);
  const [prefs, setPrefs] = useState<ScopedSettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [savingPref, setSavingPref] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companyTaxApi.list();
      setRules(res.data ?? []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load tax rules"));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPrefs = useCallback(async () => {
    setPrefsLoading(true);
    try {
      const res = await companyScopedSettingsApi.list("tax");
      setPrefs(res.data ?? []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load tax preferences"));
      setPrefs([]);
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  const updatePref = async (key: string, value: boolean) => {
    if (!canManage) return;
    setSavingPref(key);
    try {
      await companyScopedSettingsApi.upsert("tax", key, {
        value,
        value_type: "boolean",
      });
      await loadPrefs();
      toast.success("Preference saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save preference"));
    } finally {
      setSavingPref(null);
    }
  };

  useEffect(() => {
    void load();
    void loadPrefs();
  }, [load, loadPrefs]);

  const handleDelete = async (rule: TaxRuleDto) => {
    if (!canManage) return;
    if (!window.confirm(`Delete tax rule "${rule.name}"?`)) return;
    try {
      await companyTaxApi.remove(rule.id);
      toast.success("Tax rule deleted");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete tax rule"));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Tax rates</CardTitle>
            <CardDescription>
              Branch-scoped rates from the active branch. Company-wide rules (no branch) appear on every branch.
            </CardDescription>
          </div>
          {canManage && <TaxDialog onCreated={load} />}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading tax rules…
            </div>
          ) : rules.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No tax rules yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs">{rule.code}</TableCell>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="font-mono">{formatTaxRate(rule)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.type || "percentage"}</Badge>
                    </TableCell>
                    <TableCell>
                      {rule.branch_id ? (
                        <Badge variant="secondary">Branch</Badge>
                      ) : (
                        <Badge variant="outline">Company-wide</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => void handleDelete(rule)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax preferences</CardTitle>
          <CardDescription>Branch-scoped toggles for the active branch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prefsLoading ? (
            <div className="flex items-center py-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading preferences…
            </div>
          ) : (
            [
              {
                key: "prices_include_tax",
                title: "Prices include tax",
                description: "Display product prices with tax included by default.",
              },
              {
                key: "charge_tax_on_shipping",
                title: "Charge tax on shipping",
                description: "Apply tax to shipping fees on orders.",
              },
              {
                key: "round_at_line_item",
                title: "Round at line item",
                description: "Round taxes per line instead of order total.",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={readBooleanSetting(prefs, item.key)}
                  disabled={!canManage || savingPref === item.key}
                  onCheckedChange={(checked) => void updatePref(item.key, checked)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TaxDialog({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [type, setType] = useState("percentage");

  const reset = () => {
    setCode("");
    setName("");
    setRate("");
    setType("percentage");
  };

  const handleCreate = async () => {
    if (!name.trim() || !rate) {
      toast.error("Name and rate are required");
      return;
    }
    setSaving(true);
    try {
      await companyTaxApi.create({
        code: code.trim() || name.trim().replace(/\s+/g, "_").toUpperCase().slice(0, 40),
        name: name.trim(),
        rate: Number(rate),
        type,
        is_active: true,
      });
      toast.success("Tax rule created");
      setOpen(false);
      reset();
      await onCreated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create tax rule"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add tax
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New tax rate</DialogTitle>
          <DialogDescription>
            Creates a tax rule for the active branch (from the branch switcher).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="e.g. VAT 21%" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Code (optional)</Label>
            <Input placeholder="e.g. VAT21" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rate (%)</Label>
              <Input type="number" placeholder="21" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            onClick={() => void handleCreate()}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
