import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { useState } from "react";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/rooms-public", label: "Rooms" },
  { to: "/amenities", label: "Amenities" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <span className="font-bold text-primary-foreground">R</span>
            </div>
            <span className="font-heading text-xl font-semibold">Royale</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Select value={currency.code} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
              <SelectTrigger className="w-[90px] h-9 text-xs hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CURRENCIES).map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild size="sm" className="hidden md:inline-flex gold-gradient text-primary-foreground">
              <Link to="/reserve">Book Now</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container py-4 flex flex-col gap-3">
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-sm py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Button asChild className="gold-gradient text-primary-foreground mt-2">
                <Link to="/reserve" onClick={() => setOpen(false)}>Book Now</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="container py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">R</span>
              </div>
              <span className="font-heading text-lg font-semibold">Royale</span>
            </div>
            <p className="text-sm text-muted-foreground">Where timeless elegance meets modern comfort.</p>
            <div className="flex gap-3 mt-4">
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {navItems.map((n) => (
                <li key={n.to}><Link to={n.to} className="hover:text-primary">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> hello@royale.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> 100 Crown Ave, NYC</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-3">Staff Portal</h4>
            <p className="text-sm text-muted-foreground mb-3">Hotel staff login</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">Open Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © 2026 Royale Hotel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
