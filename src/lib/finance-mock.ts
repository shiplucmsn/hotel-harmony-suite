export type Account = {
  id: string;
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  parent?: string;
  balance: number;
  currency: string;
  status: "active" | "archived";
};

export const accounts: Account[] = [
  { id: "a1", code: "1000", name: "Cash on Hand", type: "Asset", balance: 48200, currency: "USD", status: "active" },
  { id: "a2", code: "1010", name: "Bank — Operating", type: "Asset", balance: 312840, currency: "USD", status: "active" },
  { id: "a3", code: "1020", name: "Bank — Savings", type: "Asset", balance: 920000, currency: "USD", status: "active" },
  { id: "a4", code: "1200", name: "Accounts Receivable", type: "Asset", balance: 184500, currency: "USD", status: "active" },
  { id: "a5", code: "1500", name: "Inventory", type: "Asset", balance: 268900, currency: "USD", status: "active" },
  { id: "a6", code: "2000", name: "Accounts Payable", type: "Liability", balance: 142300, currency: "USD", status: "active" },
  { id: "a7", code: "2100", name: "VAT Payable", type: "Liability", balance: 28400, currency: "USD", status: "active" },
  { id: "a8", code: "3000", name: "Owner's Equity", type: "Equity", balance: 1200000, currency: "USD", status: "active" },
  { id: "a9", code: "4000", name: "Sales Revenue", type: "Income", balance: 884500, currency: "USD", status: "active" },
  { id: "a10", code: "4100", name: "Service Income", type: "Income", balance: 312000, currency: "USD", status: "active" },
  { id: "a11", code: "5000", name: "Cost of Goods Sold", type: "Expense", balance: 412800, currency: "USD", status: "active" },
  { id: "a12", code: "6000", name: "Salaries & Wages", type: "Expense", balance: 248600, currency: "USD", status: "active" },
  { id: "a13", code: "6100", name: "Rent Expense", type: "Expense", balance: 62400, currency: "USD", status: "active" },
  { id: "a14", code: "6200", name: "Utilities", type: "Expense", balance: 18200, currency: "USD", status: "active" },
  { id: "a15", code: "6300", name: "Marketing", type: "Expense", balance: 84200, currency: "USD", status: "archived" },
];

export type JournalEntry = {
  id: string;
  number: string;
  date: string;
  reference: string;
  memo: string;
  debit: number;
  credit: number;
  status: "posted" | "draft" | "void";
};

export const journalEntries: JournalEntry[] = [
  { id: "j1", number: "JE-2049", date: "2026-05-08", reference: "INV-1041", memo: "Customer invoice — Globex", debit: 12500, credit: 12500, status: "posted" },
  { id: "j2", number: "JE-2048", date: "2026-05-07", reference: "BILL-882", memo: "Office rent May", debit: 5200, credit: 5200, status: "posted" },
  { id: "j3", number: "JE-2047", date: "2026-05-06", reference: "PAY-552", memo: "Payroll batch", debit: 24800, credit: 24800, status: "posted" },
  { id: "j4", number: "JE-2046", date: "2026-05-05", reference: "EXP-321", memo: "Marketing campaign", debit: 3800, credit: 3800, status: "draft" },
  { id: "j5", number: "JE-2045", date: "2026-05-04", reference: "INV-1040", memo: "Service revenue — Initech", debit: 9400, credit: 9400, status: "posted" },
  { id: "j6", number: "JE-2044", date: "2026-05-03", reference: "ADJ-118", memo: "Depreciation adjustment", debit: 1800, credit: 1800, status: "void" },
];

export type Transaction = {
  id: string;
  date: string;
  description: string;
  account: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
  status: "cleared" | "pending" | "failed";
};

export const transactions: Transaction[] = [
  { id: "t1", date: "2026-05-09", description: "Stripe payout", account: "Bank — Operating", category: "Income", amount: 14820, type: "credit", status: "cleared" },
  { id: "t2", date: "2026-05-09", description: "AWS subscription", account: "Bank — Operating", category: "Software", amount: 1240, type: "debit", status: "cleared" },
  { id: "t3", date: "2026-05-08", description: "Office supplies — Staples", account: "Cash on Hand", category: "Office", amount: 320, type: "debit", status: "pending" },
  { id: "t4", date: "2026-05-07", description: "Customer payment — Globex", account: "Bank — Operating", category: "Income", amount: 12500, type: "credit", status: "cleared" },
  { id: "t5", date: "2026-05-06", description: "Payroll", account: "Bank — Operating", category: "Salaries", amount: 24800, type: "debit", status: "cleared" },
  { id: "t6", date: "2026-05-05", description: "Failed wire — vendor", account: "Bank — Operating", category: "Vendor", amount: 4500, type: "debit", status: "failed" },
  { id: "t7", date: "2026-05-04", description: "Refund issued — order #882", account: "Bank — Operating", category: "Refund", amount: 220, type: "debit", status: "cleared" },
  { id: "t8", date: "2026-05-03", description: "Service invoice — Initech", account: "Accounts Receivable", category: "Income", amount: 9400, type: "credit", status: "cleared" },
];

