export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  cost: number;
  stock: number;
  reorder: number;
  warehouse: string;
  barcode: string;
  status: "active" | "draft" | "archived";
  image: string;
  batch?: string;
  expiry?: string;
};

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  status: "active" | "maintenance";
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  balance: number;
  status: "active" | "inactive";
  rating: number;
};

export type PurchaseOrder = {
  id: string;
  number: string;
  supplier: string;
  date: string;
  expected: string;
  total: number;
  items: number;
  status: "draft" | "sent" | "received" | "partial" | "cancelled";
};

export const categories = [
  { id: "c1", name: "Electronics", subs: ["Laptops", "Phones", "Accessories"], count: 124 },
  { id: "c2", name: "Apparel", subs: ["Men", "Women", "Kids"], count: 88 },
  { id: "c3", name: "Home & Kitchen", subs: ["Cookware", "Furniture", "Decor"], count: 56 },
  { id: "c4", name: "Health & Beauty", subs: ["Skincare", "Supplements"], count: 42 },
  { id: "c5", name: "Food & Beverage", subs: ["Snacks", "Beverages"], count: 31 },
];

export const products: Product[] = [
  { id: "p1", sku: "ELEC-LP-001", name: "Aurora Pro Laptop 14\"", category: "Electronics", subcategory: "Laptops", price: 1499, cost: 980, stock: 42, reorder: 10, warehouse: "Main DC", barcode: "8901234567890", status: "active", image: "💻", batch: "B-2025-04", expiry: "2027-12-01" },
  { id: "p2", sku: "ELEC-PH-022", name: "Nimbus Phone X", category: "Electronics", subcategory: "Phones", price: 899, cost: 540, stock: 8, reorder: 15, warehouse: "Main DC", barcode: "8901234567891", status: "active", image: "📱" },
  { id: "p3", sku: "APP-MN-101", name: "Linen Shirt - Slate", category: "Apparel", subcategory: "Men", price: 79, cost: 28, stock: 215, reorder: 50, warehouse: "South Hub", barcode: "8901234567892", status: "active", image: "👔" },
  { id: "p4", sku: "HK-CK-009", name: "Cast Iron Skillet 12\"", category: "Home & Kitchen", subcategory: "Cookware", price: 65, cost: 22, stock: 0, reorder: 20, warehouse: "East Depot", barcode: "8901234567893", status: "active", image: "🍳" },
  { id: "p5", sku: "HB-SK-014", name: "Botanical Serum 30ml", category: "Health & Beauty", subcategory: "Skincare", price: 49, cost: 14, stock: 134, reorder: 30, warehouse: "Main DC", barcode: "8901234567894", status: "active", image: "💧", batch: "B-2025-09", expiry: "2026-06-15" },
  { id: "p6", sku: "FB-BV-077", name: "Cold Brew Coffee 1L", category: "Food & Beverage", subcategory: "Beverages", price: 12, cost: 4, stock: 22, reorder: 40, warehouse: "South Hub", barcode: "8901234567895", status: "active", image: "☕", batch: "B-2026-01", expiry: "2026-05-20" },
  { id: "p7", sku: "ELEC-AC-030", name: "USB-C Hub 8-in-1", category: "Electronics", subcategory: "Accessories", price: 59, cost: 18, stock: 96, reorder: 25, warehouse: "Main DC", barcode: "8901234567896", status: "active", image: "🔌" },
  { id: "p8", sku: "APP-WM-204", name: "Wool Cardigan", category: "Apparel", subcategory: "Women", price: 119, cost: 42, stock: 6, reorder: 20, warehouse: "East Depot", barcode: "8901234567897", status: "draft", image: "🧥" },
];

export const warehouses: Warehouse[] = [
  { id: "w1", name: "Main DC", code: "WH-MAIN", location: "Berlin, DE", manager: "Lena Vogt", capacity: 10000, used: 7240, status: "active" },
  { id: "w2", name: "South Hub", code: "WH-SOUTH", location: "Munich, DE", manager: "Tomas Reiner", capacity: 6000, used: 3120, status: "active" },
  { id: "w3", name: "East Depot", code: "WH-EAST", location: "Warsaw, PL", manager: "Kasia Nowak", capacity: 4500, used: 4100, status: "active" },
  { id: "w4", name: "North Annex", code: "WH-NORTH", location: "Hamburg, DE", manager: "Erik Lund", capacity: 3000, used: 980, status: "maintenance" },
];

export const transfers = [
  { id: "t1", number: "TR-2026-0042", from: "Main DC", to: "South Hub", items: 12, qty: 340, date: "2026-05-08", status: "in_transit" },
  { id: "t2", number: "TR-2026-0041", from: "East Depot", to: "Main DC", items: 5, qty: 80, date: "2026-05-06", status: "completed" },
  { id: "t3", number: "TR-2026-0040", from: "Main DC", to: "North Annex", items: 9, qty: 220, date: "2026-05-04", status: "draft" },
  { id: "t4", number: "TR-2026-0039", from: "South Hub", to: "East Depot", items: 18, qty: 510, date: "2026-05-02", status: "completed" },
];

export const adjustments = [
  { id: "a1", number: "ADJ-0301", warehouse: "Main DC", reason: "Damage", qty: -12, by: "Lena V.", date: "2026-05-10", status: "approved" },
  { id: "a2", number: "ADJ-0300", warehouse: "South Hub", reason: "Stock count", qty: 6, by: "Tomas R.", date: "2026-05-09", status: "approved" },
  { id: "a3", number: "ADJ-0299", warehouse: "East Depot", reason: "Theft", qty: -3, by: "Kasia N.", date: "2026-05-08", status: "pending" },
];

