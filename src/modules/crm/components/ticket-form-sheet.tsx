import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchableSelect } from "@/shared/components/forms/searchable-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateTicket, useCrmCustomers } from "@/hooks/crm/use-crm";
import { customerSelectOptions } from "@/modules/crm/utils/select-options";
import type { CrmTicketPriority } from "@/modules/crm/types";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

type TicketFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticketId: number) => void;
};

export function TicketFormSheet({ open, onOpenChange, onCreated }: TicketFormSheetProps) {
  const createTicket = useCreateTicket();
  const { data: customersData } = useCrmCustomers({ per_page: 200 });
  const customers = customersData?.data ?? [];

  const [customerId, setCustomerId] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<CrmTicketPriority>("medium");
  const [authorName, setAuthorName] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setCustomerId("");
      setSubject("");
      setPriority("medium");
      setAuthorName("");
      setInitialMessage("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !subject.trim() || !initialMessage.trim()) return;

    const res = await createTicket.mutateAsync({
      customer_id: Number(customerId),
      subject: subject.trim(),
      priority,
      initial_message: initialMessage.trim(),
      initial_author_type: "customer",
      initial_author_name: authorName.trim() || undefined,
    });

    onCreated?.(res.id);
    onOpenChange(false);
  };

  const valid = Boolean(customerId && subject.trim() && initialMessage.trim());
  const loading = createTicket.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New support ticket</SheetTitle>
          <SheetDescription>
            Log a customer request on their behalf. They will not need to sign in.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <SearchableSelect
              value={customerId}
              onValueChange={setCustomerId}
              options={customerSelectOptions(customers)}
              placeholder="Select customer"
              searchPlaceholder="Search customers…"
            />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief issue summary" />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <SearchableSelect
              value={priority}
              onValueChange={(v) => setPriority(v as CrmTicketPriority)}
              options={priorityOptions}
              placeholder="Priority"
            />
          </div>
          <div className="space-y-2">
            <Label>Customer name (for first message)</Label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. contact who called or emailed"
            />
          </div>
          <div className="space-y-2">
            <Label>What did the customer say?</Label>
            <Textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Paste or type the customer's message…"
              rows={5}
            />
          </div>
          <SheetFooter className="mt-auto gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              {loading ? "Creating…" : "Create ticket"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
