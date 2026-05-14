export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: "Website" | "Referral" | "Cold Call" | "Event" | "Social";
  status: "new" | "contacted" | "qualified" | "lost";
  value: number;
  owner: string;
  createdAt: string;
};

export const leads: Lead[] = [
  { id: "L-001", name: "Emma Stone", company: "Northwind Co", email: "emma@northwind.io", phone: "+1 415 555 0101", source: "Website", status: "new", value: 12400, owner: "Alicia Romero", createdAt: "2 hr ago" },
  { id: "L-002", name: "Raj Patel", company: "Initech Labs", email: "raj@initech.io", phone: "+44 20 7946 1122", source: "Referral", status: "qualified", value: 28900, owner: "Marcus Chen", createdAt: "1 day ago" },
  { id: "L-003", name: "Sara Müller", company: "Globex Corp", email: "sara@globex.io", phone: "+49 30 1234 5678", source: "Event", status: "contacted", value: 8400, owner: "Sofia Bianchi", createdAt: "3 days ago" },
  { id: "L-004", name: "Yuki Tanaka", company: "Hooli", email: "yuki@hooli.com", phone: "+81 3 1234 5678", source: "Cold Call", status: "lost", value: 5200, owner: "Diego Alvarez", createdAt: "5 days ago" },
  { id: "L-005", name: "Liam Carter", company: "Pied Piper", email: "liam@pp.io", phone: "+1 650 555 0192", source: "Social", status: "new", value: 18600, owner: "Marcus Chen", createdAt: "6 days ago" },
  { id: "L-006", name: "Anna Kowalski", company: "Stark Inc", email: "anna@stark.io", phone: "+48 22 555 0123", source: "Website", status: "qualified", value: 42100, owner: "Alicia Romero", createdAt: "1 week ago" },
];

export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: "Enterprise" | "SMB" | "Individual";
  status: "active" | "inactive";
  totalSpent: number;
  openInvoices: number;
  joined: string;
};

export const customers: Customer[] = [
  { id: "C-1001", name: "Northwind Co", company: "Northwind Co", email: "billing@northwind.io", phone: "+1 415 555 0101", type: "Enterprise", status: "active", totalSpent: 184500, openInvoices: 2, joined: "Jan 2023" },
  { id: "C-1002", name: "Globex Corp", company: "Globex Corp", email: "ap@globex.io", phone: "+49 30 1234 5678", type: "Enterprise", status: "active", totalSpent: 312800, openInvoices: 1, joined: "Mar 2022" },
  { id: "C-1003", name: "Initech Labs", company: "Initech Labs", email: "hello@initech.io", phone: "+44 20 7946 1122", type: "SMB", status: "active", totalSpent: 48900, openInvoices: 0, joined: "Aug 2023" },
  { id: "C-1004", name: "Hooli", company: "Hooli", email: "ops@hooli.com", phone: "+81 3 1234 5678", type: "Enterprise", status: "inactive", totalSpent: 92100, openInvoices: 3, joined: "Feb 2021" },
  { id: "C-1005", name: "Pied Piper", company: "Pied Piper", email: "team@pp.io", phone: "+1 650 555 0192", type: "SMB", status: "active", totalSpent: 22400, openInvoices: 1, joined: "Nov 2023" },
  { id: "C-1006", name: "Stark Industries", company: "Stark Inc", email: "info@stark.io", phone: "+48 22 555 0123", type: "Enterprise", status: "active", totalSpent: 442100, openInvoices: 0, joined: "Jul 2020" },
];

export type Contact = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  tags: string[];
};

export const contacts: Contact[] = [
  { id: "K-01", name: "Emma Stone", title: "VP Procurement", company: "Northwind Co", email: "emma@northwind.io", phone: "+1 415 555 0101", tags: ["decision-maker"] },
  { id: "K-02", name: "Raj Patel", title: "CTO", company: "Initech Labs", email: "raj@initech.io", phone: "+44 20 7946 1122", tags: ["technical", "champion"] },
  { id: "K-03", name: "Sara Müller", title: "Head of Ops", company: "Globex Corp", email: "sara@globex.io", phone: "+49 30 1234 5678", tags: ["decision-maker"] },
  { id: "K-04", name: "Yuki Tanaka", title: "Buyer", company: "Hooli", email: "yuki@hooli.com", phone: "+81 3 1234 5678", tags: ["influencer"] },
  { id: "K-05", name: "Liam Carter", title: "Founder", company: "Pied Piper", email: "liam@pp.io", phone: "+1 650 555 0192", tags: ["champion"] },
  { id: "K-06", name: "Anna Kowalski", title: "CFO", company: "Stark Inc", email: "anna@stark.io", phone: "+48 22 555 0123", tags: ["decision-maker", "finance"] },
];

export type Stage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
export const stages: Stage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export type Deal = {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: Stage;
  probability: number;
  owner: string;
  closeDate: string;
};

