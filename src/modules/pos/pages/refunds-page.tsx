import { useMemo, useState } from "react";
import { Plus, Search, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePosReturn, usePosSale, usePosSales } from "@/hooks/pos/use-pos";
import { ReceiptPreviewDialog } from "@/modules/pos/components/receipt-preview-dialog";
import { posApi } from "@/modules/pos/pos-api";
import type { PosReceiptDto } from "@/modules/pos/types";
import { formatMoney, PAYMENT_METHODS } from "@/modules/pos/utils";

type ReturnLineState = Record<number, number>;

export function RefundsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saleLookup, setSaleLookup] = useState("");
  const [saleId, setSaleId] = useState<number | null>(null);
  const [returnQty, setReturnQty] = useState<ReturnLineState>({});
  const [refundMethod, setRefundMethod] = useState("cash");
  const [reason, setReason] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<PosReceiptDto | null>(null);

  const { data: salesResult, isLoading } = usePosSales({ per_page: 50 });
  const { data: sale, isLoading: saleLoading } = usePosSale(saleId ?? undefined);
  const postReturn = usePosReturn();

  const sales = salesResult?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sales.filter(
      (s) => !q || s.number.toLowerCase().includes(q) || String(s.id).includes(q),
    );
  }, [sales, search]);

  const loadSale = () => {
    const id = Number(saleLookup.replace(/\D/g, "") || saleLookup);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }
    setSaleId(id);
    setReturnQty({});
  };

  const submitReturn = async () => {
    if (!sale?.lines?.length || !saleId) return;
    const lines = sale.lines
      .map((line) => ({
        sale_line_id: line.id,
        quantity: returnQty[line.id] ?? 0,
      }))
      .filter((l) => l.quantity > 0);

    if (lines.length === 0) return;

    try {
      const ret = await postReturn.mutateAsync({
        sale_id: saleId,
        lines,
        refund_method: refundMethod,
        reason: reason || undefined,
      });
      const rcpt = await posApi.returnReceipt(ret.id);
      setReceipt(rcpt);
      setReceiptOpen(true);
      setOpen(false);
      setSaleId(null);
      setSaleLookup("");
      setReturnQty({});
      setReason("");
    } catch {
      /* toast from hook */
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds & Returns"
        description="Process customer refunds and product returns against completed POS sales."
        breadcrumbs={[{ label: "POS" }, { label: "Refunds" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                New return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Process return</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Sale ID or receipt #</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 12 or POS-2026-00012"
                      value={saleLookup}
                      onChange={(e) => setSaleLookup(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadSale()}
                    />
                    <Button type="button" variant="outline" onClick={loadSale} disabled={saleLoading}>
                      Load
                    </Button>
                  </div>
                </div>
                {sale && (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-2">
                    {sale.lines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {line.description} ({line.sku})
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={line.quantity}
                          className="h-9 w-20"
                          value={returnQty[line.id] ?? 0}
                          onChange={(e) =>
                            setReturnQty((prev) => ({
                              ...prev,
                              [line.id]: Math.min(line.quantity, Number(e.target.value) || 0),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <Label>Refund method</Label>
                  <Select value={refundMethod} onValueChange={setRefundMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.filter((m) => m.id !== "account").map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this being returned?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void submitReturn()}
                  disabled={!sale || postReturn.isPending}
                >
                  Submit return
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recent sales…"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading sales…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No sales found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.number}</TableCell>
                  <TableCell className="text-sm">{s.sale_date ?? "—"}</TableCell>
                  <TableCell className="font-medium">{formatMoney(s.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSaleLookup(String(s.id));
                        setSaleId(s.id);
                        setReturnQty({});
                        setOpen(true);
                      }}
                    >
                      <Undo2 className="mr-1 h-3 w-3" />
                      Return
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReceiptPreviewDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
      />
    </div>
  );
}
