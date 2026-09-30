export type PresenceScope = "home" | "form1" | "form2";
export type ParticipationSnapshot = {
  live: { total: number; form1: number; form2: number };
  submitted: { total: number; form1: number; form2: number };
  updatedAt: string;
};

// Visible tabs renew their presence; hidden, closed and disconnected tabs expire.
export const HEARTBEAT_INTERVAL_MS = 15_000;
export const PRESENCE_TIMEOUT_SECONDS = 45;
export const PARTICIPATION_POLL_MS = 4_000;
