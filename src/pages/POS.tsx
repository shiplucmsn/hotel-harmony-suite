import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ChefHat, Wine, Sparkles, ShoppingBag, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Item { id: string; name: string; price: number; cat: string; }
interface CartItem extends Item { qty: number; }

const fb: Item[] = [
  { id: "f1", name: "Wagyu Tasting", price: 145, cat: "Mains" },
  { id: "f2", name: "Truffle Risotto", price: 48, cat: "Mains" },
  { id: "f3", name: "Caesar Salad", price: 22, cat: "Starters" },
  { id: "f4", name: "Lobster Bisque", price: 28, cat: "Starters" },
  { id: "f5", name: "Crème Brûlée", price: 18, cat: "Desserts" },
  { id: "f6", name: "Chocolate Soufflé", price: 20, cat: "Desserts" },
];
const minibar: Item[] = [
  { id: "m1", name: "Champagne 375ml", price: 65, cat: "Drinks" },
  { id: "m2", name: "Macadamia Nuts", price: 14, cat: "Snacks" },
  { id: "m3", name: "Artisan Chocolates", price: 22, cat: "Snacks" },
  { id: "m4", name: "Sparkling Water", price: 8, cat: "Drinks" },
];
const spa: Item[] = [
  { id: "s1", name: "Aurum Signature Massage 60min", price: 180, cat: "Massage" },
  { id: "s2", name: "Hot Stone Therapy 90min", price: 240, cat: "Therapy" },
  { id: "s3", name: "Facial Ritual 75min", price: 165, cat: "Facial" },
  { id: "s4", name: "Couples Spa Suite 2hr", price: 520, cat: "Couples" },
];
const retail: Item[] = [
  { id: "r1", name: "Royale Robe", price: 195, cat: "Apparel" },
  { id: "r2", name: "Signature Candle", price: 65, cat: "Home" },
  { id: "r3", name: "Skincare Set", price: 145, cat: "Beauty" },
  { id: "r4", name: "Leather Journal", price: 85, cat: "Stationery" },
];

const tabs = [
  { id: "fb", label: "Restaurant", icon: ChefHat, items: fb },
  { id: "minibar", label: "Mini-Bar", icon: Wine, items: minibar },
  { id: "spa", label: "Spa", icon: Sparkles, items: spa },
  { id: "retail", label: "Retail", icon: ShoppingBag, items: retail },
];

export default function POS() {
  const [active, setActive] = useState("fb");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chargeTo, setChargeTo] = useState<"room" | "card">("room");
  const [room, setRoom] = useState("401");
  const { format } = useCurrency();

  const items = tabs.find((t) => t.id === active)!.items;
  const add = (it: Item) => setCart((c) => {
    const ex = c.find((x) => x.id === it.id);
    if (ex) return c.map((x) => x.id === it.id ? { ...x, qty: x.qty + 1 } : x);
    return [...c, { ...it, qty: 1 }];
  });
  const dec = (id: string) => setCart((c) => c.flatMap((x) => x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const remove = (id: string) => setCart((c) => c.filter((x) => x.id !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const send = () => {
    if (!cart.length) return;
    const dest = active === "fb" ? "Kitchen ticket sent" : chargeTo === "room" ? `Charged to room ${room}` : "Card payment processed";
    toast.success(dest, { description: `${cart.length} items · ${format(total)}` });
    setCart([]);
  };

  return (
    <DashboardLayout title="Point of Sale" subtitle="F&B · Mini-bar · Spa · Retail">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="grid grid-cols-4">
              {tabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id}><t.icon className="mr-2 h-4 w-4" /> {t.label}</TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.id} value={t.id}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {t.items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => add(it)}
                      className="glass-card rounded-lg p-4 text-left hover:border-primary/50 transition-colors"
                    >
                      <Badge variant="outline" className="text-xs mb-2">{it.cat}</Badge>
                      <p className="font-semibold text-sm">{it.name}</p>
                      <p className="text-primary font-heading text-lg font-bold mt-1">{format(it.price)}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="p-5 h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2"><Receipt className="h-4 w-4" /> Cart</h3>
            <Badge variant="outline">{cart.length}</Badge>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Tap items to add</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto mb-4">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{format(c.price)} × {c.qty}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => dec(c.id)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm">{c.qty}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => add(c)}><Plus className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{format(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span>{format(tax)}</span></div>
            <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-border"><span>Total</span><span className="gold-text">{format(total)}</span></div>
          </div>

          <div className="space-y-3 mt-4 pt-3 border-t border-border">
            <div className="flex gap-2">
              <Button size="sm" variant={chargeTo === "room" ? "default" : "outline"} className="flex-1" onClick={() => setChargeTo("room")}>Charge Room</Button>
              <Button size="sm" variant={chargeTo === "card" ? "default" : "outline"} className="flex-1" onClick={() => setChargeTo("card")}>Card</Button>
            </div>
            {chargeTo === "room" && <Input placeholder="Room #" value={room} onChange={(e) => setRoom(e.target.value)} />}
            <Button onClick={send} disabled={!cart.length} className="w-full gold-gradient text-primary-foreground">
              {active === "fb" ? "Send to Kitchen" : "Complete Sale"}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
