import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScanLine, KeyRound, Camera, Check, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const arrivals = [
  { ref: "BK-2401", guest: "James Wilson", room: "Suite 401", eta: "14:00", status: "Pending" },
  { ref: "BK-2402", guest: "Emily Parker", room: "Single 105", eta: "15:30", status: "Pending" },
  { ref: "BK-2403", guest: "Sarah Chen", room: "Deluxe 302", eta: "16:00", status: "Pending" },
];
const departures = [
  { ref: "BK-2390", guest: "Anna Kowalski", room: "Deluxe 205", out: "11:00", status: "Awaiting" },
  { ref: "BK-2391", guest: "Carlos Mendez", room: "Single 110", out: "12:00", status: "Awaiting" },
];

export default function CheckInOut() {
  const [scanning, setScanning] = useState(false);
  const [keyAssigned, setKeyAssigned] = useState(false);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success("ID scanned: Passport detected. Auto-filled fields.");
    }, 1500);
  };

  const assignKey = () => {
    setKeyAssigned(true);
    toast.success("Key card #4892 assigned to Suite 401");
  };

  const completeCheckin = () => {
    toast.success("Check-in complete. Welcome, James!");
    setKeyAssigned(false);
  };

  return (
    <DashboardLayout title="Check-in / Check-out" subtitle="Front desk operations">
      <Tabs defaultValue="checkin">
        <TabsList>
          <TabsTrigger value="checkin"><LogIn className="mr-2 h-4 w-4" /> Check-in</TabsTrigger>
          <TabsTrigger value="checkout"><LogOut className="mr-2 h-4 w-4" /> Check-out</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5">
            <h3 className="font-heading text-lg font-semibold mb-4">Today's Arrivals</h3>
            <div className="space-y-2">
              {arrivals.map((a) => (
                <div key={a.ref} className="p-3 rounded-lg border border-border hover:border-primary/40 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{a.guest}</p>
                      <p className="text-xs text-muted-foreground">{a.room} · ETA {a.eta}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{a.ref}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="font-heading text-xl font-semibold mb-1">Digital Registration</h3>
              <p className="text-xs text-muted-foreground">Selected: <span className="text-foreground font-semibold">James Wilson — Suite 401</span></p>
            </div>

            {/* ID Scan */}
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center bg-secondary/20">
              {scanning ? (
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                  <ScanLine className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="text-sm">Scanning ID document...</p>
                </motion.div>
              ) : (
                <>
                  <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Place ID / Passport on scanner</p>
                  <Button onClick={scan} variant="outline"><ScanLine className="mr-2 h-4 w-4" /> Scan ID</Button>
                </>
              )}
            </div>

            {/* Form */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input className="mt-1.5" defaultValue="James Wilson" /></div>
              <div><Label>ID Number</Label><Input className="mt-1.5" defaultValue="P8472913" /></div>
              <div><Label>Nationality</Label><Input className="mt-1.5" defaultValue="United States" /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" defaultValue="+1 555 0192" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input className="mt-1.5" defaultValue="221B Baker St, NYC" /></div>
              <div><Label>Vehicle Plate (opt.)</Label><Input className="mt-1.5" placeholder="—" /></div>
              <div><Label>Purpose of Visit</Label><Input className="mt-1.5" defaultValue="Leisure" /></div>
            </div>

            {/* Key card */}
            <div className="rounded-lg border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${keyAssigned ? "gold-gradient" : "bg-secondary"}`}>
                  <KeyRound className={`h-5 w-5 ${keyAssigned ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Key Card</p>
                  <p className="text-xs text-muted-foreground">{keyAssigned ? "Card #4892 — Suite 401" : "Not yet assigned"}</p>
                </div>
              </div>
              {keyAssigned ? <Check className="h-5 w-5 text-success" /> : <Button onClick={assignKey} variant="outline" size="sm">Assign Key</Button>}
            </div>

            <Button onClick={completeCheckin} disabled={!keyAssigned} className="w-full gold-gradient text-primary-foreground" size="lg">
              Complete Check-in
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="checkout">
          <Card className="p-6">
            <h3 className="font-heading text-xl font-semibold mb-4">Departures Today</h3>
            <div className="space-y-3">
              {departures.map((d) => (
                <div key={d.ref} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">{d.guest}</p>
                    <p className="text-xs text-muted-foreground">{d.room} · Check-out by {d.out} · {d.ref}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success(`Folio printed for ${d.guest}`)}>View Folio</Button>
                    <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => toast.success(`${d.guest} expressly checked out`)}>
                      Express Checkout
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
