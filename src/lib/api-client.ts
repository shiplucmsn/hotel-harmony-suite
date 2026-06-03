import { buildApiHeaders } from "@/lib/api-auth";
import { handleTenantApiError } from "@/lib/tenant-errors";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  idempotent?: boolean;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15000);

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const externalSignal = options.signal;

  const onExternalAbort = () => {
    controller.abort(
      externalSignal?.reason ??
        new DOMException("Request cancelled by caller", "AbortError"),
    );
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      onExternalAbort();
    } else {
      externalSignal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  const timeout = setTimeout(() => {
    controller.abort(new DOMException(`Request timeout after ${API_TIMEOUT_MS}ms`, "TimeoutError"));
  }, API_TIMEOUT_MS);

  try {
    const method = options.method ?? "GET";
    const isBodyObject = options.body !== undefined && typeof options.body === "object" && !(options.body instanceof FormData);

    const isWrite = method !== "GET";
    let res: Response;
    try {
      res = await fetch(buildUrl(path), {
        method,
        credentials: "include",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...buildApiHeaders(options.headers, isWrite || options.idempotent),
          ...(isBodyObject ? { "Content-Type": "application/json" } : {}),
        },
        body:
          options.body === undefined
            ? undefined
            : isBodyObject
              ? JSON.stringify(options.body)
              : (options.body as BodyInit),
      });
    } catch (error) {
      if (controller.signal.aborted) {
        const reason = controller.signal.reason;
        const message =
          reason instanceof DOMException && reason.name === "TimeoutError"
            ? reason.message
            : "Request aborted";
        throw new ApiError(message, 0, { reason });
      }
      throw error;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const envelope = payload as { error?: { code?: string; message?: string }; message?: string };
      const message =
        envelope?.error?.message ??
        envelope?.message ??
        `Request failed with status ${res.status}`;
      const err = new ApiError(message, res.status, payload);
      handleTenantApiError(err);
      throw err;
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
