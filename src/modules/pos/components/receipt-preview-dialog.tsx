import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/modules/pos/utils";
import type { PosReceiptDto } from "@/modules/pos/types";

type ReceiptPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: PosReceiptDto | null;
  onNewSale?: () => void;
};

export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  receipt,
  onNewSale,
}: ReceiptPreviewDialogProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Receipt — {receipt.receipt_number}</DialogTitle>
        </DialogHeader>

        <div className="receipt-print rounded-lg border bg-card p-4 font-mono text-xs">
          <div className="text-center">
            <div className="text-base font-bold">ERP POS</div>
            <div className="text-muted-foreground">{receipt.customer ?? "Walk-in"}</div>
            <Separator className="my-2" />
            <div>{receipt.receipt_number}</div>
            <div className="text-muted-foreground">
              {receipt.sale_date ?? receipt.return_date ?? receipt.printed_at}
            </div>
          </div>
          <Separator className="my-2" />
          {receipt.lines.map((line, i) => (
            <div key={i} className="mb-1 flex justify-between gap-2">
              <span className="truncate">
                {line.quantity}× {line.description ?? line.sku}
              </span>
              <span className="shrink-0 tabular-nums">{formatMoney(line.line_total)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(receipt.subtotal)}</span>
          </div>
          {(receipt.discount_amount ?? 0) > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatMoney(receipt.discount_amount!)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatMoney(receipt.tax_amount)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatMoney(receipt.total_amount)}</span>
          </div>
          {receipt.payments && receipt.payments.length > 0 && (
            <>
              <Separator className="my-2" />
              {receipt.payments.map((p, i) => (
                <div key={i} className="flex justify-between capitalize">
                  <span>{p.method}</span>
                  <span>{formatMoney(p.amount)}</span>
                </div>
              ))}
            </>
          )}
          {(receipt.change_given ?? 0) > 0 && (
            <div className="mt-1 flex justify-between">
              <span>Change</span>
              <span>{formatMoney(receipt.change_given!)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="text-center text-muted-foreground">Thank you!</div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {onNewSale && (
            <Button variant="outline" className="w-full sm:w-auto" onClick={onNewSale}>
              New sale
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
