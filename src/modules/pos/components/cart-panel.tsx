import { Minus, Plus, Receipt, Trash2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/modules/pos/utils";
import type { PosCartDto } from "@/modules/pos/types";

type CartPanelProps = {
  cart: PosCartDto | null;
  cartLabel?: string;
  discountInput: string;
  onDiscountInputChange: (v: string) => void;
  onApplyDiscount: () => void;
  onIncrement: (lineId: number) => void;
  onDecrement: (lineId: number) => void;
  onRemove: (lineId: number) => void;
  onClear: () => void;
  onCheckout: () => void;
  onShowReceipts?: () => void;
  busy?: boolean;
};

export function CartPanel({
  cart,
  cartLabel,
  discountInput,
  onDiscountInputChange,
  onApplyDiscount,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
  onShowReceipts,
  busy,
}: CartPanelProps) {
  const lines = cart?.lines ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax_amount ?? 0;
  const total = cart?.total_amount ?? 0;
  const discount = cart?.discount_amount ?? 0;

  return (
    <div className="flex h-full w-full flex-col border-l bg-card lg:w-[420px]">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <div className="font-semibold">{cartLabel ?? (cart ? `Cart #${cart.id}` : "Cart")}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {cart?.customer_id ? `Customer #${cart.customer_id}` : "Walk-in customer"}
          </div>
        </div>
        {onShowReceipts && (
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={onShowReceipts}>
            <Receipt className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-4">
          {lines.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Receipt className="mx-auto mb-2 h-10 w-10 opacity-30" />
              Cart is empty. Tap a product or scan a barcode.
            </div>
          ) : (
            lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-2 rounded-xl border p-3 touch-manipulation"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{line.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {line.sku} · {formatMoney(line.unit_price)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={busy}
                    onClick={() => onDecrement(line.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-base font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={busy}
                    onClick={() => onIncrement(line.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive"
                  disabled={busy}
                  onClick={() => onRemove(line.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t bg-muted/20 p-4">
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="Cart discount $"
            value={discountInput}
            onChange={(e) => onDiscountInputChange(e.target.value)}
            className="h-10"
          />
          <Button variant="outline" className="h-10 shrink-0" disabled={busy} onClick={onApplyDiscount}>
            Apply
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatMoney(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="tabular-nums">{formatMoney(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="tabular-nums text-primary">{formatMoney(total)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 touch-manipulation"
            disabled={lines.length === 0 || busy}
            onClick={onClear}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
          <Button
            className="h-12 touch-manipulation gradient-primary border-0 text-primary-foreground"
            disabled={lines.length === 0 || busy}
            onClick={onCheckout}
          >
            Pay {formatMoney(total)}
          </Button>
        </div>
      </div>
    </div>
  );
}
