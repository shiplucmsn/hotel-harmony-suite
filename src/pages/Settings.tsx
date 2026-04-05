import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Building2, CreditCard, Bell, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [hotelName, setHotelName] = useState("Royale Hotel & Spa");
  const [address, setAddress] = useState("123 Grand Boulevard, Dubai, UAE");
  const [phone, setPhone] = useState("+971 4 123 4567");
  const [email, setEmail] = useState("info@royalehotel.com");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [taxRate, setTaxRate] = useState("12");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [bookingAlert, setBookingAlert] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [maintenanceAlert, setMaintenanceAlert] = useState(false);

  const save = () => toast({ title: "Settings Saved", description: "Your changes have been saved successfully." });

  return (
    <DashboardLayout title="Settings" subtitle="Configure your hotel system">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="hotel" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="hotel" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Building2 className="h-4 w-4 mr-2" /> Hotel
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <CreditCard className="h-4 w-4 mr-2" /> Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Shield className="h-4 w-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="localization" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Globe className="h-4 w-4 mr-2" /> Localization
            </TabsTrigger>
          </TabsList>

          {/* Hotel Profile */}
          <TabsContent value="hotel">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Hotel Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Hotel Name</Label>
                  <Input value={hotelName} onChange={(e) => setHotelName(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-in Time</Label>
                  <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-out Time</Label>
                  <Input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
              </div>
              <Button onClick={save} className="gold-gradient text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Billing & Tax</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tax Rate (%)</Label>
                  <Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Payment Methods</h4>
                {["Credit/Debit Card", "Cash", "Mobile Banking", "Bank Transfer"].map((m) => (
                  <div key={m} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-foreground">{m}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
              <Button onClick={save} className="gold-gradient text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive alerts via email", value: emailNotif, set: setEmailNotif },
                  { label: "SMS Notifications", desc: "Receive alerts via SMS", value: smsNotif, set: setSmsNotif },
                  { label: "New Booking Alerts", desc: "Get notified for new bookings", value: bookingAlert, set: setBookingAlert },
                  { label: "Payment Alerts", desc: "Get notified for payments", value: paymentAlert, set: setPaymentAlert },
                  { label: "Maintenance Alerts", desc: "Get notified for maintenance requests", value: maintenanceAlert, set: setMaintenanceAlert },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
              <Button onClick={save} className="gold-gradient text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Security Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Two-Factor Authentication", desc: "Add an extra layer of security" },
                  { label: "Session Timeout (30 min)", desc: "Auto logout after inactivity" },
                  { label: "Audit Logging", desc: "Track all system actions" },
                  { label: "Daily Backups", desc: "Automatic daily data backup" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
              <Button onClick={save} className="gold-gradient text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          {/* Localization */}
          <TabsContent value="localization">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Localization</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={save} className="gold-gradient text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
