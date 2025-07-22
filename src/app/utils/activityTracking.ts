// src/app/utils/activityTracking.ts - Activity Tracking Utilities

import { useEffect, useState } from "react";
import { ActivityState } from "../types/polling";

/**
 * Hook to track user activity and page visibility
 */
export function useActivityTracking(
  idleTimeoutMs: number = 3 * 60 * 1000
): ActivityState {
  const [isVisible, setIsVisible] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);
  const [isActivePage, setIsActivePage] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Page visibility:", visible ? "VISIBLE" : "HIDDEN");
      }
    };

    // Track user activity for smart polling
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      setIsUserActive(true);
      clearTimeout(idleTimer);
      // User is idle after specified timeout
      idleTimer = setTimeout(() => setIsUserActive(false), idleTimeoutMs);
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    // Activity event listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Register event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initialize
    resetIdleTimer();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(idleTimer);
    };
  }, [idleTimeoutMs]);

  return {
    isVisible,
    isUserActive,
    isActivePage,
  };
}

/**
 * Hook to track if current page is an active chat page
 */
export function useActiveChatPage(): boolean {
  const [isActivePage, setIsActivePage] = useState(false);

  useEffect(() => {
    const updateActivePageState = () => {
      const pathname = window.location.pathname;
      const isConversationPage =
        pathname.includes("/conversations/") && pathname.includes("/thread/");
      setIsActivePage(isConversationPage);
    };

    // Initial check
    updateActivePageState();

    // Listen for URL changes
    window.addEventListener("popstate", updateActivePageState);

    return () => {
      window.removeEventListener("popstate", updateActivePageState);
    };
  }, []);

  return isActivePage;
}
