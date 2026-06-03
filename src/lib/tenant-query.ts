import { getBranchId, getTenantId } from "@/lib/api-auth";

/** Append active tenant + branch so React Query caches do not bleed across workspaces/branches. */
export function withTenantKey<T extends readonly unknown[]>(parts: T): readonly [...T, string, string] {
  return [...parts, getTenantId(), getBranchId()] as readonly [...T, string, string];
}

/** Match cached queries for the active tenant/branch with a module prefix (for invalidation). */
export function matchesTenantQueryKey(prefix: readonly unknown[]) {
  const tenant = getTenantId();
  const branch = getBranchId();
  return (query: { queryKey: readonly unknown[] }) => {
    const key = query.queryKey;
    if (
      key.length < prefix.length + 2 ||
      key[key.length - 2] !== tenant ||
      key[key.length - 1] !== branch
    ) {
      return false;
    }
    for (let i = 0; i < prefix.length; i++) {
      if (key[i] !== prefix[i]) {
        return false;
      }
    }
    return true;
  };
}
