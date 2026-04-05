import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays, startOfWeek, differenceInDays, isSameDay, isWithinInterval } from "date-fns";

interface Booking {
  id: string;
  roomId: number;
  guest: string;
  checkIn: Date;
  checkOut: Date;
  color: string;
}

const rooms = [
  { id: 101, name: "Room 101", type: "Single", floor: 1 },
  { id: 102, name: "Room 102", type: "Single", floor: 1 },
  { id: 201, name: "Room 201", type: "Deluxe", floor: 2 },
  { id: 202, name: "Room 202", type: "Deluxe", floor: 2 },
  { id: 203, name: "Room 203", type: "Deluxe", floor: 2 },
  { id: 301, name: "Room 301", type: "Deluxe", floor: 3 },
  { id: 401, name: "Room 401", type: "Suite", floor: 4 },
  { id: 501, name: "Room 501", type: "Suite", floor: 5 },
];

const bookingColors = [
  "bg-primary/60", "bg-info/60", "bg-success/60", "bg-warning/60",
];

const initialBookings: Booking[] = [
  { id: "BK-1024", roomId: 401, guest: "James Wilson", checkIn: new Date(2026, 3, 5), checkOut: new Date(2026, 3, 8), color: bookingColors[0] },
  { id: "BK-1025", roomId: 202, guest: "Sarah Chen", checkIn: new Date(2026, 3, 5), checkOut: new Date(2026, 3, 7), color: bookingColors[1] },
  { id: "BK-1026", roomId: 501, guest: "M. Al-Rashid", checkIn: new Date(2026, 3, 6), checkOut: new Date(2026, 3, 10), color: bookingColors[2] },
  { id: "BK-1027", roomId: 102, guest: "Emily Parker", checkIn: new Date(2026, 3, 5), checkOut: new Date(2026, 3, 6), color: bookingColors[3] },
  { id: "BK-1028", roomId: 201, guest: "Raj Patel", checkIn: new Date(2026, 3, 7), checkOut: new Date(2026, 3, 9), color: bookingColors[0] },
  { id: "BK-1029", roomId: 301, guest: "Lisa Taylor", checkIn: new Date(2026, 3, 8), checkOut: new Date(2026, 3, 12), color: bookingColors[1] },
];

const DAYS_VISIBLE = 14;
const COL_WIDTH = 80;

