import suite from "@/assets/room-suite.jpg";
import deluxe from "@/assets/room-deluxe.jpg";
import single from "@/assets/room-single.jpg";

export interface PublicRoom {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number; // USD per night
  image: string;
  size: string;
  beds: string;
  guests: number;
  description: string;
  amenities: string[];
}

export const publicRooms: PublicRoom[] = [
  {
    id: "r-suite",
    slug: "presidential-suite",
    name: "Presidential Suite",
    type: "Suite",
    price: 899,
    image: suite,
    size: "120 m²",
    beds: "1 King",
    guests: 4,
    description:
      "Our flagship suite featuring panoramic city views, a private terrace, marble bathroom with soaking tub, and dedicated butler service.",
    amenities: ["King Bed", "Private Terrace", "Butler Service", "Marble Bath", "Smart TV", "Espresso Bar", "Free Wi-Fi", "Mini Bar"],
  },
  {
    id: "r-deluxe",
    slug: "deluxe-king",
    name: "Deluxe King",
    type: "Deluxe",
    price: 319,
    image: deluxe,
    size: "55 m²",
    beds: "1 King",
    guests: 2,
    description:
      "Sophisticated rooms with floor-to-ceiling windows, premium linens, and curated artwork. Perfect for business or leisure.",
    amenities: ["King Bed", "City View", "Smart TV", "Work Desk", "Free Wi-Fi", "Rain Shower", "Mini Bar"],
  },
  {
    id: "r-single",
    slug: "executive-single",
    name: "Executive Single",
    type: "Single",
    price: 89,
    image: single,
    size: "28 m²",
    beds: "1 Twin",
    guests: 1,
    description:
      "A snug retreat for solo travelers. Plush single bed, ergonomic workspace, and all the Royale comforts.",
    amenities: ["Twin Bed", "Work Desk", "Smart TV", "Free Wi-Fi", "Rain Shower"],
  },
];
