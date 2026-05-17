import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JournalStatusBadge } from "@/modules/finance/components/journal-status-badge";
import { formatMoney, journalLineTotals } from "@/modules/finance/utils";
import type { JournalEntryDto } from "@/modules/finance/types";

type JournalDetailSheetProps = {
  entry: JournalEntryDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JournalDetailSheet({ entry, open, onOpenChange }: JournalDetailSheetProps) {
  if (!entry) return null;

  const totals = journalLineTotals(entry.lines ?? []);
  const ref = [entry.reference_type, entry.reference_id].filter(Boolean).join(" / ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono">{entry.entry_number}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <JournalStatusBadge status={entry.status} />
            <span className="text-muted-foreground">{entry.entry_date}</span>
          </div>
          {ref ? <p><span className="text-muted-foreground">Reference:</span> {ref}</p> : null}
          {entry.memo ? <p>{entry.memo}</p> : null}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(entry.lines ?? []).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-mono text-xs">{line.account_code}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.debit > 0 ? formatMoney(line.debit) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.credit > 0 ? formatMoney(line.credit) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-4 tabular-nums">
            <span>Debit: {formatMoney(totals.debit)}</span>
            <span>Credit: {formatMoney(totals.credit)}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
