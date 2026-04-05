import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Search, Star, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const guests = [
  { id: 1, name: "James Wilson", email: "jwilson@email.com", phone: "+1 555-0101", country: "USA", stays: 5, loyalty: "Gold", spent: "$4,250", lastVisit: "Apr 5, 2026", avatar: "JW" },
  { id: 2, name: "Sarah Chen", email: "schen@email.com", phone: "+86 138-0000", country: "China", stays: 2, loyalty: "Silver", spent: "$636", lastVisit: "Apr 5, 2026", avatar: "SC" },
  { id: 3, name: "Mohammed Al-Rashid", email: "mar@email.com", phone: "+971 50-000", country: "UAE", stays: 8, loyalty: "Platinum", spent: "$12,400", lastVisit: "Apr 6, 2026", avatar: "MA" },
  { id: 4, name: "Emily Parker", email: "eparker@email.com", phone: "+1 555-0202", country: "USA", stays: 1, loyalty: "Standard", spent: "$89", lastVisit: "Apr 5, 2026", avatar: "EP" },
  { id: 5, name: "Raj Patel", email: "rpatel@email.com", phone: "+91 98765-0000", country: "India", stays: 3, loyalty: "Silver", spent: "$834", lastVisit: "Apr 7, 2026", avatar: "RP" },
  { id: 6, name: "Lisa Taylor", email: "ltaylor@email.com", phone: "+44 7911-000", country: "UK", stays: 12, loyalty: "Platinum", spent: "$18,600", lastVisit: "Apr 8, 2026", avatar: "LT" },
];

const loyaltyColors: Record<string, string> = {
  Standard: "bg-muted text-muted-foreground",
  Silver: "bg-secondary text-secondary-foreground",
  Gold: "bg-primary/20 text-primary",
  Platinum: "bg-primary text-primary-foreground",
};

export default function Guests() {
  return (
    <DashboardLayout title="Guests" subtitle="Guest profiles and CRM">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search guests..." className="pl-9 bg-secondary border-border w-64" />
          </div>
          <Button className="gold-gradient text-primary-foreground font-medium">
            <Plus className="h-4 w-4 mr-2" /> Add Guest
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((guest, i) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">{guest.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-foreground truncate">{guest.name}</h3>
                    <Badge variant="outline" className={`${loyaltyColors[guest.loyalty]} border-none text-[10px] flex-shrink-0`}>
                      {guest.loyalty}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {guest.email}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {guest.phone}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {guest.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-heading font-bold text-foreground">{guest.stays}</p>
                  <p className="text-[10px] text-muted-foreground">Stays</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-heading font-bold text-primary">{guest.spent}</p>
                  <p className="text-[10px] text-muted-foreground">Total Spent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={`h-3 w-3 ${si < Math.min(guest.stays, 5) ? "text-primary fill-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Rating</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
