export type PollingContext = "active-chat" | "background-chat" | "other";

export interface ActivityState {
  isVisible: boolean;
  isUserActive: boolean;
  isActivePage: boolean;
}

export interface PollingConfig {
  interval: number | false;
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnMount: boolean;
  refetchIntervalInBackground: boolean;
}

export interface UsePollingOptions {
  baseInterval: number;
  socketConnected?: boolean;
  context?: PollingContext;
  enabled?: boolean;
}
