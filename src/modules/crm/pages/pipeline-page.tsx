import { useState } from "react";
import { Calendar, DollarSign, MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { DealFormSheet } from "@/modules/crm/components/deal-form-sheet";
import {
  useCrmPipeline,
  useDeleteDeal,
  useMoveLeadPipeline,
  useUpdateDeal,
} from "@/hooks/crm/use-crm";
import { formatMoney } from "@/modules/crm/utils";
import type { CrmDealDto, CrmDealStage } from "@/modules/crm/types";

const stageColor: Record<string, string> = {
  Lead: "bg-slate-500",
  Qualified: "bg-info",
  Proposal: "bg-violet-500",
  Negotiation: "bg-warning",
  Won: "bg-success",
  Lost: "bg-destructive",
};

const DRAG_MIME = "application/x-erp-pipeline-card";

type DragPayload = { source_type: "deal" | "lead"; id: number };

function ownerInitials(owner: string): string {
  return owner
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isLeadCard(card: CrmDealDto): boolean {
  return card.source_type === "lead" && Boolean(card.lead_id);
}

export function PipelinePage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<CrmDealDto | null>(null);
  const [defaultStage, setDefaultStage] = useState<CrmDealStage | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CrmDealDto | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useCrmPipeline({
    search: search.trim() || undefined,
  });
  const updateDeal = useUpdateDeal();
  const moveLead = useMoveLeadPipeline();
  const deleteDeal = useDeleteDeal();

  const stages = data?.stages ?? [];
  const summary = data?.summary;
  const hasCards = (summary?.card_count ?? 0) > 0;

  const openCreate = (stage?: CrmDealStage) => {
    setEditDeal(null);
    setDefaultStage(stage);
    setFormOpen(true);
  };

  const openEdit = (deal: CrmDealDto) => {
    if (isLeadCard(deal)) return;
    setEditDeal(deal);
    setDefaultStage(undefined);
    setFormOpen(true);
  };

  const cardKey = (d: CrmDealDto) =>
    isLeadCard(d) ? `lead-${d.lead_id}` : `deal-${d.id}`;

  const moveCard = (card: CrmDealDto, stage: CrmDealStage) => {
    if (isLeadCard(card) && card.lead_id) {
      moveLead.mutate({ id: card.lead_id, stage });
      return;
    }
    if (card.id) {
      updateDeal.mutate({ id: card.id, body: { stage } });
    }
  };

  const parseDragPayload = (e: React.DragEvent): DragPayload | null => {
    try {
      const raw = e.dataTransfer.getData(DRAG_MIME);
      return raw ? (JSON.parse(raw) as DragPayload) : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description="Deals and open leads from your database — drag cards between stages."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Pipeline" }]}
        actions={
          <Button
            className="gradient-primary w-full border-0 text-primary-foreground sm:w-auto"
            onClick={() => openCreate()}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        }
      />

      {summary ? (
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
          <span>
            <strong className="text-foreground">{summary.card_count}</strong> cards
          </span>
          <span>
            <strong className="text-foreground">{summary.deal_count}</strong> deals
          </span>
          <span>
            <strong className="text-foreground">{summary.lead_count}</strong> leads
          </span>
          <span className="col-span-2 sm:col-span-1">
            Value: <strong className="text-foreground">{formatMoney(summary.total_value)}</strong>
          </span>
          <span className="col-span-2 sm:col-span-1">
            Weighted: <strong className="text-foreground">{formatMoney(summary.weighted_value)}</strong>
          </span>
        </div>
      ) : null}

      <CrmFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deals and leads…"
      />

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-[min(85vw,18rem)] shrink-0 snap-start rounded-xl" />
          ))}
        </div>
      ) : !hasCards ? (
        <EmptyState
          title="Pipeline is empty"
          description={
            search.trim()
              ? "No deals or leads match your search."
              : "Create deals or add leads — open leads from CRM Leads appear in the Lead column automatically."
          }
          action={
            !search.trim() ? (
              <Button onClick={() => openCreate("lead")}>
                <Plus className="mr-2 h-4 w-4" />
                New Deal
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={cn(
            "-mx-1 w-[calc(100%+0.5rem)] overflow-x-auto overscroll-x-contain pb-2 sm:mx-0 sm:w-full",
            isFetching && !isLoading && "opacity-70",
          )}
        >
          <div className="flex min-h-[min(70vh,32rem)] gap-3 px-1 snap-x snap-mandatory sm:gap-4">
            {stages.map((stage) => (
              <div
                key={stage.key}
                className="flex w-[min(85vw,18rem)] shrink-0 snap-start flex-col sm:w-72"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const payload = parseDragPayload(e);
                  if (payload && stage.key) {
                    if (payload.source_type === "lead") {
                      moveLead.mutate({ id: payload.id, stage: stage.key });
                    } else {
                      updateDeal.mutate({ id: payload.id, body: { stage: stage.key } });
                    }
                  }
                  setDraggingKey(null);
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-muted/50 p-3">
                  <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          stageColor[stage.label] ?? "bg-muted-foreground",
                        )}
                      />
                      <span className="truncate text-sm font-semibold">{stage.label}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {stage.deal_count}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => openCreate(stage.key)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-3 shrink-0 text-xs text-muted-foreground">
                    {formatMoney(stage.total_value)}
                  </div>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {stage.deals.map((d) => {
                      const key = cardKey(d);
                      const lead = isLeadCard(d);
                      return (
                        <Card
                          key={key}
                          draggable
                          onDragStart={(e) => {
                            const payload: DragPayload = lead
                              ? { source_type: "lead", id: d.lead_id! }
                              : { source_type: "deal", id: d.id };
                            e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
                            setDraggingKey(key);
                          }}
                          onDragEnd={() => setDraggingKey(null)}
                          className={cn(
                            "cursor-grab transition-shadow hover:shadow-elegant active:cursor-grabbing",
                            draggingKey === key && "opacity-50",
                          )}
                        >
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{d.title}</div>
                                {lead ? (
                                  <Badge variant="outline" className="mt-1 text-[10px]">
                                    Lead
                                  </Badge>
                                ) : null}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!lead ? (
                                    <DropdownMenuItem onClick={() => openEdit(d)}>Edit</DropdownMenuItem>
                                  ) : null}
                                  {stages
                                    .filter((s) => s.key !== d.stage)
                                    .map((s) => (
                                      <DropdownMenuItem
                                        key={s.key}
                                        onClick={() => moveCard(d, s.key)}
                                      >
                                        Move to {s.label}
                                      </DropdownMenuItem>
                                    ))}
                                  {!lead ? (
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => setDeleteTarget(d)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{d.customer}</div>
                            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <DollarSign className="h-3 w-3 shrink-0" />
                                {d.value > 0 ? d.value.toLocaleString() : "—"}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {d.close_date ?? "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {ownerInitials(d.owner)}
                                </AvatarFallback>
                              </Avatar>
                              <Badge variant="outline" className="text-[10px]">
                                {d.probability}%
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DealFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditDeal(null);
            setDefaultStage(undefined);
          }
        }}
        deal={editDeal}
        defaultStage={defaultStage}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deal?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be removed from the pipeline.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel disabled={deleteDeal.isPending} className="mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDeal.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteDeal.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
