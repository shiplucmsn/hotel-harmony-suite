# Multi-tenant / branch — frontend continue

**Branch:** `multi-tanant`  
**Pair with:** `erp-backend/MULTI-TENANT-CONTINUE.md` on the same branch.

## Done on this branch

- `getBranchId` / `setBranchId` + `X-Branch-Id` in `src/lib/api-auth.ts`
- `withTenantKey()` includes tenant + branch (`src/lib/tenant-query.ts`)
- `BranchSwitcher` in topbar (`src/components/branch-switcher.tsx`)
- `useTenantContext` + `tenant-api.ts` (`branches`, `active_branch_id`)
- Workspace menu, host guard, branches settings tab, warehouse form branch select

## Phase 2+ UI (pick up in Cursor)

Say: *"Continue MULTI-TENANT-CONTINUE.md frontend tasks"*

1. **Branch chip** on Finance journals, RBAC users, inventory warehouse pages (read-only active branch name from `useTenantContext`)
2. **Invalidate queries** on branch switch — verify module hooks use `withTenantKey` (most hooks already updated)
3. **Tax/settings** screens when backend tax API exists
4. **Signup/workspace** flows — ensure `setBranchId` after first context load

## Env

- `VITE_API_BASE_URL` must point to API host
- Use workspace subdomain in dev (not wrong tenant slug on another host)