export const deals: Deal[] = [
  { id: "D-101", title: "ERP Renewal", customer: "Northwind Co", value: 48000, stage: "Negotiation", probability: 70, owner: "Marcus Chen", closeDate: "Dec 12" },
  { id: "D-102", title: "Add-on Modules", customer: "Globex Corp", value: 22000, stage: "Proposal", probability: 50, owner: "Alicia Romero", closeDate: "Dec 18" },
  { id: "D-103", title: "Annual Subscription", customer: "Initech Labs", value: 12400, stage: "Qualified", probability: 35, owner: "Sofia Bianchi", closeDate: "Jan 4" },
  { id: "D-104", title: "Pilot Program", customer: "Pied Piper", value: 5400, stage: "Lead", probability: 15, owner: "Diego Alvarez", closeDate: "Jan 22" },
  { id: "D-105", title: "Enterprise Deal", customer: "Stark Inc", value: 124000, stage: "Won", probability: 100, owner: "Marcus Chen", closeDate: "Nov 30" },
  { id: "D-106", title: "Replacement Quote", customer: "Hooli", value: 18000, stage: "Lost", probability: 0, owner: "Diego Alvarez", closeDate: "Nov 12" },
  { id: "D-107", title: "Upgrade Package", customer: "Northwind Co", value: 9800, stage: "Proposal", probability: 60, owner: "Sofia Bianchi", closeDate: "Dec 28" },
  { id: "D-108", title: "Discovery Call", customer: "New Lead Co", value: 3200, stage: "Lead", probability: 10, owner: "Alicia Romero", closeDate: "Feb 2" },
];

export type Quote = {
  id: string;
  number: string;
  customer: string;
  date: string;
  expiry: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "expired";
};

export const quotes: Quote[] = [
  { id: "Q1", number: "QT-2041", customer: "Northwind Co", date: "Nov 28", expiry: "Dec 28", amount: 48000, status: "sent" },
  { id: "Q2", number: "QT-2042", customer: "Globex Corp", date: "Nov 26", expiry: "Dec 26", amount: 22000, status: "draft" },
  { id: "Q3", number: "QT-2043", customer: "Initech Labs", date: "Nov 22", expiry: "Dec 22", amount: 12400, status: "accepted" },
  { id: "Q4", number: "QT-2044", customer: "Hooli", date: "Oct 15", expiry: "Nov 15", amount: 18000, status: "expired" },
  { id: "Q5", number: "QT-2045", customer: "Stark Inc", date: "Nov 30", expiry: "Dec 30", amount: 124000, status: "accepted" },
];

export type SalesOrder = {
  id: string;
  number: string;
  customer: string;
  date: string;
  delivery: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
};

export const salesOrders: SalesOrder[] = [
  { id: "S1", number: "SO-3301", customer: "Stark Inc", date: "Nov 30", delivery: "Dec 8", amount: 124000, status: "processing" },
  { id: "S2", number: "SO-3302", customer: "Northwind Co", date: "Nov 28", delivery: "Dec 5", amount: 48000, status: "shipped" },
  { id: "S3", number: "SO-3303", customer: "Initech Labs", date: "Nov 22", delivery: "Nov 30", amount: 12400, status: "completed" },
  { id: "S4", number: "SO-3304", customer: "Pied Piper", date: "Nov 20", delivery: "Dec 1", amount: 5400, status: "pending" },
  { id: "S5", number: "SO-3305", customer: "Globex Corp", date: "Nov 15", delivery: "Nov 24", amount: 22000, status: "cancelled" },
];

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  issued: string;
  due: string;
  amount: number;
  paid: number;
  status: "paid" | "partial" | "due" | "overdue" | "draft";
};

export const crmInvoices: Invoice[] = [
  { id: "I1", number: "INV-5021", customer: "Northwind Co", issued: "Nov 1", due: "Dec 1", amount: 48000, paid: 24000, status: "partial" },
  { id: "I2", number: "INV-5022", customer: "Globex Corp", issued: "Nov 5", due: "Dec 5", amount: 22000, paid: 22000, status: "paid" },
  { id: "I3", number: "INV-5023", customer: "Initech Labs", issued: "Oct 22", due: "Nov 22", amount: 12400, paid: 0, status: "overdue" },
  { id: "I4", number: "INV-5024", customer: "Stark Inc", issued: "Nov 30", due: "Dec 30", amount: 124000, paid: 0, status: "due" },
  { id: "I5", number: "INV-5025", customer: "Pied Piper", issued: "Nov 28", due: "Dec 28", amount: 5400, paid: 0, status: "draft" },
];

export type Payment = {
  id: string;
  ref: string;
  customer: string;
  date: string;
  method: "Bank Transfer" | "Credit Card" | "Cash" | "Check";
  amount: number;
  status: "received" | "pending" | "failed";
};

export const payments: Payment[] = [
  { id: "P1", ref: "PMT-9001", customer: "Globex Corp", date: "Nov 28", method: "Bank Transfer", amount: 22000, status: "received" },
  { id: "P2", ref: "PMT-9002", customer: "Northwind Co", date: "Nov 25", method: "Credit Card", amount: 24000, status: "received" },
  { id: "P3", ref: "PMT-9003", customer: "Stark Inc", date: "Nov 30", method: "Bank Transfer", amount: 50000, status: "pending" },
  { id: "P4", ref: "PMT-9004", customer: "Hooli", date: "Nov 20", method: "Check", amount: 8400, status: "failed" },
  { id: "P5", ref: "PMT-9005", customer: "Initech Labs", date: "Nov 18", method: "Credit Card", amount: 12400, status: "received" },
];

