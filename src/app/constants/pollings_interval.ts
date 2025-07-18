// src/app/constants/pollings_interval.ts - OPTIMIZED FOR REAL-TIME CHAT

//! 🚀 REAL-TIME OPTIMIZED POLLING INTERVALS
//! Deze intervallen zijn geoptimaliseerd voor smooth real-time chat experience
//!
//! 🎛️  BOSS CONTROLS: Verhoog/verlaag deze waardes om API load te beheersen
//! ⚡ Lagere waardes = sneller updates maar meer API calls
//! 🐌 Hogere waardes = langzamer updates maar minder API load

export const POLLING_INTERVALS = {
  // 🔄 GLOBAL COUNTER (Sidebar red numbers)
  // Moderate interval for global updates
  GLOBAL_COUNTER: 45 * 1000, // 45 seconden - sidebar unread counts

  // 📬 INBOX PAGE
  // Regular interval for inbox refresh
  INBOX: 30 * 1000, // 30 seconden - inbox pagina refresh

  // 💬 CONVERSATIONS (Active chat) - MOST IMPORTANT FOR REAL-TIME
  // ⚡ ULTRA FAST for active chat to feel instant
  CONVERSATIONS: 3 * 1000, // 3 seconden - active chat ULTRA real-time

  // 💬 CONVERSATIONS BACKGROUND (Chat not in focus)
  // Slower when chat is not actively being viewed
  CONVERSATIONS_BACKGROUND: 30 * 1000, // 30 seconden - background chat refresh

  // 🗺️ ZONES PAGE
  // Longer interval since zones change less frequently
  ZONES: 5 * 60 * 1000, // 5 minuten - zones refresh
} as const;

// 🎯 CONTEXT-AWARE POLLING HELPER
// 🔧 FIXED: Consistent lowercase context strings
export const getContextualPollingInterval = (
  context: "active-chat" | "background-chat" | "other"
) => {
  switch (context) {
    case "active-chat":
      return POLLING_INTERVALS.CONVERSATIONS; // 3s voor ultra real-time
    case "background-chat":
      return POLLING_INTERVALS.CONVERSATIONS_BACKGROUND; // 30s voor background
    case "other":
    default:
      return false; // Stop polling voor andere pagina's
  }
};

// 🆕 CONTEXT HELPER: Get consistent context string
export const getPollingContext = (
  isVisible: boolean,
  isUserActive: boolean,
  isActivePage: boolean
): "active-chat" | "background-chat" | "other" => {
  if (!isVisible) return "other"; // Tab hidden = no polling
  if (!isUserActive) return "background-chat"; // User idle = slow polling
  if (isActivePage) return "active-chat"; // Active chat = fast polling
  return "background-chat"; // Default = slow polling
};

// 📊 API LOAD ANALYSIS:
// Voor 1 gebruiker met 1 active chat tab:
//
// ✅ OPTIMIZED FOR REAL-TIME CHAT:
// - Active chat: 1 tab × 1200 calls/uur = 1200 calls/uur (3s interval)
// - Background polling: Stops when tab not active
// - Global counter: 1 tab × 80 calls/uur = 80 calls/uur (45s interval)
// - Inbox: 1 tab × 120 calls/uur = 120 calls/uur (30s interval)
// - Totaal actieve chat: ~1400 calls/uur
//
// 🎯 SMART FEATURES:
// - Polling stops when tab is hidden
// - Polling slows down when user is idle
// - Optimistic updates reduce perceived latency
// - Cache invalidation ensures immediate updates
//
// 🏆 Trade-off: Meer API calls voor active chat, maar veel betere UX
// 💡 Boss can increase CONVERSATIONS interval to 5s if API load too high
