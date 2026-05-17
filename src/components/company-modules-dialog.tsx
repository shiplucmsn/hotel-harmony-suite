import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { platformApi, type CompanyModuleRow } from "@/modules/platform/platform-api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";

type CompanyModulesDialogProps = {
  companyId: number;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CompanyModulesDialog({
  companyId,
  companyName,
  open,
  onOpenChange,
}: CompanyModulesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<CompanyModuleRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !companyId) return;
    setLoading(true);
    platformApi
      .companyModules(companyId)
      .then((data) => {
        setModules(data.modules);
        setSelected(new Set(data.enabled_keys));
      })
      .catch((e) => toast.error(getApiErrorMessage(e, "Failed to load modules")))
      .finally(() => setLoading(false));
  }, [open, companyId]);

  const toggle = (key: string, alwaysEnabled?: boolean) => {
    if (alwaysEnabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const data = await platformApi.syncCompanyModules(companyId, [...selected], "manual");
      setModules(data.modules);
      setSelected(new Set(data.enabled_keys));
      toast.success("Company modules updated");
      onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to save modules"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modules — {companyName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {modules.map((m) => (
              <div key={m.key} className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  id={`mod-${m.key}`}
                  checked={selected.has(m.key)}
                  disabled={m.always_enabled}
                  onCheckedChange={() => toggle(m.key, m.always_enabled)}
                />
                <Label htmlFor={`mod-${m.key}`} className="flex-1 cursor-pointer font-normal">
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{m.key}</span>
                  {m.always_enabled ? (
                    <span className="ml-2 text-xs text-muted-foreground">(required)</span>
                  ) : null}
                </Label>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save modules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
