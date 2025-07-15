export const APP_CONFIG = {
  DEFAULT_LANGUAGE: "nl",
  DEFAULT_TRANSLATION_LANGUAGE: "nl",
} as const;

export const UI_MESSAGES = {
  LOADING: {
    ZONES: "Zones laden...",
  },
  ERROR: {
    ZONES_FETCH: "Fout bij het laden van zones. Probeer het opnieuw.",
    GENERIC: "Er is een fout opgetreden",
  },
  EMPTY_STATES: {
    NO_ZONES: "Geen zones gevonden voor deze persoon.",
  },
} as const;
