import hero from "@/assets/hero-hotel.jpg";

export default function About() {
  return (
    <>
      <section className="relative h-[50vh] flex items-end">
        <img src={hero} alt="Royale Hotel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="container relative z-10 pb-12">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Our Story</p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold">A century of <span className="gold-text">Royale</span></h1>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Founded in 1924, Royale began as a quiet retreat favored by writers, diplomats, and artists. A century later, we remain devoted to the same principles: discreet service, considered design, and the kind of details that make a stay feel like a memory before it ends.</p>
          <p>Every Royale property is designed to feel both timeless and present — rooted in heritage, yet alive with contemporary craft. Our team is small by intention, and trained to anticipate rather than react.</p>
          <p>Whether you arrive for one night or one season, we welcome you with the warmth of a long-awaited friend.</p>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[
            { n: "100+", l: "Years of heritage" },
            { n: "98%", l: "Guest satisfaction" },
            { n: "12", l: "Global locations" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-heading text-4xl gold-text font-bold">{s.n}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
