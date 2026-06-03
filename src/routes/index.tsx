import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check, BarChart3, Boxes, Users, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nebula ERP — Run your entire business from one platform" },
      { name: "description", content: "Modern SaaS ERP with CRM, finance, inventory, HR and analytics. Built for teams that move fast." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: BarChart3, title: "Real-time analytics", desc: "Dashboards that update as your business does. Drill down from KPIs to transactions in one click." },
  { icon: Boxes, title: "Unified inventory", desc: "Track stock across warehouses with low-stock alerts and automated reorder points." },
  { icon: Users, title: "Smart CRM", desc: "Manage contacts, deals and pipelines with built-in automations and email sync." },
  { icon: Shield, title: "Enterprise security", desc: "SSO, SAML, audit logs and granular role-based permissions out of the box." },
  { icon: Zap, title: "Workflow automation", desc: "No-code automations for approvals, notifications and recurring tasks." },
  { icon: Globe, title: "Multi-tenant ready", desc: "One platform, unlimited workspaces. Perfect for agencies and groups of companies." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Nebula ERP</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Sign in</Link></Button>
            <Button size="sm" asChild className="gradient-primary text-primary-foreground border-0 shadow-elegant">
              <Link to="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
              <Sparkles className="mr-1 h-3 w-3" /> Now with AI assistant
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Run your entire business from <span className="text-gradient">one platform</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Nebula ERP unifies CRM, finance, inventory, HR and analytics into a single, beautifully designed workspace your team will actually love.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="gradient-primary text-primary-foreground border-0 shadow-elegant">
                <Link to="/signup">Start free trial <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/app/dashboard">View live demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">7-day free trial · No credit card required</p>
          </div>

          {/* Hero preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-2xl glass shadow-elegant p-2">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                  <div className="ml-auto text-xs text-muted-foreground">app.nebulaerp.com/dashboard</div>
                </div>
                <div className="grid grid-cols-12 gap-3 p-4">
                  <div className="col-span-3 hidden md:block space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className={`h-7 rounded-md ${i === 0 ? "gradient-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="col-span-12 md:col-span-9 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <div className="h-2 w-12 rounded bg-muted" />
                          <div className="mt-2 h-5 w-16 rounded bg-foreground/10" />
                          <div className="mt-2 h-1.5 w-20 rounded bg-success/40" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 50, 80, 60, 90, 70, 95, 75, 88, 78, 100].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t gradient-primary opacity-80" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="mt-16 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Trusted by teams at</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-70">
              {["ACME", "GLOBEX", "INITECH", "STARK", "WAYNE", "UMBRELLA"].map((c) => (
                <span key={c} className="text-sm font-semibold tracking-widest text-muted-foreground">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3">Modules</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything your business needs</h2>
          <p className="mt-3 text-muted-foreground">Replace a dozen tools with one cohesive platform.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 transition-all hover:shadow-elegant hover:-translate-y-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 sm:p-16 text-center text-primary-foreground shadow-elegant">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
          <div className="relative">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to unify your operations?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">Join thousands of teams running smarter with Nebula ERP.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild variant="secondary"><Link to="/register">Start free trial</Link></Button>
              <Button size="lg" asChild variant="outline" className="bg-transparent border-white/30 text-primary-foreground hover:bg-white/10">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm opacity-90">
              {["No credit card", "14-day trial", "Cancel anytime"].map((x) => (
                <span key={x} className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> {x}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Nebula ERP, Inc.</p>
          <div className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a></div>
        </div>
      </footer>
    </div>
  );
}
