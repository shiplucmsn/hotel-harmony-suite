export function pmTone(s: string) {
  const map: Record<string, string> = {
    active: "bg-primary/15 text-primary border-primary/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    completed: "bg-success/15 text-success border-success/30",
    done: "bg-success/15 text-success border-success/30",
    review: "bg-warning/15 text-warning border-warning/30",
    on_hold: "bg-warning/15 text-warning border-warning/30",
    at_risk: "bg-destructive/15 text-destructive border-destructive/30",
    urgent: "bg-destructive/15 text-destructive border-destructive/30",
    high: "bg-warning/15 text-warning border-warning/30",
    med: "bg-primary/15 text-primary border-primary/30",
    low: "bg-muted text-muted-foreground border-border",
    todo: "bg-muted text-muted-foreground border-border",
    planning: "bg-muted text-muted-foreground border-border",
  };
  return map[s] ?? "bg-muted text-muted-foreground border-border";
}
