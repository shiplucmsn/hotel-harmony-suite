export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export function purchaseStatusTone(status: string): string {
  switch (status) {
    case "active":
    case "received":
    case "posted":
    case "paid":
      return "bg-success/15 text-success border-success/30";
    case "pending":
    case "sent":
      return "bg-info/15 text-info border-info/30";
    case "draft":
      return "bg-muted text-muted-foreground";
    case "cancelled":
    case "inactive":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-warning/15 text-warning border-warning/30";
  }
}

export function supplierInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