export type Ticket = {
  id: string;
  subject: string;
  customer: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  agent: string;
  updated: string;
};

export const tickets: Ticket[] = [
  { id: "T-7701", subject: "Cannot generate report PDF", customer: "Northwind Co", priority: "high", status: "open", agent: "Sofia Bianchi", updated: "10 min ago" },
  { id: "T-7702", subject: "Question about subscription", customer: "Pied Piper", priority: "low", status: "pending", agent: "Diego Alvarez", updated: "1 hr ago" },
  { id: "T-7703", subject: "Sync error with bank account", customer: "Globex Corp", priority: "urgent", status: "open", agent: "Alicia Romero", updated: "2 hr ago" },
  { id: "T-7704", subject: "Feature request: bulk export", customer: "Initech Labs", priority: "medium", status: "resolved", agent: "Marcus Chen", updated: "Yesterday" },
  { id: "T-7705", subject: "Login issue after upgrade", customer: "Stark Inc", priority: "high", status: "closed", agent: "Sofia Bianchi", updated: "2 days ago" },
];

export const ticketMessages = [
  { id: "m1", from: "customer", author: "Emma Stone", time: "9:14 AM", body: "Hi team, when I try to export the Q3 financial report as PDF, the download just hangs forever." },
  { id: "m2", from: "agent", author: "Sofia Bianchi", time: "9:22 AM", body: "Thanks for reporting Emma. Could you confirm which browser you're using and roughly how large the report is?" },
  { id: "m3", from: "customer", author: "Emma Stone", time: "9:30 AM", body: "Chrome 121 on macOS. The report has about 240 pages." },
  { id: "m4", from: "agent", author: "Sofia Bianchi", time: "9:38 AM", body: "Got it — looks like our PDF worker times out for 200+ pages. I'm escalating to engineering and will get back to you today." },
];

export type Followup = {
  id: string;
  customer: string;
  type: "call" | "email" | "meeting" | "task";
  due: string;
  owner: string;
  notes: string;
  status: "upcoming" | "overdue" | "done";
};

export const followups: Followup[] = [
  { id: "F1", customer: "Northwind Co", type: "call", due: "Today, 4:00 PM", owner: "Marcus Chen", notes: "Discuss renewal terms", status: "upcoming" },
  { id: "F2", customer: "Globex Corp", type: "email", due: "Tomorrow, 10:00 AM", owner: "Alicia Romero", notes: "Send updated proposal", status: "upcoming" },
  { id: "F3", customer: "Initech Labs", type: "meeting", due: "Yesterday", owner: "Sofia Bianchi", notes: "Quarterly review", status: "overdue" },
  { id: "F4", customer: "Pied Piper", type: "task", due: "Nov 24", owner: "Diego Alvarez", notes: "Send onboarding kit", status: "done" },
];

export const ledgerEntries = [
  { id: "le1", date: "Nov 30", reference: "INV-5024", description: "Invoice issued", debit: 124000, credit: 0, balance: 124000 },
  { id: "le2", date: "Nov 28", reference: "PMT-9002", description: "Payment received", debit: 0, credit: 24000, balance: 0 },
  { id: "le3", date: "Nov 1", reference: "INV-5021", description: "Invoice issued", debit: 48000, credit: 0, balance: 24000 },
  { id: "le4", date: "Oct 22", reference: "INV-5023", description: "Invoice issued", debit: 12400, credit: 0, balance: -23600 },
  { id: "le5", date: "Oct 15", reference: "PMT-8911", description: "Payment received", debit: 0, credit: 36000, balance: -36000 },
];

export const salesTrend = [
  { month: "Jun", deals: 18, revenue: 48000 },
  { month: "Jul", deals: 22, revenue: 62000 },
  { month: "Aug", deals: 25, revenue: 71000 },
  { month: "Sep", deals: 28, revenue: 84000 },
  { month: "Oct", deals: 30, revenue: 98000 },
  { month: "Nov", deals: 34, revenue: 124000 },
];

export const leadsBySource = [
  { name: "Website", value: 38 },
  { name: "Referral", value: 24 },
  { name: "Event", value: 18 },
  { name: "Social", value: 12 },
  { name: "Cold Call", value: 8 },
];

export const customerActivity = [
  { id: 1, type: "create", user: "Marcus Chen", action: "created deal", target: "ERP Renewal", time: "2 hr ago" },
  { id: 2, type: "update", user: "Alicia Romero", action: "updated contact", target: "Emma Stone", time: "5 hr ago" },
  { id: 3, type: "approve", user: "Sofia Bianchi", action: "sent quote", target: "QT-2041", time: "Yesterday" },
  { id: 4, type: "create", user: "Diego Alvarez", action: "logged call with", target: "Liam Carter", time: "2 days ago" },
];
