let ticketRealtimeActive = false;
let notificationRealtimeActive = false;

export function setTicketRealtimeActive(active: boolean): void {
  ticketRealtimeActive = active;
}

export function isTicketRealtimeActive(): boolean {
  return ticketRealtimeActive;
}

export function setNotificationRealtimeActive(active: boolean): void {
  notificationRealtimeActive = active;
}

export function isNotificationRealtimeActive(): boolean {
  return notificationRealtimeActive;
}
