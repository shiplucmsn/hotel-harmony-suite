import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBranchId, setBranchId } from "@/lib/api-auth";
import { matchesTenantQueryKey } from "@/lib/tenant-query";
import { tenantApi } from "@/modules/platform/tenant-api";
import { useTenantContext } from "@/hooks/use-tenant-context";

export function BranchSwitcher() {
  const queryClient = useQueryClient();
  const { data: ctx, isLoading } = useTenantContext();

  const branches = ctx?.branches ?? [];
  const activeId = ctx?.active_branch_id;
  const canSwitch = ctx?.can_switch_branch ?? false;

  useEffect(() => {
    if (!activeId) return;
    const stored = getBranchId();
    if (stored !== String(activeId)) {
      setBranchId(activeId);
    }
  }, [activeId]);

  const selectedValue = useMemo(() => {
    if (activeId) return String(activeId);
    const stored = getBranchId();
    return stored || undefined;
  }, [activeId]);

  const switchBranch = useMutation({
    mutationFn: async (branchId: number) => {
      setBranchId(branchId);
      await tenantApi.updateActiveBranch(branchId);
      return branchId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ predicate: () => true });
      await queryClient.refetchQueries({
        predicate: matchesTenantQueryKey(["tenant", "context"]),
      });
    },
  });

  if (isLoading || branches.length === 0) {
    return null;
  }

  const activeBranch = branches.find((b) => String(b.id) === selectedValue);

  if (!canSwitch && branches.length === 1) {
    return (
      <div className="hidden items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground lg:flex">
        <GitBranch className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[140px] truncate font-medium text-foreground">
          {activeBranch?.name ?? "Branch"}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => switchBranch.mutate(Number(value))}
      disabled={!canSwitch || switchBranch.isPending}
    >
      <SelectTrigger className="hidden h-9 w-[min(200px,28vw)] gap-2 border-dashed lg:flex">
        <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Branch" />
      </SelectTrigger>
      <SelectContent align="start">
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={String(branch.id)}>
            {branch.name}
            {branch.is_head_office ? " (HQ)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
