import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScanBarcode, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useInventoryProducts } from "@/hooks/inventory/use-inventory-products";
import {
  useAddCartLine,
  useApplyCartDiscount,
  useCreatePosCart,
  usePosCart,
  usePosCheckout,
  useRemoveCartLine,
  useUpdateCartLine,
} from "@/hooks/pos/use-pos";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import type { ProductDto } from "@/modules/inventory/types";
import {
  BarcodeScannerInput,
  type BarcodeScannerInputRef,
} from "@/modules/pos/components/barcode-scanner-input";
import { CartPanel } from "@/modules/pos/components/cart-panel";
import { CheckoutDialog } from "@/modules/pos/components/checkout-dialog";
import { PosOfflineBanner } from "@/modules/pos/components/pos-offline-banner";
import { PosShortcutsDialog } from "@/modules/pos/components/pos-shortcuts-dialog";
import { ProductGrid } from "@/modules/pos/components/product-grid";
import { ReceiptPreviewDialog } from "@/modules/pos/components/receipt-preview-dialog";
import { usePosOfflineSync } from "@/modules/pos/hooks/use-pos-offline-sync";
import { useOnlineStatus } from "@/modules/pos/offline/use-online-status";
import {
  clearActiveCartId,
  enqueueOfflineCheckout,
  persistActiveCartId,
  readActiveCartId,
} from "@/modules/pos/offline/pos-offline-store";
import { posApi } from "@/modules/pos/pos-api";
import type { PaymentInput, PosReceiptDto } from "@/modules/pos/types";
import { POS_SHORTCUTS } from "@/modules/pos/utils";

