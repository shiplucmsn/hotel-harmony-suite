export type Employee = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  manager: string;
  type: "Full-time" | "Part-time" | "Contract" | "Intern";
  status: "active" | "on-leave" | "probation" | "terminated";
  joinDate: string;
  salary: number;
  location: string;
};

export const departments = [
  { id: "d1", name: "Engineering", head: "Marcus Chen", members: 42, budget: 1250000 },
  { id: "d2", name: "Sales", head: "Sofia Bianchi", members: 28, budget: 880000 },
  { id: "d3", name: "Finance", head: "Priya Natarajan", members: 12, budget: 420000 },
  { id: "d4", name: "Marketing", head: "Hana Kobayashi", members: 18, budget: 560000 },
  { id: "d5", name: "Operations", head: "Alicia Romero", members: 24, budget: 720000 },
  { id: "d6", name: "Human Resources", head: "Liam O'Connor", members: 9, budget: 310000 },
];

export const designations = [
  { id: "g1", title: "Software Engineer", level: "L3", department: "Engineering", count: 18 },
  { id: "g2", title: "Senior Engineer", level: "L4", department: "Engineering", count: 11 },
  { id: "g3", title: "Engineering Manager", level: "L5", department: "Engineering", count: 4 },
  { id: "g4", title: "Account Executive", level: "L3", department: "Sales", count: 14 },
  { id: "g5", title: "Sales Director", level: "L5", department: "Sales", count: 2 },
  { id: "g6", title: "Accountant", level: "L3", department: "Finance", count: 6 },
  { id: "g7", title: "Marketing Specialist", level: "L2", department: "Marketing", count: 9 },
  { id: "g8", title: "HR Business Partner", level: "L4", department: "Human Resources", count: 3 },
];

export const employees: Employee[] = [
  { id: "e1", code: "EMP-001", name: "Alicia Romero", email: "alicia@acme.io", phone: "+49 170 1112233", department: "Operations", designation: "Operations Lead", manager: "—", type: "Full-time", status: "active", joinDate: "2021-03-14", salary: 92000, location: "Berlin" },
  { id: "e2", code: "EMP-002", name: "Marcus Chen", email: "marcus@acme.io", phone: "+1 415 555 0144", department: "Engineering", designation: "Engineering Manager", manager: "Alicia Romero", type: "Full-time", status: "active", joinDate: "2020-08-02", salary: 138000, location: "San Francisco" },
  { id: "e3", code: "EMP-003", name: "Priya Natarajan", email: "priya@acme.io", phone: "+91 98765 43210", department: "Finance", designation: "Senior Accountant", manager: "Alicia Romero", type: "Full-time", status: "active", joinDate: "2019-11-19", salary: 78000, location: "Bangalore" },
  { id: "e4", code: "EMP-004", name: "Diego Alvarez", email: "diego@acme.io", phone: "+34 612 334 556", department: "Sales", designation: "Account Executive", manager: "Sofia Bianchi", type: "Full-time", status: "probation", joinDate: "2025-09-01", salary: 64000, location: "Madrid" },
  { id: "e5", code: "EMP-005", name: "Hana Kobayashi", email: "hana@acme.io", phone: "+81 90 1234 5678", department: "Marketing", designation: "Marketing Specialist", manager: "Alicia Romero", type: "Full-time", status: "active", joinDate: "2022-05-23", salary: 71000, location: "Tokyo" },
  { id: "e6", code: "EMP-006", name: "Liam O'Connor", email: "liam@acme.io", phone: "+353 86 776 4421", department: "Human Resources", designation: "HR Business Partner", manager: "Alicia Romero", type: "Full-time", status: "on-leave", joinDate: "2018-02-11", salary: 88000, location: "Dublin" },
  { id: "e7", code: "EMP-007", name: "Sofia Bianchi", email: "sofia@acme.io", phone: "+39 333 998 7766", department: "Sales", designation: "Sales Director", manager: "Alicia Romero", type: "Full-time", status: "active", joinDate: "2017-07-30", salary: 152000, location: "Milan" },
  { id: "e8", code: "EMP-008", name: "Noah Williams", email: "noah@acme.io", phone: "+44 7700 900123", department: "Finance", designation: "Accountant", manager: "Priya Natarajan", type: "Full-time", status: "active", joinDate: "2023-01-09", salary: 62000, location: "London" },
  { id: "e9", code: "EMP-009", name: "Yuki Tanaka", email: "yuki@acme.io", phone: "+81 90 8888 4422", department: "Engineering", designation: "Senior Engineer", manager: "Marcus Chen", type: "Full-time", status: "active", joinDate: "2021-10-04", salary: 124000, location: "Osaka" },
  { id: "e10", code: "EMP-010", name: "Aisha Mensah", email: "aisha@acme.io", phone: "+233 24 555 1010", department: "Engineering", designation: "Software Engineer", manager: "Marcus Chen", type: "Contract", status: "active", joinDate: "2024-04-15", salary: 84000, location: "Accra" },
  { id: "e11", code: "EMP-011", name: "Tomás Rivera", email: "tomas@acme.io", phone: "+52 55 4444 1212", department: "Marketing", designation: "Content Lead", manager: "Hana Kobayashi", type: "Full-time", status: "active", joinDate: "2022-12-01", salary: 79000, location: "Mexico City" },
  { id: "e12", code: "EMP-012", name: "Emma Schultz", email: "emma@acme.io", phone: "+49 152 5559900", department: "Operations", designation: "Logistics Coordinator", manager: "Alicia Romero", type: "Part-time", status: "active", joinDate: "2024-08-20", salary: 41000, location: "Hamburg" },
];

