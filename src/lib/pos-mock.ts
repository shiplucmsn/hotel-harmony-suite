export type PosProduct = { id: string; sku: string; name: string; price: number; category: string; image: string; stock: number };

export const posCategories = ["All", "Drinks", "Food", "Bakery", "Snacks", "Retail"];

export const posProducts: PosProduct[] = [
  { id: "pp1", sku: "DR-001", name: "Espresso", price: 3.2, category: "Drinks", image: "☕", stock: 99 },
  { id: "pp2", sku: "DR-002", name: "Cappuccino", price: 4.5, category: "Drinks", image: "☕", stock: 99 },
  { id: "pp3", sku: "DR-003", name: "Iced Latte", price: 5.0, category: "Drinks", image: "🧋", stock: 99 },
  { id: "pp4", sku: "DR-004", name: "Green Tea", price: 3.5, category: "Drinks", image: "🍵", stock: 99 },
  { id: "pp5", sku: "FD-101", name: "Avocado Toast", price: 8.5, category: "Food", image: "🥑", stock: 24 },
  { id: "pp6", sku: "FD-102", name: "Caesar Salad", price: 11.0, category: "Food", image: "🥗", stock: 18 },
  { id: "pp7", sku: "FD-103", name: "Margherita Pizza", price: 13.5, category: "Food", image: "🍕", stock: 12 },
  { id: "pp8", sku: "FD-104", name: "Beef Burger", price: 12.0, category: "Food", image: "🍔", stock: 16 },
  { id: "pp9", sku: "BK-201", name: "Croissant", price: 3.0, category: "Bakery", image: "🥐", stock: 30 },
  { id: "pp10", sku: "BK-202", name: "Blueberry Muffin", price: 3.5, category: "Bakery", image: "🧁", stock: 22 },
  { id: "pp11", sku: "SN-301", name: "Chips", price: 2.0, category: "Snacks", image: "🥨", stock: 50 },
  { id: "pp12", sku: "SN-302", name: "Chocolate Bar", price: 2.5, category: "Snacks", image: "🍫", stock: 80 },
  { id: "pp13", sku: "RT-401", name: "Tote Bag", price: 18.0, category: "Retail", image: "👜", stock: 14 },
  { id: "pp14", sku: "RT-402", name: "Mug", price: 9.0, category: "Retail", image: "🍶", stock: 28 },
];

export const recentReceipts = [
  { id: "r1", ref: "POS-2026-00921", cashier: "Mia C.", time: "12:42", items: 4, total: 28.5, payment: "Card" },
  { id: "r2", ref: "POS-2026-00920", cashier: "Mia C.", time: "12:31", items: 2, total: 7.0, payment: "Cash" },
  { id: "r3", ref: "POS-2026-00919", cashier: "Jake P.", time: "12:24", items: 6, total: 41.2, payment: "Card" },
  { id: "r4", ref: "POS-2026-00918", cashier: "Mia C.", time: "12:11", items: 1, total: 5.0, payment: "Wallet" },
];

export const refunds = [
  { id: "rf1", ref: "RFD-0142", original: "POS-2026-00910", reason: "Wrong item", amount: 12.0, date: "2026-05-10", status: "approved" },
  { id: "rf2", ref: "RFD-0141", original: "POS-2026-00903", reason: "Customer changed mind", amount: 5.5, date: "2026-05-09", status: "pending" },
  { id: "rf3", ref: "RFD-0140", original: "POS-2026-00891", reason: "Defective product", amount: 18.0, date: "2026-05-08", status: "approved" },
  { id: "rf4", ref: "RFD-0139", original: "POS-2026-00880", reason: "Duplicate charge", amount: 28.5, date: "2026-05-07", status: "rejected" },
];
