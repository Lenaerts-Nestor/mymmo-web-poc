// src/app/contexts/UnreadCounterContext.tsx

"use client";
import React, { createContext, useContext } from "react";
import { useGlobalUnreadCounter } from "../hooks/useGlobalUnreadCounter";
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
  const { user, isLoading: userLoading } = useUser();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  const { totalUnreadCount, isLoading, error, refetch } =
    useGlobalUnreadCounter(
      user?.personId || "",
      translationLang,
      !!user && !userLoading // Only enable polling if user exists and is not loading
    );

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
