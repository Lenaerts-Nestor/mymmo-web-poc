// src/app/constants/pollings_interval.ts - SIMPLIFIED FOR SOCKET-ONLY

// These values are kept for compatibility but are largely unused in socket-only implementation
export const POLLING_INTERVALS = {
  // Legacy compatibility - most functionality now uses sockets
  GLOBAL_COUNTER: 60 * 1000, // 1 minute (used for fallback only)
  INBOX: 45 * 1000, // 45 seconds (used for fallback only)
  CONVERSATIONS: 5 * 1000, // 5 seconds (used for fallback only)
  CONVERSATIONS_BACKGROUND: 60 * 1000, // 1 minute (used for fallback only)
  ZONES: 5 * 60 * 1000, // 5 minutes (used for fallback only)

  // Socket fallback timeout
  SOCKET_FALLBACK_TIMEOUT: 30 * 1000, // 30 seconds before HTTP fallback
} as const;