export const attendanceTrend = [
  { day: "Mon", present: 218, late: 14, absent: 6 },
  { day: "Tue", present: 224, late: 9, absent: 5 },
  { day: "Wed", present: 220, late: 12, absent: 6 },
  { day: "Thu", present: 215, late: 18, absent: 5 },
  { day: "Fri", present: 198, late: 22, absent: 18 },
  { day: "Sat", present: 64, late: 4, absent: 2 },
  { day: "Sun", present: 12, late: 1, absent: 0 },
];

export const dailyAttendance = employees.slice(0, 10).map((e, i) => ({
  id: e.id,
  name: e.name,
  code: e.code,
  department: e.department,
  checkIn: ["08:54", "09:02", "08:48", "09:18", "08:55", "—", "08:39", "09:06", "08:51", "09:23"][i],
  checkOut: ["18:12", "18:33", "17:55", "18:42", "18:10", "—", "17:48", "18:21", "18:05", "18:50"][i],
  hours: ["9.30", "9.51", "9.11", "9.40", "9.25", "0.00", "9.15", "9.25", "9.23", "9.45"][i],
  status: ["present", "present", "present", "late", "present", "absent", "present", "present", "present", "late"][i] as "present" | "late" | "absent",
}));

export const leaveRequests = [
  { id: "lr1", employee: "Diego Alvarez", type: "Annual", from: "2026-05-12", to: "2026-05-16", days: 5, status: "pending", reason: "Family vacation" },
  { id: "lr2", employee: "Hana Kobayashi", type: "Sick", from: "2026-05-09", to: "2026-05-10", days: 2, status: "approved", reason: "Flu" },
  { id: "lr3", employee: "Noah Williams", type: "Unpaid", from: "2026-05-18", to: "2026-05-20", days: 3, status: "pending", reason: "Personal matters" },
  { id: "lr4", employee: "Yuki Tanaka", type: "Annual", from: "2026-05-22", to: "2026-05-29", days: 8, status: "pending", reason: "Travel" },
  { id: "lr5", employee: "Tomás Rivera", type: "Sick", from: "2026-05-08", to: "2026-05-08", days: 1, status: "rejected", reason: "—" },
  { id: "lr6", employee: "Emma Schultz", type: "Annual", from: "2026-06-01", to: "2026-06-05", days: 5, status: "approved", reason: "Wedding" },
];

export const payrollTrend = [
  { month: "Jan", gross: 320000, deductions: 64000 },
  { month: "Feb", gross: 322500, deductions: 64200 },
  { month: "Mar", gross: 331000, deductions: 66800 },
  { month: "Apr", gross: 338200, deductions: 68100 },
  { month: "May", gross: 345600, deductions: 69500 },
  { month: "Jun", gross: 352000, deductions: 70400 },
];

export const shifts = [
  { id: "s1", name: "Morning", start: "08:00", end: "16:00", breakMin: 45, days: "Mon–Fri", assigned: 142 },
  { id: "s2", name: "Evening", start: "14:00", end: "22:00", breakMin: 45, days: "Mon–Fri", assigned: 38 },
  { id: "s3", name: "Night", start: "22:00", end: "06:00", breakMin: 60, days: "Mon–Sun", assigned: 22 },
  { id: "s4", name: "Weekend", start: "09:00", end: "17:00", breakMin: 30, days: "Sat–Sun", assigned: 18 },
];

