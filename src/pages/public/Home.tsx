import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Wifi, Coffee, Dumbbell, Utensils, Waves, Sparkles } from "lucide-react";
import hero from "@/assets/hero-hotel.jpg";
import { publicRooms } from "@/data/rooms";
import { useCurrency } from "@/contexts/CurrencyContext";

const amenities = [
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Utensils, label: "Fine Dining" },
  { icon: Waves, label: "Infinity Pool" },
  { icon: Sparkles, label: "Luxury Spa" },
  { icon: Dumbbell, label: "24/7 Gym" },
  { icon: Coffee, label: "Lounge Bar" },
];

const testimonials = [
  { name: "Sophia L.", text: "The most refined stay of my life. Every detail was thoughtful.", rating: 5 },
  { name: "Marcus R.", text: "Service was impeccable. The suite views are unforgettable.", rating: 5 },
  { name: "Aiko T.", text: "A perfect blend of heritage and modern luxury. We will return.", rating: 5 },
];

export default function Home() {
  const { format } = useCurrency();

  return (
    <>
      {/* HERO */}
      <section className="relative h-[90vh] flex items-center">
        <img src={hero} alt="Royale Hotel" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/30" />
        <div className="container relative z-10 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary text-sm tracking-[0.3em] uppercase mb-4">
            Welcome to Royale
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-5xl md:text-7xl font-bold leading-tight"
          >
            Where elegance <span className="gold-text">finds home</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mt-6 max-w-lg"
          >
            A refined sanctuary in the heart of the city. Discover suites crafted for those who appreciate the art of stillness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mt-8"
          >
            <Button asChild size="lg" className="gold-gradient text-primary-foreground">
              <Link to="/reserve">Reserve Your Stay <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/rooms-public">Explore Rooms</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* AMENITIES STRIP */}
      <section className="border-y border-border bg-card/40">
        <div className="container py-10 grid grid-cols-2 md:grid-cols-6 gap-6">
          {amenities.map((a) => (
            <div key={a.label} className="flex flex-col items-center text-center gap-2">
              <a.icon className="h-6 w-6 text-primary" />
              <span className="text-xs text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Accommodations</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">Signature Rooms</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {publicRooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={room.image} alt={room.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-primary mb-2">{room.type}</p>
                <h3 className="font-heading text-2xl font-semibold mb-2">{room.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{room.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-heading text-2xl font-bold gold-text">{format(room.price)}<span className="text-xs text-muted-foreground font-body font-normal"> /night</span></p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/rooms-public/${room.slug}`}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-card/40 border-y border-border py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Guest Voices</p>
            <h2 className="font-heading text-4xl font-bold">Stories from our suites</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, idx) => <Star key={idx} className="h-4 w-4 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Begin your <span className="gold-text">Royale</span> story</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Reserve your suite today and experience hospitality redefined.</p>
        <Button asChild size="lg" className="gold-gradient text-primary-foreground">
          <Link to="/reserve">Book Your Stay <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>
    </>
  );
}
