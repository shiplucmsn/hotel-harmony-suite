import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BedDouble, Bath, Wifi, Tv, Wind, Coffee, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi, TV: Tv, AC: Wind, "Mini Bar": Coffee, Bathtub: Bath,
};

const rooms = [
  { id: 101, type: "Single", floor: 1, beds: 1, price: 89, status: "Available", amenities: ["WiFi", "TV", "AC"] },
  { id: 102, type: "Single", floor: 1, beds: 1, price: 89, status: "Occupied", amenities: ["WiFi", "TV", "AC"], guest: "J. Wilson" },
  { id: 201, type: "Deluxe", floor: 2, beds: 2, price: 159, status: "Available", amenities: ["WiFi", "TV", "AC", "Mini Bar"] },
  { id: 202, type: "Deluxe", floor: 2, beds: 2, price: 159, status: "Reserved", amenities: ["WiFi", "TV", "AC", "Mini Bar"] },
  { id: 203, type: "Deluxe", floor: 2, beds: 1, price: 139, status: "Occupied", amenities: ["WiFi", "TV", "AC", "Mini Bar"], guest: "S. Chen" },
  { id: 301, type: "Deluxe", floor: 3, beds: 2, price: 169, status: "Maintenance", amenities: ["WiFi", "TV", "AC", "Mini Bar", "Bathtub"] },
  { id: 401, type: "Suite", floor: 4, beds: 2, price: 299, status: "Occupied", amenities: ["WiFi", "TV", "AC", "Mini Bar", "Bathtub"], guest: "M. Al-Rashid" },
  { id: 501, type: "Suite", floor: 5, beds: 2, price: 399, status: "Available", amenities: ["WiFi", "TV", "AC", "Mini Bar", "Bathtub"] },
];

const statusColors: Record<string, string> = {
  Available: "bg-success/20 text-success",
  Occupied: "bg-primary/20 text-primary",
  Reserved: "bg-info/20 text-info",
  Maintenance: "bg-destructive/20 text-destructive",
};

const typeColors: Record<string, string> = {
  Single: "border-muted-foreground/30",
  Deluxe: "border-info/30",
  Suite: "border-primary/30",
};

export default function Rooms() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Available", "Occupied", "Reserved", "Maintenance"];
  const filtered = filter === "All" ? rooms : rooms.filter((r) => r.status === filter);

  return (
    <DashboardLayout title="Rooms" subtitle="Manage room inventory and status">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rooms..." className="pl-9 bg-secondary border-border w-64" />
            </div>
            <Button variant="outline" size="icon" className="border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gold-gradient text-primary-foreground font-medium">
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer border-l-4 ${typeColors[room.type]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">Room {room.id}</p>
                  <p className="text-sm text-muted-foreground">{room.type} · Floor {room.floor}</p>
                </div>
                <Badge variant="outline" className={`${statusColors[room.status]} border-none text-xs`}>
                  {room.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{room.beds} {room.beds > 1 ? "beds" : "bed"}</span>
              </div>

              <div className="flex gap-1.5 mb-4">
                {room.amenities.map((a) => {
                  const Icon = amenityIcons[a];
                  return Icon ? (
                    <div key={a} className="w-7 h-7 rounded bg-secondary flex items-center justify-center" title={a}>
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : null;
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-lg font-heading font-bold text-primary">${room.price}</span>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>

              {room.guest && (
                <p className="text-xs text-muted-foreground mt-2">Guest: {room.guest}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
