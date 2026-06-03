import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  formatBranchLocation,
  tenantBranchesApi,
  type BranchDto,
  type BranchInput,
} from "@/modules/settings/tenant-branches-api";

export function BranchesTab() {
  const { user } = useAuth();
  const canManage = userHasPermission(user, "core.branches.manage");
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BranchDto | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenantBranchesApi.list();
      setBranches(res.data ?? []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load branches"));
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (branch: BranchDto) => {
    setEditing(branch);
    setSheetOpen(true);
  };

  const handleDelete = async (branch: BranchDto) => {
    if (!canManage) return;
    if (!window.confirm(`Delete branch "${branch.name}"?`)) return;
    try {
      await tenantBranchesApi.remove(branch.id);
      toast.success("Branch deleted");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete branch"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Branches</CardTitle>
          <CardDescription>
            Offices and locations under this company (one workspace, shared data).
          </CardDescription>
        </div>
        {canManage ? (
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={openCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add branch
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading branches…
          </div>
        ) : branches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No branches yet. Add your first office or warehouse location.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? <TableHead className="w-24" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    {b.name}
                    {b.is_head_office ? (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        HQ
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.code}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBranchLocation(b.address)}
                  </TableCell>
                  <TableCell className="text-right">{b.users_count ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "active" ? "default" : "secondary"}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => void handleDelete(b)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <BranchFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        branch={editing}
        saving={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            if (editing) {
              await tenantBranchesApi.update(editing.id, payload);
              toast.success("Branch updated");
            } else {
              await tenantBranchesApi.create(payload);
              toast.success("Branch created");
            }
            setSheetOpen(false);
            await load();
          } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to save branch"));
          } finally {
            setSaving(false);
          }
        }}
      />
    </Card>
  );
}

type BranchFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchDto | null;
  saving: boolean;
  onSubmit: (payload: BranchInput) => Promise<void>;
};

function BranchFormSheet({ open, onOpenChange, branch, saving, onSubmit }: BranchFormSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [line1, setLine1] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!open) return;
    setName(branch?.name ?? "");
    setCode(branch?.code ?? "");
    setCity(branch?.address?.city ?? "");
    setCountry(branch?.address?.country ?? "");
    setLine1(branch?.address?.line1 ?? "");
    setEmail(branch?.email ?? "");
    setPhone(branch?.phone ?? "");
    setIsHeadOffice(branch?.is_head_office ?? false);
    setStatus(branch?.status ?? "active");
  }, [open, branch]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Branch name is required");
      return;
    }
    void onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      is_head_office: isHeadOffice,
      email: email.trim() || null,
      phone: phone.trim() || null,
      status,
      address: {
        line1: line1.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[420px] max-w-[100vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px] sm:w-[480px]">
        <SheetHeader className="shrink-0 space-y-2 px-6 pb-2 pt-6 pr-12 text-left">
          <SheetTitle>{branch ? "Edit branch" : "New branch"}</SheetTitle>
          <SheetDescription>
            Add a location under your company. This is not a separate workspace or subdomain.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Branch name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dhaka Office" />
            </div>
            <div className="space-y-1.5">
              <Label>Code (optional)</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Auto-generated from name if empty"
                disabled={!!branch}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="BD" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea
                rows={2}
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="setup">Setup</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Head office</p>
                <p className="text-xs text-muted-foreground">Mark as primary company location</p>
              </div>
              <Switch checked={isHeadOffice} onCheckedChange={setIsHeadOffice} />
            </div>
          </div>
        </div>
        <SheetFooter className="shrink-0 gap-2 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {branch ? "Save changes" : "Create branch"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
