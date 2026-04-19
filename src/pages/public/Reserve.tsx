import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { publicRooms } from "@/data/rooms";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Dates", "Room", "Guest", "Payment"];

export default function Reserve() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { format: fmt } = useCurrency();
  const initialRoom = publicRooms.find((r) => r.slug === params.get("room")) ?? publicRooms[1];

  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(Date.now() + 2 * 86400000));
  const [guests, setGuests] = useState(2);
  const [roomId, setRoomId] = useState(initialRoom.id);
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "", phone: "", requests: "" });
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "12/28", cvc: "123", name: "" });
  const [processing, setProcessing] = useState(false);

  const room = publicRooms.find((r) => r.id === roomId)!;
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    return Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  }, [checkIn, checkOut]);
  const subtotal = room.price * nights;
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const pay = () => {
    if (!guest.firstName || !guest.email || !card.name) {
      toast.error("Please fill all required fields");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const ref = "RYL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      navigate(`/reserve/confirmation?ref=${ref}&room=${room.slug}&total=${total.toFixed(2)}`);
    }, 1500);
  };

  return (
    <div className="container py-12 max-w-6xl">
      <h1 className="font-heading text-4xl font-bold mb-2">Reserve your stay</h1>
      <p className="text-muted-foreground mb-8">Complete your booking in a few elegant steps.</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
              "bg-secondary text-muted-foreground"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-sm hidden sm:inline", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-xl p-6"
            >
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="font-heading text-2xl font-semibold">When are you traveling?</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Check-in</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mt-1.5">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mt-1.5">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <Label>Guests</Label>
                    <Input type="number" min={1} max={6} value={guests} onChange={(e) => setGuests(+e.target.value)} className="mt-1.5 w-32" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Choose your room</h2>
                  {publicRooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoomId(r.id)}
                      className={cn(
                        "w-full flex gap-4 p-3 rounded-lg border transition-all text-left",
                        roomId === r.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <img src={r.image} alt={r.name} className="w-28 h-20 object-cover rounded-md" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{r.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg gold-text font-bold">{fmt(r.price)}</p>
                        <p className="text-xs text-muted-foreground">/night</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-heading text-2xl font-semibold">Guest information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>First name *</Label><Input className="mt-1.5" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} /></div>
                    <div><Label>Last name *</Label><Input className="mt-1.5" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} /></div>
                    <div><Label>Email *</Label><Input type="email" className="mt-1.5" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input className="mt-1.5" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} /></div>
                  </div>
                  <div>
                    <Label>Special requests</Label>
                    <Input className="mt-1.5" placeholder="Late check-in, dietary needs..." value={guest.requests} onChange={(e) => setGuest({ ...guest, requests: e.target.value })} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-semibold">Payment</h2>
                    <span className="text-xs text-muted-foreground">Powered by <span className="text-primary font-semibold">Stripe</span> (demo)</span>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-3">💳 This is a mock checkout. No real charge will be made.</p>
                    <div className="space-y-3">
                      <div><Label>Cardholder name *</Label><Input className="mt-1.5" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="As on card" /></div>
                      <div><Label>Card number</Label><Input className="mt-1.5 font-mono" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Expiry</Label><Input className="mt-1.5 font-mono" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></div>
                        <div><Label>CVC</Label><Input className="mt-1.5 font-mono" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={back} disabled={step === 0}>Back</Button>
                {step < 3 ? (
                  <Button onClick={next} className="gold-gradient text-primary-foreground">Continue</Button>
                ) : (
                  <Button onClick={pay} disabled={processing} className="gold-gradient text-primary-foreground">
                    {processing ? "Processing..." : `Pay ${fmt(total)}`}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Summary sidebar */}
        <aside className="glass-card rounded-xl p-6 h-fit lg:sticky lg:top-24">
          <h3 className="font-heading text-lg font-semibold mb-4">Booking summary</h3>
          <img src={room.image} alt={room.name} className="w-full aspect-video object-cover rounded-md mb-3" />
          <p className="font-semibold">{room.name}</p>
          <p className="text-xs text-muted-foreground mb-4">{room.type}</p>
          <div className="space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>{checkIn && format(checkIn, "MMM d")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>{checkOut && format(checkOut, "MMM d")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nights</span><span>{nights}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{guests}</span></div>
          </div>
          <div className="space-y-2 text-sm border-t border-border mt-4 pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxes (12%)</span><span>{fmt(tax)}</span></div>
            <div className="flex justify-between font-heading text-lg font-bold pt-2 border-t border-border"><span>Total</span><span className="gold-text">{fmt(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
