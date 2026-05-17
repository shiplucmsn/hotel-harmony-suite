export type ApiMetaSideEffect = {
  domain: string;
  entity: string;
  action: string;
  reference?: string;
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
    correlationId?: string;
    sideEffects?: ApiMetaSideEffect[];
    cacheTags?: string[];
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      lastPage: number;
    };
  };
};

export type ApiErrorBody = {
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};
