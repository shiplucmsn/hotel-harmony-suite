const recentKeys = new Set<string>();

/** Prevent duplicate toasts when ticket + notification channels both fire. */
export function showRealtimeToastOnce(
  key: string,
  show: () => void,
  ttlMs = 10_000,
): void {
  if (recentKeys.has(key)) return;
  recentKeys.add(key);
  show();
  window.setTimeout(() => recentKeys.delete(key), ttlMs);
}

export function messagePreview(body: string, max = 100): string {
  const trimmed = body.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}
