export type BOM = {
  id: string; code: string; product: string; version: string; items: number;
  cost: number; status: "active" | "draft" | "archived"; updated: string;
};
export type RawMaterial = {
  id: string; sku: string; name: string; uom: string; stock: number;
  reorder: number; cost: number; supplier: string; status: "ok" | "low" | "out";
};
export type WorkOrder = {
  id: string; number: string; product: string; qty: number; planned: string;
  due: string; assignee: string; progress: number;
  status: "draft" | "scheduled" | "in_progress" | "qc" | "done" | "on_hold";
};
export type Machine = {
  id: string; name: string; code: string; line: string; uptime: number;
  oee: number; status: "running" | "idle" | "maintenance" | "down"; lastService: string;
};
export type QualityCheck = {
  id: string; ref: string; product: string; batch: string; inspector: string;
  date: string; defects: number; result: "pass" | "fail" | "rework";
};

export const boms: BOM[] = [
  { id: "b1", code: "BOM-A100", product: "Aurora Pro Laptop 14\"", version: "v3.2", items: 24, cost: 612, status: "active", updated: "2026-05-08" },
  { id: "b2", code: "BOM-N220", product: "Nimbus Phone X", version: "v2.0", items: 18, cost: 348, status: "active", updated: "2026-05-04" },
  { id: "b3", code: "BOM-H009", product: "Cast Iron Skillet 12\"", version: "v1.1", items: 6, cost: 14, status: "draft", updated: "2026-05-01" },
  { id: "b4", code: "BOM-S014", product: "Botanical Serum 30ml", version: "v4.0", items: 12, cost: 8, status: "active", updated: "2026-04-28" },
];

export const bomLines = [
  { component: "Aluminum chassis", qty: 1, uom: "pcs", cost: 80 },
  { component: "OLED display 14\"", qty: 1, uom: "pcs", cost: 220 },
  { component: "RAM 16GB", qty: 2, uom: "pcs", cost: 70 },
  { component: "SSD 512GB", qty: 1, uom: "pcs", cost: 90 },
  { component: "Battery cell", qty: 4, uom: "pcs", cost: 38 },
];

export const rawMaterials: RawMaterial[] = [
  { id: "r1", sku: "RM-ALU-001", name: "Aluminum sheet 2mm", uom: "kg", stock: 1240, reorder: 500, cost: 4.2, supplier: "Helix GmbH", status: "ok" },
  { id: "r2", sku: "RM-OLE-014", name: "OLED display 14\"", uom: "pcs", stock: 38, reorder: 80, cost: 220, supplier: "Pacific Optics", status: "low" },
  { id: "r3", sku: "RM-RAM-016", name: "RAM module 16GB", uom: "pcs", stock: 0, reorder: 100, cost: 70, supplier: "Helix GmbH", status: "out" },
  { id: "r4", sku: "RM-SSD-512", name: "SSD 512GB NVMe", uom: "pcs", stock: 220, reorder: 60, cost: 90, supplier: "Northwind Tech", status: "ok" },
  { id: "r5", sku: "RM-BAT-009", name: "Lithium cell 3500mAh", uom: "pcs", stock: 480, reorder: 300, cost: 9.5, supplier: "Aurora Power", status: "ok" },
  { id: "r6", sku: "RM-PCB-022", name: "Mainboard PCB", uom: "pcs", stock: 64, reorder: 120, cost: 42, supplier: "Helix GmbH", status: "low" },
];

export const workOrders: WorkOrder[] = [
  { id: "w1", number: "WO-2026-0142", product: "Aurora Pro Laptop 14\"", qty: 120, planned: "2026-05-10", due: "2026-05-18", assignee: "Lena Vogt", progress: 65, status: "in_progress" },
  { id: "w2", number: "WO-2026-0141", product: "Nimbus Phone X", qty: 240, planned: "2026-05-08", due: "2026-05-20", assignee: "Tomas Reiner", progress: 20, status: "in_progress" },
  { id: "w3", number: "WO-2026-0140", product: "Botanical Serum 30ml", qty: 800, planned: "2026-05-05", due: "2026-05-12", assignee: "Sophie Martin", progress: 100, status: "qc" },
  { id: "w4", number: "WO-2026-0139", product: "USB-C Hub 8-in-1", qty: 500, planned: "2026-05-12", due: "2026-05-22", assignee: "Erik Lund", progress: 0, status: "scheduled" },
  { id: "w5", number: "WO-2026-0138", product: "Cold Brew Coffee 1L", qty: 1000, planned: "2026-05-02", due: "2026-05-09", assignee: "Mei Tanaka", progress: 100, status: "done" },
  { id: "w6", number: "WO-2026-0137", product: "Wool Cardigan", qty: 80, planned: "2026-05-04", due: "2026-05-15", assignee: "Anna Beck", progress: 40, status: "on_hold" },
];

