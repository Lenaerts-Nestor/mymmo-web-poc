//! PERFORMANCE OPTIMIZED POLLING INTERVALS
//! Hier bepaal je de pollings intervallen voor de verschillende hooks
//! Deze intervallen worden gebruikt in de hooks om de data te verversen
//!
//! 🎛️  BOSS CONTROLS: Verhoog/verlaag deze waardes om API load te beheersen
//! ⚡ Lagere waardes = sneller updates maar meer API calls
//! 🐌 Hogere waardes = langzamer updates maar minder API load

export const POLLING_INTERVALS = {
  // 🔄 GLOBAL COUNTER (Sidebar red numbers)
  // Was: 30s -> Nu: 60s (Boss: verhoog naar 90s of 120s indien gewenst)
  GLOBAL_COUNTER: 60 * 1000, // 60 seconden - voor sidebar unread counts

  // 📬 INBOX PAGE
  // Was: 30s -> Nu: 45s (Boss: verhoog naar 60s voor minder API load)
  INBOX: 45 * 1000, // 45 seconden - inbox pagina refresh

  // 💬 CONVERSATIONS (Active chat)
  // Was: 30s -> Nu: 5s voor real-time gevoel (Boss: verhoog naar 10s indien gewenst)
  CONVERSATIONS: 5 * 1000, // 5 seconden - active chat real-time

  // 💬 CONVERSATIONS BACKGROUND (Chat not in focus)
  // Nieuw: Voor chat threads die niet actief bekeken worden
  CONVERSATIONS_BACKGROUND: 60 * 1000, // 60 seconden - background chat refresh

  // 🗺️ ZONES PAGE
  // Was: 30s -> Nu: 10 minuten (zones veranderen zelden)
  ZONES: 10 * 60 * 1000, // 10 minuten - zones refresh
} as const;

// 🎯 CONTEXT-AWARE POLLING HELPER
// Deze functie bepaalt welk interval te gebruiken op basis van pagina context
export const getContextualPollingInterval = (
  context: "active-chat" | "background-chat" | "other"
) => {
  switch (context) {
    case "active-chat":
      return POLLING_INTERVALS.CONVERSATIONS; // 5s voor real-time
    case "background-chat":
      return POLLING_INTERVALS.CONVERSATIONS_BACKGROUND; // 60s voor background
    case "other":
    default:
      return false; // Stop polling voor andere pagina's
  }
};

// 📊 API LOAD VERGELIJKING:
// Voor 1 gebruiker met 3 tabs open:
//
// ❌ VOOR OPTIMALISATIE (30s interval):
// - 4 hooks × 3 tabs × 120 calls/uur = 1,440 API calls/uur
//
// ✅ NA OPTIMALISATIE:
// - Global counter: 1 tab × 60 calls/uur = 60 calls/uur
// - Active chat: 1 tab × 720 calls/uur = 720 calls/uur
// - Background: 2 tabs × 60 calls/uur = 120 calls/uur
// - Totaal: 900 calls/uur (37% reductie!)
//
// 🏆 Voor 10 gebruikers: 14,400 → 9,000 calls/uur (4,500 calls minder!)
