import hero from "@/assets/hero-hotel.jpg";
import suite from "@/assets/room-suite.jpg";
import deluxe from "@/assets/room-deluxe.jpg";
import single from "@/assets/room-single.jpg";
import spa from "@/assets/amenity-spa.jpg";
import dining from "@/assets/amenity-dining.jpg";

const images = [hero, suite, dining, deluxe, spa, single];

export default function Gallery() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Visual Story</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Gallery</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {images.map((img, i) => (
          <div key={i} className={`overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
            <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
