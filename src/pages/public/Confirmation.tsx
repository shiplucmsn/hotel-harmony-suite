import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Confirmation() {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "RYL-XXXXXX";
  const total = parseFloat(params.get("total") ?? "0");
  const { format } = useCurrency();

  return (
    <div className="container py-20 max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 rounded-full gold-gradient mx-auto flex items-center justify-center mb-6"
      >
        <Check className="h-10 w-10 text-primary-foreground" />
      </motion.div>
      <h1 className="font-heading text-4xl font-bold mb-3">Reservation confirmed</h1>
      <p className="text-muted-foreground mb-8">Thank you. A confirmation email is on its way.</p>

      <div className="glass-card rounded-xl p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between"><span className="text-muted-foreground">Booking reference</span><span className="font-mono font-semibold">{ref}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Amount charged</span><span className="font-semibold gold-text">{format(total)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-success">Paid</span></div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline"><Link to="/"><Mail className="mr-2 h-4 w-4" /> Back to home</Link></Button>
        <Button asChild className="gold-gradient text-primary-foreground"><Link to="/rooms-public"><Calendar className="mr-2 h-4 w-4" /> Book again</Link></Button>
      </div>
    </div>
  );
}
