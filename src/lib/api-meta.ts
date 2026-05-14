import { toast } from "sonner";

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
  };
};

export function showSideEffects(meta?: ApiEnvelope<unknown>["meta"]) {
  if (!meta?.sideEffects?.length) return;
  const summary = meta.sideEffects
    .slice(0, 3)
    .map((s) => `${s.domain}.${s.entity}.${s.action}`)
    .join(", ");
  toast.message(`Side-effects: ${summary}`);
}
