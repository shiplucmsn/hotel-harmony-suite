# Multi-tenant / branch — frontend status

**Branch:** `multi-tanant`

## Done

- `BranchSwitcher` + `X-Branch-Id` header (`src/lib/api-auth.ts`)
- Tenant context syncs `active_branch_id` from server (`use-tenant-context.ts`)
- `withTenantKey` / query invalidation on branch switch
- Settings → Branches tab (CRUD API)
- Settings → Tax tab: rates API + branch-scoped preference toggles
- `BranchContextChip` on Finance Journal, Users, Inventory pages

## Optional next

- Branch chip on Reports and other list pages
- Persist branch preference indicator in profile settings

See `erp-backend/MULTI-TENANT-CONTINUE.md` and `docs/architecture/BRANCH-SCOPE.md`.
