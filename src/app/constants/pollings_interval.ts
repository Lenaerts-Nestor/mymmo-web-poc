export const POLLING_INTERVALS = {
  GLOBAL_COUNTER: 60 * 1000, // 1 minuut - sidebar unread counts (was 45s)

  INBOX: 45 * 1000, // 45 seconden - inbox pagina refresh (was 30s)

  CONVERSATIONS: 5 * 1000, // 5 seconden - active chat (was 3s, socket reduces this to 50s)

  CONVERSATIONS_BACKGROUND: 60 * 1000, // 1 minuut - background chat refresh (was 30s, socket reduces to 5min)

  // Longer interval since zones change less frequently
  ZONES: 5 * 60 * 1000, // 5 minuten - zones refresh
} as const;
