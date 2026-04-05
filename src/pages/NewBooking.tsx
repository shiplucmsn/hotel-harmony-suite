import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Search, Check } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const roomTypes = [
  { type: "Single", basePrice: 89, rooms: ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"] },
  { type: "Deluxe", basePrice: 159, rooms: ["201", "202", "203", "204", "205", "206", "207", "208"] },
  { type: "Suite", basePrice: 299, rooms: ["401", "402", "501", "502"] },
];

const existingGuests = [
  { name: "James Wilson", email: "jwilson@email.com", phone: "+1 555-0101" },
  { name: "Sarah Chen", email: "schen@email.com", phone: "+86 138-0000" },
  { name: "Mohammed Al-Rashid", email: "mar@email.com", phone: "+971 50-000" },
  { name: "Emily Parker", email: "eparker@email.com", phone: "+1 555-0202" },
  { name: "Raj Patel", email: "rpatel@email.com", phone: "+91 98765-0000" },
  { name: "Lisa Taylor", email: "ltaylor@email.com", phone: "+44 7911-000" },
];

const TAX_RATE = 0.12;

export default function NewBooking() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<typeof existingGuests[0] | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [roomType, setRoomType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("Website");

  const filteredGuests = guestSearch.length > 0
    ? existingGuests.filter((g) => g.name.toLowerCase().includes(guestSearch.toLowerCase()))
    : [];

  const selectGuest = (guest: typeof existingGuests[0]) => {
    setSelectedGuest(guest);
    setGuestName(guest.name);
    setGuestEmail(guest.email);
    setGuestPhone(guest.phone);
    setGuestSearch("");
  };

  const selectedType = roomTypes.find((rt) => rt.type === roomType);
  const availableRooms = selectedType?.rooms || [];
  const nights = checkIn && checkOut ? Math.max(differenceInDays(checkOut, checkIn), 0) : 0;
  const basePrice = selectedType?.basePrice || 0;
  const subtotal = basePrice * nights;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleSubmit = () => {
    if (!guestName || !roomType || !selectedRoom || !checkIn || !checkOut || nights <= 0) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Booking Created", description: `Booking confirmed for ${guestName} in Room ${selectedRoom}.` });
    navigate("/bookings");
  };

  return (
    <DashboardLayout title="New Booking" subtitle="Create a reservation">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Guest Info */}
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">Guest Information</h3>

              <div className="relative">
                <Label className="text-muted-foreground">Search Existing Guests</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                {filteredGuests.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                    {filteredGuests.map((g) => (
                      <button
                        key={g.email}
                        onClick={() => selectGuest(g)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-foreground font-medium">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.email}</p>
                        </div>
                        {selectedGuest?.email === g.email && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-muted-foreground">Full Name *</Label>
                  <Input id="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <Input id="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                  <Input id="phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Booking Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Booking.com">Booking.com</SelectItem>
                      <SelectItem value="Airbnb">Airbnb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Room & Dates */}
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">Room & Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Room Type *</Label>
                  <Select value={roomType} onValueChange={(v) => { setRoomType(v); setSelectedRoom(""); }}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((rt) => (
                        <SelectItem key={rt.type} value={rt.type}>{rt.type} — ${rt.basePrice}/night</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Room Number *</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!roomType}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Select room" /></SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((r) => (
                        <SelectItem key={r} value={r}>Room {r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-in *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full mt-1 bg-secondary border-border justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {checkIn ? format(checkIn, "MMM d, yyyy") : <span className="text-muted-foreground">Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-out *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full mt-1 bg-secondary border-border justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {checkOut ? format(checkOut, "MMM d, yyyy") : <span className="text-muted-foreground">Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(d) => checkIn ? d <= checkIn : false} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-muted-foreground">Adults</Label>
                  <Select value={adults} onValueChange={setAdults}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Children</Label>
                  <Select value={children} onValueChange={setChildren}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[0, 1, 2, 3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-muted-foreground">Special Requests</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-secondary border-border mt-1" placeholder="Any special requests..." rows={3} />
              </div>
            </div>
          </motion.div>

          {/* Pricing Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-xl p-5 space-y-4 sticky top-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Price Summary</h3>

              {roomType && nights > 0 ? (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{selectedType?.type} Room</span>
                      <span className="text-foreground">${basePrice}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nights</span>
                      <span className="text-foreground">{nights}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (12%)</span>
                      <span className="text-foreground">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="text-foreground font-semibold">Total</span>
                      <span className="text-xl font-heading font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select room type and dates to see pricing.</p>
              )}

              <Button onClick={handleSubmit} className="w-full gold-gradient text-primary-foreground font-medium" size="lg">
                Confirm Booking
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
