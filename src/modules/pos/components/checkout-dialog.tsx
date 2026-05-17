import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Plus, Trash2, Wallet } from "lucide-react";
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
import { formatMoney, PAYMENT_METHODS } from "@/modules/pos/utils";
import type { PaymentInput } from "@/modules/pos/types";

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  bank: Wallet,
  mobile: Wallet,
  account: Wallet,
};

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (payments: PaymentInput[]) => void | Promise<void>;
  loading?: boolean;
};

export function CheckoutDialog({ open, onOpenChange, total, onConfirm, loading }: CheckoutDialogProps) {
  const [rows, setRows] = useState<PaymentInput[]>([{ method: "cash", amount: total }]);
  const [cashTendered, setCashTendered] = useState("");

  useEffect(() => {
    if (open) {
      setRows([{ method: "cash", amount: total }]);
      setCashTendered("");
    }
  }, [open, total]);

  const paid = useMemo(() => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);
  const change = Math.max(0, paid - total);
  const due = Math.max(0, total - paid);

  const addRow = () => setRows((prev) => [...prev, { method: "card", amount: due }]);

  const updateRow = (index: number, patch: Partial<PaymentInput>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const fillRemaining = (index: number) => {
    const others = rows.reduce((s, r, i) => (i === index ? s : s + Number(r.amount || 0)), 0);
    updateRow(index, { amount: Math.max(0, round2(total - others)) });
  };

  const confirm = () => {
    void onConfirm(rows.filter((r) => r.amount > 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Checkout — {formatMoney(total)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const Icon = METHOD_ICONS[row.method] ?? CreditCard;
            return (
              <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                <div className="min-w-[120px] flex-1">
                  <Label className="text-xs">Method</Label>
                  <Select
                    value={row.method}
                    onValueChange={(v) => updateRow(index, { method: v as PaymentInput["method"] })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-11 text-lg tabular-nums"
                    value={row.amount || ""}
                    onChange={(e) => updateRow(index, { amount: Number(e.target.value) })}
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fillRemaining(index)}>
                  Fill
                </Button>
                {rows.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Icon className="mb-2 hidden h-5 w-5 text-muted-foreground sm:block" />
              </div>
            );
          })}

          <Button type="button" variant="outline" className="w-full" onClick={addRow} disabled={due <= 0}>
            <Plus className="mr-2 h-4 w-4" />
            Split payment
          </Button>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span>Tendered</span>
              <span className="font-medium tabular-nums">{formatMoney(paid)}</span>
            </div>
            <div className="flex justify-between">
              <span>Due</span>
              <span className={due > 0 ? "text-amber-600" : "text-emerald-600"}>
                {due > 0 ? formatMoney(due) : "Paid"}
              </span>
            </div>
            {change > 0 && (
              <div className="flex justify-between font-semibold">
                <span>Change</span>
                <span className="tabular-nums">{formatMoney(change)}</span>
              </div>
            )}
          </div>

          {rows.some((r) => r.method === "cash") && (
            <div>
              <Label className="text-xs">Cash tendered (optional)</Label>
              <Input
                type="number"
                className="h-11"
                placeholder={String(total)}
                value={cashTendered}
                onChange={(e) => {
                  setCashTendered(e.target.value);
                  const v = Number(e.target.value);
                  if (v > 0) {
                    const cashIndex = rows.findIndex((r) => r.method === "cash");
                    if (cashIndex >= 0) updateRow(cashIndex, { amount: v });
                  }
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            disabled={loading || paid < total}
            onClick={confirm}
          >
            Complete sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
