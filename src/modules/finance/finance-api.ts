import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type {
  FinanceAccountDto,
  JournalEntryDto,
  LedgerEntryDto,
  PaginatedResult,
} from "@/modules/finance/types";

type ListParams = {
  page?: number;
  per_page?: number;
  account_code?: string;
};

function buildQuery(params?: ListParams): string {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  if (params?.account_code) q.set("account_code", params.account_code);
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

function paginated<T>(res: ApiEnvelope<T>): PaginatedResult<T> {
  return {
    data: res.data,
    pagination: res.meta?.pagination,
  };
}

export const financeApi = {
  accounts: () => api.get<ApiEnvelope<FinanceAccountDto[]>>("/v1/finance/accounts").then((r) => r.data),

  createAccount: (body: {
    code: string;
    name: string;
    type: string;
    description?: string;
    is_postable?: boolean;
  }) =>
    api
      .post<ApiEnvelope<FinanceAccountDto>>("/v1/finance/accounts", body, { idempotent: true })
      .then((r) => r.data),

  journal: (params?: ListParams) =>
    api
      .get<ApiEnvelope<JournalEntryDto[]>>(`/v1/finance/journal${buildQuery(params)}`)
      .then(paginated),

  postJournal: (body: {
    reference_type: string;
    reference_id: string;
    memo: string;
    entry_date?: string;
    lines: { account_code: string; debit?: number; credit?: number }[];
  }) =>
    api
      .post<ApiEnvelope<JournalEntryDto>>("/v1/finance/journal", body, { idempotent: true })
      .then((r) => r.data),

  ledger: (params?: ListParams) =>
    api
      .get<ApiEnvelope<LedgerEntryDto[]>>(`/v1/finance/ledger${buildQuery(params)}`)
      .then(paginated),
};
