"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationsHeader } from "./ConversationsHeader";
import { ConversationsToggle } from "./ConversationsToggle";
import { ConversationsList } from "@/app/components/conversation/ConversationList";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useThreads } from "@/app/hooks/threads/useThreads";
import { APP_CONFIG } from "@/app/constants/app";
import { useUser } from "@/app/contexts/UserContext";
import { useZonesContext } from "@/app/contexts/ZonesContext";

interface ConversationsContentProps {
  personId: string;
  zoneId: string;
  translationLang: string;
}

export function ConversationsContent({
  personId,
  zoneId,
  translationLang,
}: ConversationsContentProps) {
  // Always call hooks at the top level
  const { zones } = useZonesContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightThreadId, setHighlightThreadId] = useState<string | null>(
    null
  );
  const [showAllThreads, setShowAllThreads] = useState(true);
  const [isActivePage, setIsActivePage] = useState(true);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight) {
      setHighlightThreadId(highlight);
      const storedHighlight =
        typeof window !== "undefined"
          ? localStorage.getItem("highlightThreadId")
          : null;
      if (storedHighlight && typeof window !== "undefined") {
        localStorage.removeItem("highlightThreadId");
      }
      const timer = setTimeout(() => {
        setHighlightThreadId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    const storedHighlight =
      typeof window !== "undefined"
        ? localStorage.getItem("highlightThreadId")
        : null;
    if (storedHighlight && typeof window !== "undefined") {
      setHighlightThreadId(storedHighlight);
      localStorage.removeItem("highlightThreadId");
      const timer = setTimeout(() => {
        setHighlightThreadId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleFocus = () => setIsActivePage(true);
    const handleBlur = () => setIsActivePage(false);
    const handleVisibilityChange = () => {
      setIsActivePage(!document.hidden);
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (zoneId && typeof window !== "undefined") {
      localStorage.setItem("selectedZoneId", zoneId);
    }
  }, [zoneId]);

  const { threads, isLoading, error, refetch } = useThreads(
    personId,
    zoneId,
    translationLang,
    isActivePage
  );

  const handleThreadClick = (threadId: string) => {
    router.push(`/conversations/${personId}/${zoneId}/thread/${threadId}`);
  };

  const handleBackToZones = () => {
    router.push(`/zones/${personId}`);
  };

  const handleToggleChange = (showAll: boolean) => {
    setShowAllThreads(showAll);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  // Get zone name from context
  const zoneObj = zones.find((z) => String(z.zoneId) === String(zoneId));
  const zoneName = zoneObj?.name;

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <ConversationsHeader
            personId={personId}
            zoneId={zoneId}
            translationLang={translationLang}
            threadsCount={threads.length}
            highlightThreadId={highlightThreadId}
            onBackToZones={handleBackToZones}
            isActivePage={isActivePage}
            zoneName={zoneName}
          />
        </div>
        <div className="mb-6">
          <ConversationsToggle
            showAllThreads={showAllThreads}
            onToggleChange={handleToggleChange}
          />
        </div>
        <ConversationsList
          threads={threads}
          currentPersonId={parseInt(personId)}
          isLoading={isLoading}
          onThreadClick={handleThreadClick}
          highlightThreadId={highlightThreadId}
          showAllConversation={showAllThreads}
        />
      </div>
    </div>
  );
}
