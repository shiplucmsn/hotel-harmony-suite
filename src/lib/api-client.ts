type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const method = options.method ?? "GET";
    const isBodyObject = options.body !== undefined && typeof options.body === "object" && !(options.body instanceof FormData);

    const res = await fetch(buildUrl(path), {
      method,
      credentials: "include",
      signal: options.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(isBodyObject ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body:
        options.body === undefined
          ? undefined
          : isBodyObject
            ? JSON.stringify(options.body)
            : (options.body as BodyInit),
    });

    const contentType = res.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const message = typeof payload === "object" && payload && "message" in payload ? String((payload as { message: unknown }).message) : `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, payload);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
