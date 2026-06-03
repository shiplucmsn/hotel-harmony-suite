import { useQuery } from "@tanstack/react-query";
import { getBranchId, getTenantId, setBranchId } from "@/lib/api-auth";
import { withTenantKey } from "@/lib/tenant-query";
import { tenantApi } from "@/modules/platform/tenant-api";
import { isAuthenticated } from "@/lib/auth-session";

export const tenantContextKeys = {
  context: () => withTenantKey(["tenant", "context"] as const),
};

export function useTenantContext() {
  return useQuery({
    queryKey: tenantContextKeys.context(),
    queryFn: async () => {
      const res = await tenantApi.context();
      const data = res.data;
      if (data.active_branch_id) {
        const stored = getBranchId();
        if (!stored || stored === String(data.active_branch_id)) {
          setBranchId(data.active_branch_id);
        }
      }
      return data;
    },
    enabled: isAuthenticated(),
    staleTime: 60_000,
  });
}

export function useTenantId() {
  return getTenantId();
}