export const holidays = [
  { id: "h1", name: "New Year's Day", date: "2026-01-01", type: "Public", region: "All" },
  { id: "h2", name: "Good Friday", date: "2026-04-03", type: "Public", region: "DE/UK" },
  { id: "h3", name: "Labor Day", date: "2026-05-01", type: "Public", region: "All" },
  { id: "h4", name: "Independence Day", date: "2026-07-04", type: "Public", region: "US" },
  { id: "h5", name: "Diwali", date: "2026-10-29", type: "Optional", region: "IN" },
  { id: "h6", name: "Christmas", date: "2026-12-25", type: "Public", region: "All" },
];

export const overtime = [
  { id: "ot1", employee: "Yuki Tanaka", date: "2026-05-06", hours: 3.5, rate: 1.5, project: "Atlas migration", status: "approved" },
  { id: "ot2", employee: "Aisha Mensah", date: "2026-05-07", hours: 2.0, rate: 1.5, project: "API rewrite", status: "pending" },
  { id: "ot3", employee: "Marcus Chen", date: "2026-05-05", hours: 4.0, rate: 2.0, project: "Outage response", status: "approved" },
  { id: "ot4", employee: "Emma Schultz", date: "2026-05-08", hours: 2.5, rate: 1.5, project: "Warehouse audit", status: "pending" },
];

export const reviews = [
  { id: "rv1", employee: "Marcus Chen", period: "Q1 2026", rating: 4.6, status: "Completed", reviewer: "Alicia Romero" },
  { id: "rv2", employee: "Sofia Bianchi", period: "Q1 2026", rating: 4.8, status: "Completed", reviewer: "Alicia Romero" },
  { id: "rv3", employee: "Yuki Tanaka", period: "Q1 2026", rating: 4.4, status: "Completed", reviewer: "Marcus Chen" },
  { id: "rv4", employee: "Diego Alvarez", period: "Q1 2026", rating: 0, status: "In progress", reviewer: "Sofia Bianchi" },
  { id: "rv5", employee: "Hana Kobayashi", period: "Q1 2026", rating: 4.2, status: "Completed", reviewer: "Alicia Romero" },
];

export const documents = [
  { id: "doc1", employee: "Marcus Chen", name: "Employment Contract.pdf", category: "Contract", size: "412 KB", uploaded: "2020-08-02", status: "verified" },
  { id: "doc2", employee: "Marcus Chen", name: "Passport.pdf", category: "ID", size: "1.1 MB", uploaded: "2020-08-02", status: "verified" },
  { id: "doc3", employee: "Diego Alvarez", name: "Offer Letter.pdf", category: "Contract", size: "298 KB", uploaded: "2025-08-22", status: "pending" },
  { id: "doc4", employee: "Aisha Mensah", name: "NDA.pdf", category: "Legal", size: "184 KB", uploaded: "2024-04-12", status: "verified" },
  { id: "doc5", employee: "Yuki Tanaka", name: "Degree Certificate.pdf", category: "Education", size: "742 KB", uploaded: "2021-10-04", status: "verified" },
];

export const timeline = [
  { id: "t1", date: "2026-04-01", title: "Promoted to Engineering Manager", type: "promotion" },
  { id: "t2", date: "2025-10-15", title: "Completed Leadership Training", type: "training" },
  { id: "t3", date: "2025-04-01", title: "Annual review · 4.7/5", type: "review" },
  { id: "t4", date: "2024-08-12", title: "Transferred to SF office", type: "transfer" },
  { id: "t5", date: "2023-04-01", title: "Promoted to Senior Engineer", type: "promotion" },
  { id: "t6", date: "2020-08-02", title: "Joined as Software Engineer", type: "hire" },
];

export const activityLogs = [
  { id: "a1", actor: "Alicia Romero", action: "approved leave request", target: "Hana Kobayashi", time: "2 min ago" },
  { id: "a2", actor: "Marcus Chen", action: "submitted overtime", target: "Atlas migration", time: "18 min ago" },
  { id: "a3", actor: "HR Bot", action: "ran payroll for", target: "May 2026", time: "1 hr ago" },
  { id: "a4", actor: "Sofia Bianchi", action: "updated employee record", target: "Diego Alvarez", time: "3 hr ago" },
  { id: "a5", actor: "Liam O'Connor", action: "uploaded document", target: "Policy_v3.pdf", time: "yesterday" },
  { id: "a6", actor: "System", action: "generated review cycle", target: "Q1 2026", time: "2 days ago" },
];
