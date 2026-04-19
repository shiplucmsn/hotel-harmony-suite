import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, CheckCircle2, Truck } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";

type Status = "new" | "preparing" | "ready" | "delivered";
interface Order {
  id: string; source: string; room: string; items: string[]; total: number; time: string; status: Status; staff?: string;
}

const initial: Order[] = [
  { id: "ORD-1284", source: "Restaurant", room: "Suite 401", items: ["Wagyu Tasting", "Caesar Salad", "Champagne 375ml"], total: 232, time: "2m ago", status: "new" },
  { id: "ORD-1283", source: "Mini-Bar", room: "Deluxe 302", items: ["Macadamia Nuts ×2", "Sparkling Water"], total: 36, time: "8m ago", status: "preparing", staff: "Sara K." },
  { id: "ORD-1282", source: "Spa", room: "Suite 401", items: ["Hot Stone Therapy 90min"], total: 240, time: "14m ago", status: "preparing", staff: "Yuki S." },
  { id: "ORD-1281", source: "Restaurant", room: "Deluxe 205", items: ["Truffle Risotto", "Crème Brûlée"], total: 66, time: "22m ago", status: "ready", staff: "Mateo C." },
  { id: "ORD-1280", source: "Retail", room: "Single 110", items: ["Royale Robe", "Signature Candle"], total: 260, time: "35m ago", status: "delivered", staff: "Diego R." },
];

const flow: Status[] = ["new", "preparing", "ready", "delivered"];
const labels: Record<Status, { label: string; icon: typeof Clock; color: string }> = {
  new: { label: "New", icon: Clock, color: "bg-info/20 text-info" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-warning/20 text-warning" },
  ready: { label: "Ready", icon: CheckCircle2, color: "bg-success/20 text-success" },
  delivered: { label: "Delivered", icon: Truck, color: "bg-secondary text-muted-foreground" },
};

export default function Orders() {
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>(initial);
  const [filter, setFilter] = useState("all");

  const advance = (id: string) => setOrders((o) => o.map((x) => {
    if (x.id !== id) return x;
    const idx = flow.indexOf(x.status);
    return idx < flow.length - 1 ? { ...x, status: flow[idx + 1] } : x;
  }));

  const visible = filter === "all" ? orders : orders.filter((o) => o.source.toLowerCase() === filter);

  return (
    <DashboardLayout title="Orders" subtitle="Unified order management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {flow.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const Icon = labels[s].icon;
          return (
            <Card key={s} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{labels[s].label}</p>
                  <p className="font-heading text-2xl font-bold mt-1">{count}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="mini-bar">Mini-Bar</TabsTrigger>
          <TabsTrigger value="spa">Spa</TabsTrigger>
          <TabsTrigger value="retail">Retail</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4 space-y-3">
          {visible.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-sm">{o.id}</span>
                      <Badge variant="outline">{o.source}</Badge>
                      <Badge className={`${labels[o.status].color} border-none`}>{labels[o.status].label}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{o.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Room <span className="text-foreground">{o.room}</span> {o.staff && <>· Assigned to <span className="text-foreground">{o.staff}</span></>}</p>
                    <p className="text-sm mt-1">{o.items.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg font-bold gold-text">{format(o.total)}</p>
                    {o.status !== "delivered" && (
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => advance(o.id)}>
                        Mark {labels[flow[flow.indexOf(o.status) + 1]].label}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
