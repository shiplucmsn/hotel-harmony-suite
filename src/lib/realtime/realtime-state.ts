let ticketRealtimeActive = false;

export function setTicketRealtimeActive(active: boolean): void {
  ticketRealtimeActive = active;
}

export function isTicketRealtimeActive(): boolean {
  return ticketRealtimeActive;
}
