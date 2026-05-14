import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { plans } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Nebula ERP" },
      { name: "description", content: "Simple, transparent pricing for teams of all sizes. Start free, scale as you grow." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        <div className="mx-auto mt-8 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3"><Sparkles className="mr-1 h-3 w-3" /> Pricing</Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Plans that grow with you</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more power. Cancel anytime.</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2">
            <span className={cn("text-sm", !yearly && "font-semibold")}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={cn("text-sm", yearly && "font-semibold")}>Yearly</span>
            <Badge variant="secondary" className="text-[10px]">Save 20%</Badge>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const price = yearly ? Math.round(p.price * 0.8) : p.price;
            return (
              <div key={p.name}
                className={cn("relative rounded-2xl border bg-card p-6 transition-all hover:shadow-elegant",
                  p.highlighted && "border-primary shadow-elegant scale-[1.02] gradient-card")}
              >
                {p.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground border-0">Most popular</Badge>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight">${price}</span>
                  <span className="pb-1 text-sm text-muted-foreground">/user/month</span>
                </div>
                <Button asChild className={cn("mt-5 w-full", p.highlighted ? "gradient-primary text-primary-foreground border-0" : "")} variant={p.highlighted ? "default" : "outline"}>
                  <Link to="/register">Start free trial</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="text-xl font-semibold">Need something custom?</h2>
          <p className="mt-2 text-sm text-muted-foreground">We work with enterprises that need dedicated infrastructure, custom SLAs, or compliance certifications.</p>
          <Button variant="outline" className="mt-4">Contact sales</Button>
        </div>
      </div>
    </div>
  );
}
