import spa from "@/assets/amenity-spa.jpg";
import dining from "@/assets/amenity-dining.jpg";
import suite from "@/assets/room-suite.jpg";

const items = [
  { img: spa, title: "Aurum Spa", desc: "Signature treatments inspired by ancient rituals, in a candle-lit sanctuary." },
  { img: dining, title: "Maison Royale", desc: "Michelin-starred fine dining with a seasonal tasting menu." },
  { img: suite, title: "Concierge", desc: "Around-the-clock personal service to curate your perfect stay." },
];

export default function Amenities() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Experiences</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">World-class amenities</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="glass-card rounded-xl overflow-hidden group">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={it.img} alt={it.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-2xl font-semibold mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
