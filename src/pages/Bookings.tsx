import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const bookings = [
  { id: "BK-1024", guest: "James Wilson", email: "jwilson@email.com", room: "Suite 401", type: "Suite", checkIn: "2026-04-05", checkOut: "2026-04-08", nights: 3, total: "$897", status: "Checked In", source: "Website" },
  { id: "BK-1025", guest: "Sarah Chen", email: "schen@email.com", room: "Deluxe 302", type: "Deluxe", checkIn: "2026-04-05", checkOut: "2026-04-07", nights: 2, total: "$318", status: "Pending", source: "Walk-in" },
  { id: "BK-1026", guest: "Mohammed Al-Rashid", email: "mar@email.com", room: "Suite 501", type: "Suite", checkIn: "2026-04-06", checkOut: "2026-04-10", nights: 4, total: "$1,596", status: "Confirmed", source: "Booking.com" },
  { id: "BK-1027", guest: "Emily Parker", email: "eparker@email.com", room: "Single 105", type: "Single", checkIn: "2026-04-05", checkOut: "2026-04-06", nights: 1, total: "$89", status: "Checked In", source: "Website" },
  { id: "BK-1028", guest: "Raj Patel", email: "rpatel@email.com", room: "Deluxe 208", type: "Deluxe", checkIn: "2026-04-07", checkOut: "2026-04-09", nights: 2, total: "$278", status: "Confirmed", source: "Airbnb" },
  { id: "BK-1029", guest: "Lisa Taylor", email: "ltaylor@email.com", room: "Suite 402", type: "Suite", checkIn: "2026-04-08", checkOut: "2026-04-12", nights: 4, total: "$1,196", status: "Confirmed", source: "Phone" },
  { id: "BK-1030", guest: "Carlos Mendez", email: "cmendez@email.com", room: "Single 110", type: "Single", checkIn: "2026-04-04", checkOut: "2026-04-05", nights: 1, total: "$89", status: "Checked Out", source: "Walk-in" },
  { id: "BK-1031", guest: "Anna Kowalski", email: "akowalski@email.com", room: "Deluxe 205", type: "Deluxe", checkIn: "2026-04-03", checkOut: "2026-04-05", nights: 2, total: "$318", status: "Cancelled", source: "Website" },
];

const statusStyles: Record<string, string> = {
  "Checked In": "bg-success/20 text-success",
  "Checked Out": "bg-muted text-muted-foreground",
  Confirmed: "bg-info/20 text-info",
  Pending: "bg-warning/20 text-warning",
  Cancelled: "bg-destructive/20 text-destructive",
};

export default function Bookings() {
  return (
    <DashboardLayout title="Bookings" subtitle="Manage reservations and check-ins">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." className="pl-9 bg-secondary border-border w-64" />
            </div>
            <Button variant="outline" size="icon" className="border-border">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-border">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gold-gradient text-primary-foreground font-medium">
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Booking ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Guest</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Room</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Check-in</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Check-out</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nights</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-primary font-medium">{b.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-foreground font-medium">{b.guest}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{b.room}</td>
                    <td className="py-3 px-4 text-foreground">{b.checkIn}</td>
                    <td className="py-3 px-4 text-foreground">{b.checkOut}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.nights}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{b.total}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.source}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`${statusStyles[b.status]} border-none text-xs`}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
