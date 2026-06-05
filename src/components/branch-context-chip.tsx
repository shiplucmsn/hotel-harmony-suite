import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTenantContext } from "@/hooks/use-tenant-context";

export function BranchContextChip() {
  const { data: ctx } = useTenantContext();
  const activeId = ctx?.active_branch_id;
  const branch = ctx?.branches?.find((b) => b.id === activeId);

  if (!branch) {
    return null;
  }

  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <GitBranch className="h-3 w-3 shrink-0" />
      <span className="max-w-[160px] truncate">
        {branch.name}
        {branch.is_head_office ? " (HQ)" : ""}
      </span>
    </Badge>
  );
}
