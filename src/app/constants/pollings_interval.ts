export const POLLING_INTERVALS = {
  // Moderate interval for global updates
  GLOBAL_COUNTER: 60 * 1000, // 1 minuut - sidebar unread counts (was 45s)

  // Regular interval for inbox refresh
  INBOX: 45 * 1000, // 45 seconden - inbox pagina refresh (was 30s)

  // ⚡ Still fast but can be higher since socket provides real-time
  CONVERSATIONS: 5 * 1000, // 5 seconden - active chat (was 3s, socket reduces this to 50s)

  // Much slower when chat is not actively being viewed
  CONVERSATIONS_BACKGROUND: 60 * 1000, // 1 minuut - background chat refresh (was 30s, socket reduces to 5min)

  // Longer interval since zones change less frequently
  ZONES: 5 * 60 * 1000, // 5 minuten - zones refresh
} as const;