export type Expense = {
  id: string;
  number: string;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  paidBy: string;
  status: "approved" | "pending" | "rejected" | "reimbursed";
};

export const expenses: Expense[] = [
  { id: "e1", number: "EXP-321", date: "2026-05-08", vendor: "Google Ads", category: "Marketing", amount: 3800, paidBy: "Card · 4242", status: "approved" },
  { id: "e2", number: "EXP-320", date: "2026-05-07", vendor: "WeWork", category: "Rent", amount: 5200, paidBy: "Bank transfer", status: "approved" },
  { id: "e3", number: "EXP-319", date: "2026-05-06", vendor: "Uber", category: "Travel", amount: 142, paidBy: "Reimbursable", status: "pending" },
  { id: "e4", number: "EXP-318", date: "2026-05-05", vendor: "Zoom", category: "Software", amount: 240, paidBy: "Card · 4242", status: "approved" },
  { id: "e5", number: "EXP-317", date: "2026-05-04", vendor: "Lufthansa", category: "Travel", amount: 1820, paidBy: "Reimbursable", status: "reimbursed" },
  { id: "e6", number: "EXP-316", date: "2026-05-03", vendor: "Unknown", category: "Misc", amount: 95, paidBy: "Cash", status: "rejected" },
];

export type Income = {
  id: string;
  number: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  status: "received" | "pending" | "overdue";
};

export const incomes: Income[] = [
  { id: "i1", number: "INC-552", date: "2026-05-08", source: "Globex Corp.", category: "Service", amount: 12500, status: "received" },
  { id: "i2", number: "INC-551", date: "2026-05-06", source: "Initech Labs", category: "Subscription", amount: 9400, status: "received" },
  { id: "i3", number: "INC-550", date: "2026-05-04", source: "Northwind", category: "License", amount: 6200, status: "pending" },
  { id: "i4", number: "INC-549", date: "2026-04-29", source: "Acme Co.", category: "Service", amount: 3400, status: "overdue" },
  { id: "i5", number: "INC-548", date: "2026-04-27", source: "Hooli", category: "Service", amount: 8800, status: "received" },
];

export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  number: string;
  currency: string;
  balance: number;
  type: "Checking" | "Savings" | "Credit";
  status: "active" | "frozen";
};

export const bankAccounts: BankAccount[] = [
  { id: "b1", name: "Operating", bank: "Chase", number: "•••• 4421", currency: "USD", balance: 312840, type: "Checking", status: "active" },
  { id: "b2", name: "Reserves", bank: "Goldman Sachs", number: "•••• 8810", currency: "USD", balance: 920000, type: "Savings", status: "active" },
  { id: "b3", name: "EU Operations", bank: "Deutsche Bank", number: "•••• 3320", currency: "EUR", balance: 184200, type: "Checking", status: "active" },
  { id: "b4", name: "Corporate Card", bank: "Brex", number: "•••• 0099", currency: "USD", balance: -28400, type: "Credit", status: "active" },
  { id: "b5", name: "Legacy", bank: "Wells Fargo", number: "•••• 1102", currency: "USD", balance: 0, type: "Checking", status: "frozen" },
];

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "paid" | "sent" | "overdue" | "draft";
};

export const invoices: Invoice[] = [
  { id: "iv1", number: "INV-1041", customer: "Globex Corp.", issueDate: "2026-05-01", dueDate: "2026-05-15", amount: 12500, status: "paid" },
  { id: "iv2", number: "INV-1040", customer: "Initech Labs", issueDate: "2026-04-28", dueDate: "2026-05-12", amount: 9400, status: "paid" },
  { id: "iv3", number: "INV-1039", customer: "Northwind", issueDate: "2026-04-25", dueDate: "2026-05-09", amount: 6200, status: "sent" },
  { id: "iv4", number: "INV-1038", customer: "Acme Co.", issueDate: "2026-04-15", dueDate: "2026-04-29", amount: 3400, status: "overdue" },
  { id: "iv5", number: "INV-1037", customer: "Hooli", issueDate: "2026-04-12", dueDate: "2026-04-26", amount: 8800, status: "paid" },
  { id: "iv6", number: "INV-1042", customer: "Soylent", issueDate: "2026-05-10", dueDate: "2026-05-24", amount: 4400, status: "draft" },
];

