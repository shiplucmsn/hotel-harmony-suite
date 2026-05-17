import { ApiError } from "@/lib/api-client";

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string[]>;
  };
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiErrorPayload;
    if (payload?.error?.message) {
      return payload.error.message;
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getApiValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiErrorPayload;
    return payload?.error?.details ?? null;
  }
  return null;
}
