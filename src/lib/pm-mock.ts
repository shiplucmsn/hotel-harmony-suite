export type Project = {
  id: string; code: string; name: string; client: string; lead: string;
  start: string; due: string; progress: number; budget: number; spent: number;
  status: "planning" | "active" | "on_hold" | "completed" | "at_risk";
};
export type Task = {
  id: string; title: string; project: string; assignee: string;
  due: string; priority: "low" | "med" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  estimate: number; logged: number;
};
export type TeamMember = {
  id: string; name: string; role: string; email: string; avatar: string;
  capacity: number; load: number; projects: number;
};

export const projects: Project[] = [
  { id: "pj1", code: "PRJ-001", name: "Aurora Mobile App v2", client: "Acme Corp", lead: "Lena Vogt", start: "2026-03-01", due: "2026-06-30", progress: 62, budget: 180000, spent: 110400, status: "active" },
  { id: "pj2", code: "PRJ-002", name: "Helix ERP Migration", client: "Helix GmbH", lead: "Tomas Reiner", start: "2026-02-15", due: "2026-08-15", progress: 38, budget: 320000, spent: 142000, status: "active" },
  { id: "pj3", code: "PRJ-003", name: "Nimbus Cloud Rollout", client: "Northwind", lead: "Anna Beck", start: "2026-04-10", due: "2026-05-20", progress: 92, budget: 60000, spent: 58400, status: "at_risk" },
  { id: "pj4", code: "PRJ-004", name: "Pacific Brand Refresh", client: "Pacific Foods", lead: "Sophie Martin", start: "2026-01-05", due: "2026-04-30", progress: 100, budget: 90000, spent: 84200, status: "completed" },
  { id: "pj5", code: "PRJ-005", name: "Aurora Analytics Dashboard", client: "Aurora Inc.", lead: "Mei Tanaka", start: "2026-05-01", due: "2026-09-01", progress: 12, budget: 140000, spent: 18200, status: "planning" },
  { id: "pj6", code: "PRJ-006", name: "Internal HR Portal", client: "Internal", lead: "Erik Lund", start: "2026-03-20", due: "2026-07-10", progress: 50, budget: 80000, spent: 41000, status: "on_hold" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Design login flow", project: "Aurora Mobile App v2", assignee: "Lena Vogt", due: "2026-05-18", priority: "high", status: "in_progress", estimate: 12, logged: 6 },
  { id: "t2", title: "Implement REST adapter", project: "Helix ERP Migration", assignee: "Tomas Reiner", due: "2026-05-22", priority: "urgent", status: "in_progress", estimate: 24, logged: 14 },
  { id: "t3", title: "QA regression sweep", project: "Nimbus Cloud Rollout", assignee: "Anna Beck", due: "2026-05-15", priority: "high", status: "review", estimate: 16, logged: 13 },
  { id: "t4", title: "Brand guidelines doc", project: "Pacific Brand Refresh", assignee: "Sophie Martin", due: "2026-05-12", priority: "med", status: "done", estimate: 8, logged: 8 },
  { id: "t5", title: "Setup CI pipeline", project: "Aurora Analytics Dashboard", assignee: "Mei Tanaka", due: "2026-05-25", priority: "med", status: "todo", estimate: 10, logged: 0 },
  { id: "t6", title: "Stakeholder kickoff", project: "Internal HR Portal", assignee: "Erik Lund", due: "2026-05-14", priority: "low", status: "todo", estimate: 4, logged: 0 },
  { id: "t7", title: "Mobile push notifications", project: "Aurora Mobile App v2", assignee: "Liam O'Brien", due: "2026-05-30", priority: "med", status: "todo", estimate: 18, logged: 0 },
  { id: "t8", title: "DB schema review", project: "Helix ERP Migration", assignee: "Anna Beck", due: "2026-05-19", priority: "high", status: "review", estimate: 6, logged: 5 },
  { id: "t9", title: "Pilot user onboarding", project: "Nimbus Cloud Rollout", assignee: "Lena Vogt", due: "2026-05-17", priority: "urgent", status: "in_progress", estimate: 14, logged: 9 },
];

export const team: TeamMember[] = [
  { id: "tm1", name: "Lena Vogt", role: "Engineering Lead", email: "lena@nebula.io", avatar: "LV", capacity: 40, load: 36, projects: 3 },
  { id: "tm2", name: "Tomas Reiner", role: "Senior Backend", email: "tomas@nebula.io", avatar: "TR", capacity: 40, load: 38, projects: 2 },
  { id: "tm3", name: "Anna Beck", role: "QA Manager", email: "anna@nebula.io", avatar: "AB", capacity: 40, load: 30, projects: 4 },
  { id: "tm4", name: "Sophie Martin", role: "Designer", email: "sophie@nebula.io", avatar: "SM", capacity: 40, load: 22, projects: 2 },
  { id: "tm5", name: "Mei Tanaka", role: "Data Engineer", email: "mei@nebula.io", avatar: "MT", capacity: 40, load: 28, projects: 2 },
  { id: "tm6", name: "Erik Lund", role: "Project Manager", email: "erik@nebula.io", avatar: "EL", capacity: 40, load: 34, projects: 5 },
  { id: "tm7", name: "Liam O'Brien", role: "Mobile Engineer", email: "liam@nebula.io", avatar: "LO", capacity: 40, load: 26, projects: 1 },
];

export const activities = [
  { id: "a1", who: "Lena Vogt", what: "moved", target: "Design login flow", to: "In progress", when: "2h ago" },
  { id: "a2", who: "Anna Beck", what: "commented on", target: "QA regression sweep", to: "", when: "3h ago" },
  { id: "a3", who: "Tomas Reiner", what: "created task", target: "DB schema review", to: "", when: "5h ago" },
  { id: "a4", who: "Sophie Martin", what: "completed", target: "Brand guidelines doc", to: "Done", when: "yesterday" },
  { id: "a5", who: "Erik Lund", what: "set due date for", target: "Stakeholder kickoff", to: "May 14", when: "yesterday" },
  { id: "a6", who: "Mei Tanaka", what: "joined", target: "Aurora Analytics Dashboard", to: "", when: "2d ago" },
];

export const timeLogs = [
  { id: "tl1", member: "Lena Vogt", project: "Aurora Mobile App v2", task: "Design login flow", date: "2026-05-12", hours: 4 },
  { id: "tl2", member: "Tomas Reiner", project: "Helix ERP Migration", task: "Implement REST adapter", date: "2026-05-12", hours: 6.5 },
  { id: "tl3", member: "Anna Beck", project: "Nimbus Cloud Rollout", task: "QA regression sweep", date: "2026-05-12", hours: 5 },
  { id: "tl4", member: "Mei Tanaka", project: "Aurora Analytics Dashboard", task: "Setup CI pipeline", date: "2026-05-11", hours: 3 },
  { id: "tl5", member: "Liam O'Brien", project: "Aurora Mobile App v2", task: "Mobile push notifications", date: "2026-05-11", hours: 4.5 },
  { id: "tl6", member: "Sophie Martin", project: "Pacific Brand Refresh", task: "Brand guidelines doc", date: "2026-05-10", hours: 2 },
];

export const burndown = [
  { day: "D1", planned: 100, actual: 100 },
  { day: "D3", planned: 90, actual: 95 },
  { day: "D5", planned: 80, actual: 86 },
  { day: "D7", planned: 70, actual: 74 },
  { day: "D9", planned: 60, actual: 64 },
  { day: "D11", planned: 50, actual: 48 },
  { day: "D13", planned: 40, actual: 36 },
  { day: "D15", planned: 30, actual: 22 },
];

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
