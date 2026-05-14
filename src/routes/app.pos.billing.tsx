import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { posProducts, posCategories, recentReceipts, type PosProduct } from "@/lib/pos-mock";
import { Search, ScanBarcode, Plus, Minus, Trash2, CreditCard, Wallet, Banknote, Printer, X, Receipt as ReceiptIcon, History, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pos/billing")({ component: BillingPage });

type CartItem = { product: PosProduct; qty: number };

function BillingPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { product: posProducts[1], qty: 2 },
    { product: posProducts[8], qty: 1 },
  ]);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [method, setMethod] = useState<"card" | "cash" | "wallet">("card");

  const filtered = useMemo(() => posProducts.filter(p =>
    (cat === "All" || p.category === cat) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
  ), [cat, q]);

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const add = (p: PosProduct) => setCart(prev => {
    const ex = prev.find(c => c.product.id === p.id);
    if (ex) return prev.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c);
    return [...prev, { product: p, qty: 1 }];
  });
  const dec = (id: string) => setCart(prev => prev.flatMap(c => c.product.id === id ? (c.qty > 1 ? [{ ...c, qty: c.qty - 1 }] : []) : [c]));
  const remove = (id: string) => setCart(prev => prev.filter(c => c.product.id !== id));

  const scan = () => {
    const p = posProducts.find(x => x.sku === scanCode || x.name.toLowerCase() === scanCode.toLowerCase());
    if (p) { add(p); toast.success(`Added ${p.name}`); setScanCode(""); setScanOpen(false); }
    else toast.error("Product not found");
  };

  return (
    <div className="-m-6 h-[calc(100vh-3rem)] flex flex-col lg:flex-row bg-muted/20">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-10" value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." />
          </div>
          <Button variant="outline" onClick={() => setScanOpen(true)}><ScanBarcode className="h-4 w-4 mr-2" />Scan</Button>
        </div>

        <Tabs value={cat} onValueChange={setCat}>
          <TabsList className="flex-wrap h-auto">
            {posCategories.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => add(p)} className="text-left group">
                <Card className="transition-all hover:shadow-elegant hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-3">
                    <div className="aspect-square rounded-lg bg-muted/50 grid place-items-center text-4xl">{p.image}</div>
                    <div className="mt-2 text-sm font-medium truncate">{p.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{p.sku}</span>
                      <span className="text-sm font-semibold text-primary">${p.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-full lg:w-[420px] border-l bg-card flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Order #POS-2026-00922</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Walk-in customer</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setReceiptOpen(true)}><History className="h-4 w-4" /></Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {cart.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <ReceiptIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                Cart is empty. Tap a product to add.
              </div>
            )}
            {cart.map(c => (
              <div key={c.product.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                <div className="text-2xl">{c.product.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.product.name}</div>
                  <div className="text-xs text-muted-foreground">${c.product.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => dec(c.product.id)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm">{c.qty}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => add(c.product)}><Plus className="h-3 w-3" /></Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c.product.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4 space-y-2 bg-muted/20">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" disabled={cart.length === 0} onClick={() => setCart([])}><X className="h-4 w-4 mr-1" />Clear</Button>
            <Button disabled={cart.length === 0} className="gradient-primary text-primary-foreground border-0" onClick={() => setPayOpen(true)}>
              <CreditCard className="h-4 w-4 mr-1" />Pay
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Scan barcode</DialogTitle></DialogHeader>
          <div className="aspect-video rounded-lg bg-muted/50 grid place-items-center border-2 border-dashed">
            <div className="text-center">
              <ScanBarcode className="h-16 w-16 mx-auto text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground mt-2">Aim camera at barcode</p>
            </div>
          </div>
          <Input autoFocus placeholder="…or type SKU manually" value={scanCode} onChange={e => setScanCode(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>Cancel</Button>
            <Button onClick={scan}>Add to cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment — ${total.toFixed(2)}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "card", label: "Card", icon: CreditCard },
              { id: "cash", label: "Cash", icon: Banknote },
              { id: "wallet", label: "Wallet", icon: Wallet },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id as "card" | "cash" | "wallet")} className={`rounded-lg border p-4 text-center transition-all ${method === m.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <m.icon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">{m.label}</div>
              </button>
            ))}
          </div>
          {method === "cash" && (
            <div className="space-y-2"><div className="text-sm text-muted-foreground">Amount tendered</div><Input placeholder="0.00" /></div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setPayOpen(false); setReceiptOpen(true); toast.success("Payment confirmed"); }}>Charge ${total.toFixed(2)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
          <div className="rounded-lg border bg-card p-4 font-mono text-xs">
            <div className="text-center">
              <div className="font-bold text-base">NEBULA POS</div>
              <div className="text-muted-foreground">Acme Industries</div>
              <div className="text-muted-foreground">Berlin, DE</div>
              <Separator className="my-2" />
              <div>POS-2026-00922 · {new Date().toLocaleString()}</div>
            </div>
            <Separator className="my-2" />
            {cart.map(c => (
              <div key={c.product.id} className="flex justify-between">
                <span>{c.qty}x {c.product.name}</span>
                <span>${(c.product.price * c.qty).toFixed(2)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold mt-1"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between mt-1"><span>Paid ({method})</span><span>${total.toFixed(2)}</span></div>
            <Separator className="my-2" />
            <div className="text-center text-muted-foreground">Thank you!</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Recent receipts</div>
            {recentReceipts.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs rounded border p-2">
                <span className="font-mono">{r.ref}</span>
                <Badge variant="outline">{r.payment}</Badge>
                <span>${r.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>Close</Button>
            <Button onClick={() => toast.success("Sent to printer")}><Printer className="h-4 w-4 mr-1" />Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