const TAX_RATE = 0.08;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function BillingPage() {
  const online = useOnlineStatus();
  const { syncing, syncQueue } = usePosOfflineSync();
  const barcodeRef = useRef<BarcodeScannerInputRef>(null);
  const ensureCartPromiseRef = useRef<Promise<number> | null>(null);
  const lastAutoTaxAttemptRef = useRef<string>("");

  const [cartId, setCartId] = useState<number | null>(() => readActiveCartId());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [scanOpen, setScanOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<PosReceiptDto | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [initDone] = useState(true);

  const createCart = useCreatePosCart();
  const createCartAsync = createCart.mutateAsync;
  const { data: cart, isLoading: cartLoading } = usePosCart(cartId ?? undefined);
  const addLine = useAddCartLine();
  const updateLine = useUpdateCartLine();
  const removeLine = useRemoveCartLine();
  const applyDiscount = useApplyCartDiscount();
  const checkout = usePosCheckout();

  const { data: productsResult, isLoading: productsLoading } = useInventoryProducts({
    per_page: 200,
    status: "active",
  });

  const products = productsResult?.data ?? [];
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    for (const p of products) {
      if (p.category) set.add(p.category);
      else if (p.category_ref?.name) set.add(p.category_ref.name);
    }
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const catName = p.category ?? p.category_ref?.name ?? "Uncategorized";
      const catOk = category === "All" || catName === category;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode ?? "").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, search, category]);

  const busy =
    cartLoading ||
    createCart.isPending ||
    addLine.isPending ||
    updateLine.isPending ||
    removeLine.isPending ||
    applyDiscount.isPending ||
    checkout.isPending;

  const ensureCart = useCallback(async (): Promise<number> => {
    if (cartId) return cartId;

    if (ensureCartPromiseRef.current) return ensureCartPromiseRef.current;

    ensureCartPromiseRef.current = createCartAsync({})
      .then((c) => {
        setCartId(c.id);
        persistActiveCartId(c.id);
        return c.id;
      })
      .finally(() => {
        ensureCartPromiseRef.current = null;
      });

    return ensureCartPromiseRef.current;
  }, [cartId, createCartAsync]);

  useEffect(() => {
    if (!online) return;
    void syncQueue();
  }, [online, syncQueue]);

  useEffect(() => {
    if (!cartId || !cart?.lines?.length) return;
    if (applyDiscount.isPending) return;

    const subtotal = Number(cart.subtotal ?? 0);
    const expectedTax = round2(subtotal * TAX_RATE);
    const currentTax = Number(cart.tax_amount ?? 0);
    if (Math.abs(expectedTax - currentTax) < 0.01) {
      lastAutoTaxAttemptRef.current = "";
      return;
    }

    const attemptKey = `${cartId}:${subtotal.toFixed(2)}:${expectedTax.toFixed(2)}`;
    if (lastAutoTaxAttemptRef.current === attemptKey) return;
    lastAutoTaxAttemptRef.current = attemptKey;

    applyDiscount.mutate({ cartId, body: { tax_amount: expectedTax } });
  }, [cart?.subtotal, cart?.tax_amount, cart?.lines?.length, cartId, applyDiscount.isPending]);

  const addProductToCart = useCallback(
    async (product: ProductDto, qty = 1) => {
      let effectiveCartId: number;
      try {
        effectiveCartId = await ensureCart();
      } catch {
        return;
      }
      const existing = cart?.lines?.find((l) => l.sku === product.sku);
      const tracksInventory = product.track_inventory !== false;
      const availableStock = Number(product.stock ?? 0);
      const nextQty = (existing?.quantity ?? 0) + qty;

      if (tracksInventory) {
        if (availableStock <= 0) {
          toast.error(`${product.name} is out of stock`);
          return;
        }
        if (nextQty > availableStock) {
          toast.error(`Only ${availableStock} in stock for ${product.name}`);
          return;
        }
      }

      if (existing) {
        updateLine.mutate({
          cartId: effectiveCartId,
          lineId: existing.id,
          body: {
            sku: product.sku,
            quantity: existing.quantity + qty,
            unit_price: product.price,
            description: product.name,
          },
        });
      } else {
        addLine.mutate({
          cartId: effectiveCartId,
          body: {
            sku: product.sku,
            quantity: qty,
            unit_price: product.price,
            unit_cost: product.cost_price,
            description: product.name,
          },
        });
      }
      toast.success(`Added ${product.name}`);
    },
    [ensureCart, cart?.lines, addLine, updateLine],
  );

  const handleBarcodeSubmit = useCallback(async () => {
    const code = scanCode.trim();
    if (!code) return;
    try {
      const product = await inventoryApi.lookupBarcode(code);
      await addProductToCart(product);
      setScanCode("");
      setScanOpen(false);
    } catch {
      const match = products.find(
        (p) => p.sku === code || (p.barcode ?? "").toLowerCase() === code.toLowerCase(),
      );
      if (match) {
        await addProductToCart(match);
        setScanCode("");
        setScanOpen(false);
      } else {
        toast.error("Product not found");
      }
    }
  }, [scanCode, products, addProductToCart]);

  const handleApplyDiscount = () => {
    if (!cartId) return;
    const amount = Number(discountInput);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid discount amount");
      return;
    }
    applyDiscount.mutate({ cartId, body: { discount_amount: amount } });
  };

  const handleIncrement = (lineId: number) => {
    if (!cartId) return;
    const line = cart?.lines?.find((l) => l.id === lineId);
    if (!line) return;
    const product = products.find((p) => p.sku === line.sku);
    const tracksInventory = (product?.track_inventory ?? true) !== false;
    const availableStock = Number(product?.stock ?? 0);
    if (tracksInventory && line.quantity + 1 > availableStock) {
      toast.error(`Only ${availableStock} in stock for ${line.description}`);
      return;
    }
    updateLine.mutate({
      cartId,
      lineId,
      body: { sku: line.sku, quantity: line.quantity + 1, unit_price: line.unit_price },
    });
  };

  const handleDecrement = (lineId: number) => {
    if (!cartId) return;
    const line = cart?.lines?.find((l) => l.id === lineId);
    if (!line) return;
    if (line.quantity <= 1) {
      removeLine.mutate({ cartId, lineId });
      return;
    }
    updateLine.mutate({
      cartId,
      lineId,
      body: { sku: line.sku, quantity: line.quantity - 1, unit_price: line.unit_price },
    });
  };

  const startNewCart = async () => {
    clearActiveCartId();
    try {
      const c = await createCartAsync({});
      setCartId(c.id);
      persistActiveCartId(c.id);
      setDiscountInput("");
      return true;
    } catch {
      return false;
    }
  };

  const handleClear = async () => {
    const ok = await startNewCart();
    if (ok) toast.message("Cart cleared");
  };

  const handleCheckout = async (payments: PaymentInput[]) => {
    if (!cartId) return;

    if (!online) {
      enqueueOfflineCheckout(cartId, { payments });
      setCheckoutOpen(false);
      toast.info("Offline — sale queued for sync when back online");
      await startNewCart();
      return;
    }

    try {
      const res = await checkout.mutateAsync({ cartId, body: { payments } });
      const saleId = res.data.id;
      const rcpt = await posApi.saleReceipt(saleId);
      setReceipt(rcpt);
      setReceiptOpen(true);
      setCheckoutOpen(false);
      await startNewCart();
    } catch {
      /* toast from hook */
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== "Escape" && e.key !== "F2" && e.key !== "F9") return;
      }
      switch (e.key) {
        case "F2":
          e.preventDefault();
          if (scanOpen) barcodeRef.current?.focus();
          else {
            setScanOpen(true);
            setTimeout(() => barcodeRef.current?.focus(), 50);
          }
          break;
        case "F4":
          e.preventDefault();
          if ((cart?.lines?.length ?? 0) > 0) setCheckoutOpen(true);
          break;
        case "F8":
          e.preventDefault();
          void handleClear();
          break;
        case "F9":
          e.preventDefault();
          setShortcutsOpen(true);
          break;
        case "Escape":
          setScanOpen(false);
          setCheckoutOpen(false);
          setReceiptOpen(false);
          setShortcutsOpen(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scanOpen, cart?.lines?.length, handleClear]);

  if (!initDone) {
    return (
      <div className="grid h-[calc(100vh-3rem)] place-items-center text-muted-foreground">
        Opening register…
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3rem)] flex-col bg-muted/20 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <PosOfflineBanner online={online} onSync={() => void syncQueue()} syncing={syncing} />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
            />
          </div>
          <BarcodeScannerInput
            ref={barcodeRef}
            className="hidden min-w-[220px] flex-1 lg:block"
            value={scanCode}
            onChange={setScanCode}
            onSubmit={() => void handleBarcodeSubmit()}
            disabled={busy}
          />
          <Button
            variant="outline"
            className="h-11 touch-manipulation"
            onClick={() => {
              setScanOpen(true);
              setTimeout(() => barcodeRef.current?.focus(), 50);
            }}
          >
            <ScanBarcode className="mr-2 h-4 w-4" />
            Scan (F2)
          </Button>
          <Button variant="ghost" size="sm" className="hidden text-xs text-muted-foreground md:inline-flex" onClick={() => setShortcutsOpen(true)}>
            Shortcuts (F9)
          </Button>
        </div>

        <ProductGrid
          products={filteredProducts}
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          onSelect={(p) => void addProductToCart(p)}
          loading={productsLoading}
        />
      </div>

      <CartPanel
        cart={cart ?? null}
        cartLabel={cart ? `Cart #${cart.id}` : undefined}
        discountInput={discountInput}
        onDiscountInputChange={setDiscountInput}
        onApplyDiscount={handleApplyDiscount}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={(lineId) => {
          if (!cartId) return;
          removeLine.mutate({ cartId, lineId });
        }}
        onClear={() => void handleClear()}
        onCheckout={() => setCheckoutOpen(true)}
        busy={busy}
      />

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan barcode</DialogTitle>
          </DialogHeader>
          <div className="grid aspect-video place-items-center rounded-lg border-2 border-dashed bg-muted/40">
            <ScanBarcode className="h-16 w-16 animate-pulse text-primary" />
          </div>
          <BarcodeScannerInput
            ref={barcodeRef}
            large
            value={scanCode}
            onChange={setScanCode}
            onSubmit={() => void handleBarcodeSubmit()}
            disabled={busy}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleBarcodeSubmit()} disabled={busy}>
              Add to cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={cart?.total_amount ?? 0}
        onConfirm={handleCheckout}
        loading={checkout.isPending}
      />

      <ReceiptPreviewDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
        onNewSale={() => {
          setReceiptOpen(false);
          setReceipt(null);
        }}
      />

      <PosShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <span className="sr-only">{POS_SHORTCUTS.map((s) => s.keys).join(" ")}</span>
    </div>
  );
}
