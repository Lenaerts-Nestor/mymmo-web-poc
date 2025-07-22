// src/app/hooks/threads/useThreadPolling.ts - Thread Polling Logic

"use client";

import { useEffect } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import {
  useActivityTracking,
  useActiveChatPage,
} from "../../utils/activityTracking";
import {
  getPollingContext,
  getContextualPollingInterval,
  getOptimizedInterval,
  createPollingConfig,
} from "../../utils/polling";
import { PollingConfig } from "../../types/polling";

interface UseThreadPollingOptions {
  enabled?: boolean;
  onThreadUpdate?: (data: any) => void;
}

interface UseThreadPollingResult extends PollingConfig {
  pollingContext: string;
  isSocketConnected: boolean;
  socketStatus: string;
}

export function useThreadPolling({
  enabled = true,
  onThreadUpdate,
}: UseThreadPollingOptions = {}): UseThreadPollingResult {
  const {
    isConnected,
    status,
    onThreadUpdate: socketOnThreadUpdate,
    offThreadUpdate,
  } = useSocketContext();

  // Activity tracking
  const activityState = useActivityTracking(2 * 60 * 1000); // 2 minutes idle timeout
  const isActiveChatPage = useActiveChatPage();

  // Get polling context
  const pollingContext = getPollingContext({
    ...activityState,
    isActivePage: isActiveChatPage,
  });

  // Calculate polling interval
  const baseInterval = getContextualPollingInterval(pollingContext);
  const optimizedInterval = getOptimizedInterval(baseInterval, isConnected, 5);

  // Create polling configuration
  const pollingConfig = createPollingConfig(
    optimizedInterval,
    isConnected,
    isActiveChatPage
  );

  // Register socket thread update listener
  useEffect(() => {
    if (!enabled || !onThreadUpdate) return;

    socketOnThreadUpdate(onThreadUpdate);
    return () => offThreadUpdate(onThreadUpdate);
  }, [enabled, onThreadUpdate, socketOnThreadUpdate, offThreadUpdate]);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && enabled) {
      console.log("🔍 [THREAD_POLLING] Configuration:", {
        context: pollingContext,
        baseInterval,
        optimizedInterval,
        socketConnected: isConnected,
        socketStatus: status,
        activityState,
      });
    }
  }, [
    pollingContext,
    baseInterval,
    optimizedInterval,
    isConnected,
    status,
    activityState,
    enabled,
  ]);

  return {
    ...pollingConfig,
    pollingContext,
    isSocketConnected: isConnected,
    socketStatus: status,
  };
}
