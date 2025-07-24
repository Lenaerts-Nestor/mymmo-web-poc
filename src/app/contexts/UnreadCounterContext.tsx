// src/app/contexts/UnreadCounterContext.tsx

"use client";
import React, { createContext, useContext, useMemo } from "react";
import { useZonesContext } from "./ZonesContext";
import { useUser } from "./UserContext";
import { APP_CONFIG } from "../constants/app";

interface UnreadCounterContextType {
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const UnreadCounterContext = createContext<
  UnreadCounterContextType | undefined
>(undefined);

export function UnreadCounterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { zones, isLoading, error, refetch } = useZonesContext();

  // Calculate total unread count from zones data
  const totalUnreadCount = useMemo(() => {
    return zones.reduce((total, zone) => total + zone.unreadCount, 0);
  }, [zones]);

  return (
    <UnreadCounterContext.Provider
      value={{
        totalUnreadCount,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </UnreadCounterContext.Provider>
  );
}

export function useUnreadCounter() {
  const context = useContext(UnreadCounterContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadCounter must be used within a UnreadCounterProvider"
    );
  }
  return context;
}
