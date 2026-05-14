import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tasks as initial, pmTone } from "@/lib/pm-mock";
import { Plus, GripVertical, Calendar, User } from "lucide-react";

export const Route = createFileRoute("/app/pm/kanban")({ component: KanbanPage });

const cols = [
  { key: "todo", title: "To do" },
  { key: "in_progress", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "done", title: "Done" },
] as const;

function KanbanPage() {
  const [items, setItems] = useState(initial);
  const [drag, setDrag] = useState<string | null>(null);

  const onDrop = (col: string) => {
    if (!drag) return;
    setItems(prev => prev.map(t => t.id === drag ? { ...t, status: col as typeof t.status } : t));
    setDrag(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        description="Drag tasks across stages to update status."
        breadcrumbs={[{ label: "Projects" }, { label: "Kanban" }]}
        actions={<Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />Add task</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cols.map(col => {
          const list = items.filter(t => t.status === col.key);
          return (
            <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(col.key)} className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                  <Badge variant="outline" className="text-xs">{list.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {list.map(t => (
                  <Card key={t.id} draggable onDragStart={() => setDrag(t.id)} className="cursor-grab active:cursor-grabbing transition-all hover:shadow-elegant">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{t.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.project}</div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={`${pmTone(t.priority)} text-[10px]`}>{t.priority}</Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{t.due.slice(5)}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{t.assignee.split(" ")[0]}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
