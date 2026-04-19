import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Maximize2, Bed, ArrowRight } from "lucide-react";
import { publicRooms } from "@/data/rooms";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";

export default function RoomsPublic() {
  const { format } = useCurrency();
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Accommodations</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Our Rooms & Suites</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Discover spaces designed for rest, work, and unforgettable moments.</p>
      </div>

      <div className="grid gap-8">
        {publicRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden grid md:grid-cols-2 hover:border-primary/40 transition-colors"
          >
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
              <img src={room.image} alt={room.name} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">{room.type}</p>
              <h2 className="font-heading text-3xl font-semibold mb-3">{room.name}</h2>
              <p className="text-sm text-muted-foreground mb-5">{room.description}</p>

              <div className="flex gap-5 text-xs text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" /> {room.size}</span>
                <span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5" /> {room.beds}</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {room.guests} guests</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities.slice(0, 5).map((a) => (
                  <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{a}</span>
                ))}
              </div>

              <div className="mt-auto flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-heading text-3xl font-bold gold-text">{format(room.price)}<span className="text-sm font-body font-normal text-muted-foreground"> /night</span></p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/rooms-public/${room.slug}`}>Details</Link>
                  </Button>
                  <Button asChild className="gold-gradient text-primary-foreground">
                    <Link to={`/reserve?room=${room.slug}`}>Book <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
