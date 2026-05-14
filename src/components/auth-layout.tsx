import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  title, subtitle, children, footer,
}: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-70" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Nebula ERP</span>
          </Link>
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-semibold leading-tight">
              The unified platform for modern operations.
            </h2>
            <p className="text-muted-foreground">
              CRM, finance, inventory, HR and analytics — beautifully integrated and ready to scale with your team.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {["AR", "MC", "PN", "DA"].map((i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background gradient-primary text-[10px] font-semibold text-primary-foreground">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Trusted by <span className="font-semibold text-foreground">12,400+</span> teams worldwide</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nebula ERP, Inc.</p>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-slide-up">
            <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Nebula ERP</span>
            </Link>
            <div className="rounded-2xl glass shadow-elegant p-6 sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
