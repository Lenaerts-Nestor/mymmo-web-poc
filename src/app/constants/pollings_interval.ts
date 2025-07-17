//! hier bepaal je de pollings intervallen voor de verschillende hooks
//! deze intervallen worden gebruikt in de hooks om de data te verversen

export const POLLING_INTERVALS = {
  INBOX: 30 * 1000, // 30 seconden
  CONVERSATIONS: 30 * 1000, // 30 seconden
  GLOBAL_COUNTER: 30 * 1000, // 30 seconden
  ZONES: 30 * 1000, // 30 seconden
} as const;