export default function Calendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(2026, 3, 5), { weekStartsOn: 1 }));
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [dragState, setDragState] = useState<{ roomId: number; startDay: number; endDay: number } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newGuest, setNewGuest] = useState("");
  const isDragging = useRef(false);

  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(weekStart, i));

  const prev = () => setWeekStart((d) => addDays(d, -7));
  const next = () => setWeekStart((d) => addDays(d, 7));

  const getBookingsForRoom = (roomId: number) =>
    bookings.filter((b) => b.roomId === roomId);

  const handleMouseDown = useCallback((roomId: number, dayIndex: number) => {
    isDragging.current = true;
    setDragState({ roomId, startDay: dayIndex, endDay: dayIndex });
  }, []);

  const handleMouseEnter = useCallback((dayIndex: number) => {
    if (isDragging.current && dragState) {
      setDragState((prev) => prev ? { ...prev, endDay: dayIndex } : null);
    }
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current && dragState) {
      isDragging.current = false;
      setShowDialog(true);
    }
  }, [dragState]);

  const confirmBooking = () => {
    if (!dragState || !newGuest.trim()) return;
    const start = Math.min(dragState.startDay, dragState.endDay);
    const end = Math.max(dragState.startDay, dragState.endDay);
    const newBooking: Booking = {
      id: `BK-${1032 + bookings.length}`,
      roomId: dragState.roomId,
      guest: newGuest,
      checkIn: days[start],
      checkOut: addDays(days[end], 1),
      color: bookingColors[bookings.length % bookingColors.length],
    };
    setBookings((prev) => [...prev, newBooking]);
    setDragState(null);
    setNewGuest("");
    setShowDialog(false);
  };

  const cancelDrag = () => {
    setDragState(null);
    setNewGuest("");
    setShowDialog(false);
  };

  return (
    <DashboardLayout title="Availability Calendar" subtitle="Drag across cells to create bookings">
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prev} className="border-border">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {format(weekStart, "MMM d")} — {format(addDays(weekStart, DAYS_VISIBLE - 1), "MMM d, yyyy")}
            </h3>
            <Button variant="outline" size="icon" onClick={next} className="border-border">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {bookingColors.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${c}`} />
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-1">= Booked</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl overflow-hidden"
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { isDragging.current = false; }}
        >
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${160 + DAYS_VISIBLE * COL_WIDTH}px` }}>
              {/* Header */}
              <div className="flex border-b border-border bg-secondary/50 sticky top-0 z-10">
                <div className="w-40 flex-shrink-0 px-4 py-3 text-sm font-medium text-muted-foreground border-r border-border">
                  Room
                </div>
                {days.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={i}
                      className={`flex-shrink-0 px-1 py-2 text-center border-r border-border/50 ${isToday ? "bg-primary/10" : ""}`}
                      style={{ width: COL_WIDTH }}
                    >
                      <p className="text-[10px] text-muted-foreground">{format(day, "EEE")}</p>
                      <p className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              {rooms.map((room) => {
                const roomBookings = getBookingsForRoom(room.id);
                return (
                  <div key={room.id} className="flex border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <div className="w-40 flex-shrink-0 px-4 py-3 border-r border-border">
                      <p className="text-sm font-medium text-foreground">{room.name}</p>
                      <p className="text-[10px] text-muted-foreground">{room.type}</p>
                    </div>
                    {days.map((day, dayIdx) => {
                      const booking = roomBookings.find((b) =>
                        isWithinInterval(day, { start: b.checkIn, end: addDays(b.checkOut, -1) })
                      );
                      const isStart = booking && isSameDay(day, booking.checkIn);
                      const isEnd = booking && isSameDay(day, addDays(booking.checkOut, -1));
                      const isDragCell = dragState && dragState.roomId === room.id &&
                        dayIdx >= Math.min(dragState.startDay, dragState.endDay) &&
                        dayIdx <= Math.max(dragState.startDay, dragState.endDay);

                      return (
                        <div
                          key={dayIdx}
                          className={`flex-shrink-0 border-r border-border/30 relative cursor-crosshair select-none ${
                            isDragCell ? "bg-primary/30" : ""
                          }`}
                          style={{ width: COL_WIDTH, height: 48 }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!booking) handleMouseDown(room.id, dayIdx);
                          }}
                          onMouseEnter={() => handleMouseEnter(dayIdx)}
                        >
                          {booking && (
                            <div
                              className={`absolute top-1 bottom-1 ${booking.color} flex items-center overflow-hidden ${
                                isStart ? "left-1 rounded-l-md" : "left-0"
                              } ${isEnd ? "right-1 rounded-r-md" : "right-0"}`}
                              title={`${booking.guest} (${booking.id})`}
                            >
                              {isStart && (
                                <span className="text-[10px] font-medium text-foreground px-1.5 truncate">
                                  {booking.guest}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* New Booking Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) cancelDrag(); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">New Booking</DialogTitle>
          </DialogHeader>
          {dragState && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Room</Label>
                <p className="text-foreground font-medium">{rooms.find((r) => r.id === dragState.roomId)?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Check-in</Label>
                  <p className="text-foreground font-medium">{format(days[Math.min(dragState.startDay, dragState.endDay)], "MMM d, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-out</Label>
                  <p className="text-foreground font-medium">{format(addDays(days[Math.max(dragState.startDay, dragState.endDay)], 1), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="guest-name" className="text-muted-foreground">Guest Name</Label>
                <Input
                  id="guest-name"
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  placeholder="Enter guest name"
                  className="bg-secondary border-border mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={cancelDrag} className="border-border">Cancel</Button>
            <Button onClick={confirmBooking} className="gold-gradient text-primary-foreground" disabled={!newGuest.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
