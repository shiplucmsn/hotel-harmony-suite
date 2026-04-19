import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Users, Maximize2, Bed } from "lucide-react";
import { publicRooms } from "@/data/rooms";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function RoomDetail() {
  const { slug } = useParams();
  const { format } = useCurrency();
  const room = publicRooms.find((r) => r.slug === slug);
  if (!room) return <Navigate to="/rooms-public" replace />;

  return (
    <div className="container py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/rooms-public"><ArrowLeft className="mr-2 h-4 w-4" /> Back to rooms</Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl overflow-hidden">
            <img src={room.image} alt={room.name} className="w-full aspect-video object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-primary mb-2">{room.type}</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{room.name}</h1>
            <div className="flex gap-6 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> {room.size}</span>
              <span className="flex items-center gap-2"><Bed className="h-4 w-4" /> {room.beds}</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Up to {room.guests} guests</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">{room.description}</p>

            <h3 className="font-heading text-xl font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {room.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 self-start glass-card rounded-xl p-6 h-fit">
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-heading text-4xl font-bold gold-text">{format(room.price)}</p>
          <p className="text-xs text-muted-foreground mb-6">per night, taxes included</p>
          <Button asChild className="w-full gold-gradient text-primary-foreground" size="lg">
            <Link to={`/reserve?room=${room.slug}`}>Reserve This Room</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">Free cancellation up to 24h before check-in</p>
        </aside>
      </div>
    </div>
  );
}