export type Payment = {
  id: string;
  date: string;
  invoice: string;
  customer: string;
  method: "Card" | "Bank" | "Wire" | "Cash" | "Wallet";
  amount: number;
  status: "succeeded" | "refunded" | "failed";
};

export const payments: Payment[] = [
  { id: "p1", date: "2026-05-09", invoice: "INV-1041", customer: "Globex Corp.", method: "Card", amount: 12500, status: "succeeded" },
  { id: "p2", date: "2026-05-08", invoice: "INV-1040", customer: "Initech Labs", method: "Bank", amount: 9400, status: "succeeded" },
  { id: "p3", date: "2026-05-06", invoice: "INV-1037", customer: "Hooli", method: "Wire", amount: 8800, status: "succeeded" },
  { id: "p4", date: "2026-05-05", invoice: "INV-1036", customer: "Pied Piper", method: "Card", amount: 1200, status: "refunded" },
  { id: "p5", date: "2026-05-04", invoice: "INV-1035", customer: "Soylent", method: "Card", amount: 240, status: "failed" },
  { id: "p6", date: "2026-05-02", invoice: "INV-1034", customer: "Vandelay", method: "Wallet", amount: 660, status: "succeeded" },
];

export const taxRates = [
  { id: "tx1", name: "Standard VAT", rate: 20, region: "EU", type: "Sales", status: "active" },
  { id: "tx2", name: "Reduced VAT", rate: 10, region: "EU", type: "Sales", status: "active" },
  { id: "tx3", name: "Zero VAT", rate: 0, region: "EU", type: "Exempt", status: "active" },
  { id: "tx4", name: "US Sales Tax (CA)", rate: 7.25, region: "US-CA", type: "Sales", status: "active" },
  { id: "tx5", name: "US Sales Tax (NY)", rate: 8.875, region: "US-NY", type: "Sales", status: "active" },
  { id: "tx6", name: "GST", rate: 18, region: "IN", type: "Sales", status: "archived" },
];

export const cashFlowSeries = [
  { month: "Jan", inflow: 82000, outflow: 56000 },
  { month: "Feb", inflow: 91000, outflow: 60000 },
  { month: "Mar", inflow: 102000, outflow: 71000 },
  { month: "Apr", inflow: 96000, outflow: 64000 },
  { month: "May", inflow: 118000, outflow: 78000 },
  { month: "Jun", inflow: 124000, outflow: 81000 },
  { month: "Jul", inflow: 132000, outflow: 86000 },
  { month: "Aug", inflow: 145000, outflow: 92000 },
];

export const plSeries = [
  { month: "Jan", revenue: 82000, cogs: 32000, opex: 24000, profit: 26000 },
  { month: "Feb", revenue: 91000, cogs: 36000, opex: 24500, profit: 30500 },
  { month: "Mar", revenue: 102000, cogs: 40000, opex: 27000, profit: 35000 },
  { month: "Apr", revenue: 96000, cogs: 38000, opex: 26000, profit: 32000 },
  { month: "May", revenue: 118000, cogs: 47000, opex: 31000, profit: 40000 },
  { month: "Jun", revenue: 124000, cogs: 49000, opex: 32500, profit: 42500 },
];

export const expenseBreakdown = [
  { name: "Salaries", value: 248600 },
  { name: "Marketing", value: 84200 },
  { name: "Rent", value: 62400 },
  { name: "Software", value: 38400 },
  { name: "Travel", value: 18200 },
  { name: "Other", value: 22100 },
];

export const ledgerEntries = [
  { id: "l1", date: "2026-05-09", account: "Bank — Operating", reference: "JE-2049", description: "Customer payment", debit: 12500, credit: 0, balance: 312840 },
  { id: "l2", date: "2026-05-08", account: "Accounts Receivable", reference: "JE-2049", description: "Invoice cleared", debit: 0, credit: 12500, balance: 172000 },
  { id: "l3", date: "2026-05-07", account: "Rent Expense", reference: "JE-2048", description: "Office rent May", debit: 5200, credit: 0, balance: 62400 },
  { id: "l4", date: "2026-05-07", account: "Bank — Operating", reference: "JE-2048", description: "Rent payment", debit: 0, credit: 5200, balance: 300340 },
  { id: "l5", date: "2026-05-06", account: "Salaries & Wages", reference: "JE-2047", description: "May payroll", debit: 24800, credit: 0, balance: 248600 },
  { id: "l6", date: "2026-05-06", account: "Bank — Operating", reference: "JE-2047", description: "Payroll disbursed", debit: 0, credit: 24800, balance: 305540 },
];
