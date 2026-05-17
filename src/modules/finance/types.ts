export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type JournalStatus = "posted" | "reversed" | "draft";

export type FinanceAccountDto = {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  type: AccountType;
  normal_balance: "debit" | "credit";
  balance: number;
  is_active: boolean;
  is_postable: boolean;
  parent_id?: number | null;
  currency_code: string;
  description?: string | null;
};

export type JournalLineDto = {
  id: number;
  account_code: string;
  finance_account_id?: number;
  debit: number;
  credit: number;
  line_reference?: string | null;
};

export type JournalEntryDto = {
  id: number;
  uuid?: string;
  entry_number: string;
  entry_date: string;
  reference_type?: string | null;
  reference_id?: string | null;
  memo?: string | null;
  status: JournalStatus;
  source_module?: string | null;
  posted_at?: string | null;
  correlation_id?: string | null;
  lines?: JournalLineDto[];
};

export type LedgerEntryDto = {
  id: number;
  uuid?: string;
  account_code: string;
  entry_date: string;
  posted_at?: string | null;
  debit: number;
  credit: number;
  reference_type?: string | null;
  reference_id?: string | null;
  memo?: string | null;
  source_module?: string | null;
};

export type PaginationDto = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type PaginatedResult<T> = {
  data: T;
  pagination?: PaginationDto;
};
