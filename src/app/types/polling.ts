// src/app/types/polling.ts - Polling Type Definitions

// Polling context types
export type PollingContext = "active-chat" | "background-chat" | "other";

// Activity state interface
export interface ActivityState {
  isVisible: boolean;
  isUserActive: boolean;
  isActivePage: boolean;
}

// Polling configuration
export interface PollingConfig {
  interval: number | false;
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnMount: boolean;
  refetchIntervalInBackground: boolean;
}

// Use polling hook options
export interface UsePollingOptions {
  baseInterval: number;
  socketConnected?: boolean;
  context?: PollingContext;
  enabled?: boolean;
}