export const suppliers: Supplier[] = [
  { id: "s1", name: "Helix Components GmbH", contact: "Anna Beck", email: "anna@helix.de", phone: "+49 30 1234567", country: "Germany", balance: 12450, status: "active", rating: 4.8 },
  { id: "s2", name: "Northwind Textiles", contact: "Liam O'Brien", email: "liam@northwind.ie", phone: "+353 1 555 8800", country: "Ireland", balance: 0, status: "active", rating: 4.5 },
  { id: "s3", name: "Pacific Foods Co.", contact: "Mei Tanaka", email: "mei@pacificfoods.jp", phone: "+81 3 4567 8900", country: "Japan", balance: 3200, status: "active", rating: 4.2 },
  { id: "s4", name: "Aurora Cosmetics", contact: "Sophie Martin", email: "sophie@aurora.fr", phone: "+33 1 4400 1234", country: "France", balance: 7800, status: "inactive", rating: 4.0 },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po1", number: "PO-2026-0098", supplier: "Helix Components GmbH", date: "2026-05-09", expected: "2026-05-18", total: 18420, items: 14, status: "sent" },
  { id: "po2", number: "PO-2026-0097", supplier: "Northwind Textiles", date: "2026-05-07", expected: "2026-05-15", total: 6240, items: 8, status: "received" },
  { id: "po3", number: "PO-2026-0096", supplier: "Pacific Foods Co.", date: "2026-05-05", expected: "2026-05-14", total: 3120, items: 22, status: "partial" },
  { id: "po4", number: "PO-2026-0095", supplier: "Aurora Cosmetics", date: "2026-05-03", expected: "2026-05-12", total: 9800, items: 18, status: "draft" },
  { id: "po5", number: "PO-2026-0094", supplier: "Helix Components GmbH", date: "2026-04-29", expected: "2026-05-08", total: 14200, items: 11, status: "received" },
];

export const grns = [
  { id: "g1", number: "GRN-0042", po: "PO-2026-0097", supplier: "Northwind Textiles", items: 8, received: 8, date: "2026-05-12", status: "completed" },
  { id: "g2", number: "GRN-0041", po: "PO-2026-0096", supplier: "Pacific Foods Co.", items: 22, received: 14, date: "2026-05-10", status: "partial" },
  { id: "g3", number: "GRN-0040", po: "PO-2026-0094", supplier: "Helix Components GmbH", items: 11, received: 11, date: "2026-05-04", status: "completed" },
];

export const purchaseReturns = [
  { id: "pr1", number: "RTN-0019", supplier: "Pacific Foods Co.", reason: "Damaged on arrival", qty: 4, amount: 320, date: "2026-05-09", status: "approved" },
  { id: "pr2", number: "RTN-0018", supplier: "Helix Components GmbH", reason: "Wrong specs", qty: 2, amount: 480, date: "2026-05-05", status: "pending" },
];

export const vendorPayments = [
  { id: "vp1", ref: "PAY-0211", supplier: "Helix Components GmbH", method: "Bank transfer", amount: 12450, date: "2026-05-08", status: "completed" },
  { id: "vp2", ref: "PAY-0210", supplier: "Pacific Foods Co.", method: "Card", amount: 3200, date: "2026-05-06", status: "completed" },
  { id: "vp3", ref: "PAY-0209", supplier: "Aurora Cosmetics", method: "Bank transfer", amount: 7800, date: "2026-05-02", status: "scheduled" },
];

export const supplierLedger = [
  { date: "2026-04-22", ref: "PO-2026-0094", desc: "Purchase order issued", debit: 14200, credit: 0, balance: 14200 },
  { date: "2026-04-29", ref: "GRN-0040", desc: "Goods received", debit: 0, credit: 0, balance: 14200 },
  { date: "2026-05-02", ref: "PAY-0211", desc: "Payment - Bank transfer", debit: 0, credit: 12450, balance: 1750 },
  { date: "2026-05-09", ref: "PO-2026-0098", desc: "New purchase order", debit: 18420, credit: 0, balance: 20170 },
];

export const stockTrend = [
  { month: "Dec", inbound: 1240, outbound: 980 },
  { month: "Jan", inbound: 1480, outbound: 1100 },
  { month: "Feb", inbound: 1320, outbound: 1280 },
  { month: "Mar", inbound: 1620, outbound: 1410 },
  { month: "Apr", inbound: 1820, outbound: 1640 },
  { month: "May", inbound: 1960, outbound: 1720 },
];

export const purchaseTrend = [
  { month: "Dec", spend: 42000, orders: 14 },
  { month: "Jan", spend: 51200, orders: 18 },
  { month: "Feb", spend: 48700, orders: 16 },
  { month: "Mar", spend: 62100, orders: 21 },
  { month: "Apr", spend: 58400, orders: 19 },
  { month: "May", spend: 71800, orders: 24 },
];

export function statusTone(s: string) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    completed: "bg-success/15 text-success border-success/30",
    received: "bg-success/15 text-success border-success/30",
    approved: "bg-success/15 text-success border-success/30",
    sent: "bg-primary/15 text-primary border-primary/30",
    in_transit: "bg-primary/15 text-primary border-primary/30",
    partial: "bg-warning/15 text-warning border-warning/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    scheduled: "bg-warning/15 text-warning border-warning/30",
    maintenance: "bg-warning/15 text-warning border-warning/30",
    draft: "bg-muted text-muted-foreground border-border",
    inactive: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[s] ?? "bg-muted text-muted-foreground border-border";
}