export const machines: Machine[] = [
  { id: "m1", name: "CNC Mill 01", code: "MC-01", line: "Line A", uptime: 96, oee: 88, status: "running", lastService: "2026-04-22" },
  { id: "m2", name: "Assembly Robot 02", code: "AR-02", line: "Line A", uptime: 91, oee: 82, status: "running", lastService: "2026-04-30" },
  { id: "m3", name: "Injection Mold 01", code: "IM-01", line: "Line B", uptime: 0, oee: 0, status: "maintenance", lastService: "2026-05-09" },
  { id: "m4", name: "Bottling Line 03", code: "BL-03", line: "Line C", uptime: 78, oee: 71, status: "idle", lastService: "2026-04-15" },
  { id: "m5", name: "Packaging Station 02", code: "PS-02", line: "Line C", uptime: 88, oee: 80, status: "running", lastService: "2026-05-01" },
  { id: "m6", name: "Test Rig 01", code: "TR-01", line: "QC", uptime: 0, oee: 0, status: "down", lastService: "2026-03-20" },
];

export const qualityChecks: QualityCheck[] = [
  { id: "q1", ref: "QC-0421", product: "Aurora Pro Laptop 14\"", batch: "B-2026-04A", inspector: "Anna Beck", date: "2026-05-10", defects: 2, result: "pass" },
  { id: "q2", ref: "QC-0420", product: "Nimbus Phone X", batch: "B-2026-04B", inspector: "Liam O'Brien", date: "2026-05-09", defects: 14, result: "rework" },
  { id: "q3", ref: "QC-0419", product: "Botanical Serum 30ml", batch: "B-2026-09", inspector: "Sophie Martin", date: "2026-05-08", defects: 0, result: "pass" },
  { id: "q4", ref: "QC-0418", product: "USB-C Hub 8-in-1", batch: "B-2026-03", inspector: "Mei Tanaka", date: "2026-05-06", defects: 28, result: "fail" },
];

export const wasteRecords = [
  { id: "ws1", ref: "WST-0098", source: "Line A", reason: "Defective", qty: 12, cost: 480, date: "2026-05-09" },
  { id: "ws2", ref: "WST-0097", source: "Line B", reason: "Spillage", qty: 4, cost: 120, date: "2026-05-08" },
  { id: "ws3", ref: "WST-0096", source: "Line C", reason: "Expiry", qty: 22, cost: 220, date: "2026-05-04" },
  { id: "ws4", ref: "WST-0095", source: "QC reject", reason: "Out of spec", qty: 6, cost: 1320, date: "2026-05-02" },
];

export const finishedGoods = [
  { id: "f1", sku: "FG-LP-001", name: "Aurora Pro Laptop 14\"", batch: "B-2026-04A", qty: 78, warehouse: "Main DC", date: "2026-05-10" },
  { id: "f2", sku: "FG-PH-022", name: "Nimbus Phone X", batch: "B-2026-04B", qty: 240, warehouse: "Main DC", date: "2026-05-09" },
  { id: "f3", sku: "FG-SK-014", name: "Botanical Serum 30ml", batch: "B-2026-09", qty: 800, warehouse: "South Hub", date: "2026-05-08" },
  { id: "f4", sku: "FG-BV-077", name: "Cold Brew Coffee 1L", batch: "B-2026-01", qty: 980, warehouse: "South Hub", date: "2026-05-04" },
];

export const productionTrend = [
  { day: "Mon", planned: 240, actual: 220 },
  { day: "Tue", planned: 280, actual: 260 },
  { day: "Wed", planned: 260, actual: 280 },
  { day: "Thu", planned: 300, actual: 290 },
  { day: "Fri", planned: 320, actual: 310 },
  { day: "Sat", planned: 180, actual: 160 },
  { day: "Sun", planned: 80, actual: 60 },
];

export const oeeTrend = [
  { week: "W1", oee: 74 }, { week: "W2", oee: 78 }, { week: "W3", oee: 81 },
  { week: "W4", oee: 79 }, { week: "W5", oee: 83 }, { week: "W6", oee: 85 },
];

export function prodTone(s: string) {
  const map: Record<string, string> = {
    running: "bg-success/15 text-success border-success/30",
    done: "bg-success/15 text-success border-success/30",
    pass: "bg-success/15 text-success border-success/30",
    active: "bg-success/15 text-success border-success/30",
    ok: "bg-success/15 text-success border-success/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    scheduled: "bg-primary/15 text-primary border-primary/30",
    qc: "bg-warning/15 text-warning border-warning/30",
    rework: "bg-warning/15 text-warning border-warning/30",
    low: "bg-warning/15 text-warning border-warning/30",
    idle: "bg-warning/15 text-warning border-warning/30",
    maintenance: "bg-warning/15 text-warning border-warning/30",
    on_hold: "bg-warning/15 text-warning border-warning/30",
    fail: "bg-destructive/15 text-destructive border-destructive/30",
    out: "bg-destructive/15 text-destructive border-destructive/30",
    down: "bg-destructive/15 text-destructive border-destructive/30",
    draft: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted text-muted-foreground border-border",
  };
  return map[s] ?? "bg-muted text-muted-foreground border-border";
}
