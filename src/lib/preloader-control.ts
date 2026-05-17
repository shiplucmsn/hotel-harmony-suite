const READY_CLASS = "erp-app-ready";

export function markAppLoading() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(READY_CLASS);
}

export function markAppReady() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(READY_CLASS);
}
