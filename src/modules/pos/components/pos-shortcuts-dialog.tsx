import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POS_SHORTCUTS } from "@/modules/pos/utils";

type PosShortcutsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PosShortcutsDialog({ open, onOpenChange }: PosShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {POS_SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-4">
              <kbd className="rounded border bg-muted px-2 py-1 font-mono text-xs">{s.keys}</kbd>
              <span className="text-muted-foreground">{s.action}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
