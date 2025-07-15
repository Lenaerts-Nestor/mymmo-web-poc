export const APP_CONFIG = {
  DEFAULT_LANGUAGE: "nl",
  DEFAULT_TRANSLATION_LANGUAGE: "nl",
} as const;

export const UI_MESSAGES = {
  LOADING: {
    ZONES: "Zones laden...",
    SESSION: "Sessie valideren...",
  },
  ERROR: {
    ZONES_FETCH: "Fout bij het laden van zones. Probeer het opnieuw.",
    GENERIC: "Er is een fout opgetreden",
    UNAUTHORIZED: "Geen toegang tot deze gegevens",
    SESSION_EXPIRED: "Sessie verlopen. Log opnieuw in.",
  },
  EMPTY_STATES: {
    NO_ZONES: "Geen zones gevonden voor deze persoon.",
  },
} as const;
