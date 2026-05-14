import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Briefcase, GraduationCap, MapPin, Star, UserPlus } from "lucide-react";
import { timeline } from "@/lib/hr-mock";

const iconMap: Record<string, any> = {
  promotion: Award,
  training: GraduationCap,
  review: Star,
  transfer: MapPin,
  hire: UserPlus,
};

export const Route = createFileRoute("/app/hr/timeline")({ component: TimelinePage });

function TimelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee timeline"
        description="Career milestones and progression history."
        breadcrumbs={[{ label: "HR" }, { label: "Timeline" }]}
      />

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <Avatar className="h-12 w-12"><AvatarFallback className="gradient-primary text-primary-foreground">MC</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-lg">Marcus Chen</CardTitle>
            <p className="text-xs text-muted-foreground">Engineering Manager · Joined Aug 2020</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
            <ul className="space-y-6">
              {timeline.map(t => {
                const Icon = iconMap[t.type] ?? Briefcase;
                return (
                  <li key={t.id} className="relative flex gap-4 pl-1">
                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-card">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-lg border bg-card/50 p-3 transition-all hover:bg-card hover:shadow-sm">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.date}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
