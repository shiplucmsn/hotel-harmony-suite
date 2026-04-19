import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent. Our concierge will reply within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Get in Touch</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Contact Us</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">24/7 Concierge</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">hello@royale.com</p>
              <p className="text-sm text-muted-foreground">reservations@royale.com</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">100 Crown Avenue<br />New York, NY 10001</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Reception</h3>
              <p className="text-sm text-muted-foreground">Open 24 hours, every day</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label>Name</Label>
            <Input required placeholder="Jane Doe" className="mt-1.5" />
          </div>
          <div>
            <Label>Email</Label>
            <Input required type="email" placeholder="jane@example.com" className="mt-1.5" />
          </div>
          <div>
            <Label>Subject</Label>
            <Input required placeholder="How can we help?" className="mt-1.5" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required rows={5} placeholder="Tell us more..." className="mt-1.5" />
          </div>
          <Button type="submit" disabled={sending} className="w-full gold-gradient text-primary-foreground">
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
