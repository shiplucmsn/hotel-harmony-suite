import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSupplierInvoice,
  usePurchaseGrns,
  useSuppliers,
} from "@/hooks/purchase/use-purchase";
import { formatMoney } from "@/modules/purchase/utils";

type CreateSupplierInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (invoiceId: number) => void;
};

export function CreateSupplierInvoiceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSupplierInvoiceDialogProps) {
  const [supplierId, setSupplierId] = useState<string>("");
  const [grnId, setGrnId] = useState<string>("");
  const [vendorRef, setVendorRef] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");

  const { data: suppliersData } = useSuppliers({ per_page: 100, status: "active" });
  const suppliers = suppliersData?.data ?? [];

  const { data: grnsData, isLoading: grnsLoading } = usePurchaseGrns(
    {
      invoiceable: true,
      per_page: 100,
      supplier_id: supplierId ? Number(supplierId) : undefined,
    },
    { enabled: open },
  );
  const grns = grnsData?.data ?? [];
  const eligibility = grnsData?.invoiceEligibility;

  const create = useCreateSupplierInvoice();

  useEffect(() => {
    if (!open) {
      setSupplierId("");
      setGrnId("");
      setVendorRef("");
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setDueDate("");
    }
  }, [open]);

  useEffect(() => {
    setGrnId("");
  }, [supplierId]);

  const submit = async () => {
    if (!grnId) return;
    const res = await create.mutateAsync({
      purchase_grn_id: Number(grnId),
      supplier_id: supplierId ? Number(supplierId) : undefined,
      vendor_invoice_number: vendorRef.trim() || undefined,
      invoice_date: invoiceDate || undefined,
      due_date: dueDate || undefined,
    });
    const id = res.data?.id;
    onOpenChange(false);
    if (id) onCreated?.(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create supplier invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier (optional filter)</Label>
            <Select value={supplierId || "all"} onValueChange={(v) => setSupplierId(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Posted GRN (not yet invoiced)</Label>
            <Select value={grnId} onValueChange={setGrnId} disabled={grnsLoading || grns.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={grnsLoading ? "Loading…" : "Select GRN"} />
              </SelectTrigger>
              <SelectContent>
                {grns.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.number} · {g.supplier?.name ?? g.supplier_id} · {formatMoney(g.total_amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!grnsLoading && grns.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {eligibility && eligibility.posted > 0
                  ? [
                      eligibility.pending_qc > 0
                        ? `${eligibility.pending_qc} posted GRN(s) await QC accept (Inventory → GRN QC).`
                        : null,
                      eligibility.already_invoiced > 0
                        ? `${eligibility.already_invoiced} already linked to a supplier invoice.`
                        : null,
                      eligibility.rejected_qc > 0
                        ? `${eligibility.rejected_qc} rejected at QC and cannot be invoiced.`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" ") || "No invoiceable GRNs for this filter. Try All suppliers."
                  : "No posted GRNs yet. Receive goods (GRN) first; accept QC when required."}
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vendor invoice #</Label>
              <Input value={vendorRef} onChange={(e) => setVendorRef(e.target.value)} placeholder="Supplier bill ref" />
            </div>
            <div className="space-y-2">
              <Label>Invoice date</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!grnId || create.isPending} onClick={() => void submit()}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
