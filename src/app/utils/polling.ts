// src/app/utils/polling.ts - Polling Utilities

import { POLLING_INTERVALS } from "../constants/pollings_interval";
import { PollingContext, ActivityState, PollingConfig } from "../types/polling";

/**
 * Get contextual polling interval based on user activity
 */
export function getContextualPollingInterval(
  context: PollingContext
): number | false {
  switch (context) {
    case "active-chat":
      return POLLING_INTERVALS.CONVERSATIONS; // 5s
    case "background-chat":
      return POLLING_INTERVALS.CONVERSATIONS_BACKGROUND; // 60s
    case "other":
    default:
      return false; // Stop polling for other pages
  }
}

/**
 * Get consistent polling context string
 */
export function getPollingContext(
  activityState: ActivityState
): PollingContext {
  const { isVisible, isUserActive, isActivePage } = activityState;

  if (!isVisible) return "other"; // Tab hidden = no polling
  if (!isUserActive) return "background-chat"; // User idle = slow polling
  if (isActivePage) return "active-chat"; // Active chat = fast polling
  return "background-chat"; // Default = slow polling
}

/**
 * Calculate optimized polling interval when socket is connected
 */
export function getOptimizedInterval(
  baseInterval: number | false,
  isSocketConnected: boolean,
  reduction: number = 10
): number | false {
  if (!baseInterval) return false;
  if (!isSocketConnected) return baseInterval;

  // Reduce polling by specified factor when socket is active
  return baseInterval * reduction;
}

/**
 * Generate polling configuration for React Query
 */
export function createPollingConfig(
  interval: number | false,
  isSocketConnected: boolean = false,
  isActivePage: boolean = false
): PollingConfig {
  const staleTime = isSocketConnected
    ? isActivePage
      ? 30 * 1000
      : 60 * 1000
    : isActivePage
    ? 0
    : 30 * 1000;

  return {
    interval,
    staleTime,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchIntervalInBackground: false,
  };
}
