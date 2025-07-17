// src/app/(dashboard)/conversations/[personId]/[zoneId]/page.tsx - Improved Design

"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThreadsList } from "@/app/components/threads/ThreadsList";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useThreads } from "@/app/hooks/useThreads";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";

export default function ConversationsPage() {
  const { personId, zoneId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const translationLang =
    searchParams.get("translationLang") ||
    user?.translationLang ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  // Handle case where no zone is selected
  if (!zoneId) {
    // Redirect to zones page for zone selection
    router.push(`/zones/${personId}`);
    return null;
  }

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ConversationsContent
          personId={personId as string}
          zoneId={zoneId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ConversationsContent({
  personId,
  zoneId,
  translationLang,
}: {
  personId: string;
  zoneId: string;
  translationLang: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightThreadId, setHighlightThreadId] = useState<string | null>(
    null
  );

  const { threads, isLoading, error, refetch } = useThreads(
    personId,
    zoneId,
    translationLang
  );

  // Handle thread highlighting from inbox navigation
  useEffect(() => {
    const highlightParam = searchParams.get("highlight");
    const storedHighlightId = localStorage.getItem("highlightThreadId");

    if (highlightParam) {
      setHighlightThreadId(highlightParam);
      // Clear the URL parameter after setting highlight
      const url = new URL(window.location.href);
      url.searchParams.delete("highlight");
      window.history.replaceState({}, "", url);
    } else if (storedHighlightId) {
      setHighlightThreadId(storedHighlightId);
    }

    // Clear localStorage highlight after a few seconds
    if (storedHighlightId) {
      const timeout = setTimeout(() => {
        localStorage.removeItem("highlightThreadId");
        setHighlightThreadId(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  // Store selected zone in localStorage for persistence
  useEffect(() => {
    localStorage.setItem("selectedZoneId", zoneId);
  }, [zoneId]);

  const handleThreadClick = (threadId: string) => {
    // For now, just log the click - messaging will be implemented later
    console.log("Thread clicked:", threadId);
    // TODO: Navigate to individual thread/conversation page
    // router.push(`/conversations/${personId}/${zoneId}/thread/${threadId}`);
  };

  const handleBackToZones = () => {
    router.push(`/zones/${personId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Conversaties laden..." />
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

  return (
    <div className="w-full min-h-screen">
      {/* Container with better width usage */}
      <div className="w-full px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <ConversationsHeader
            personId={personId}
            zoneId={zoneId}
            translationLang={translationLang}
            threadsCount={threads.length}
            highlightThreadId={highlightThreadId}
            onBackToZones={handleBackToZones}
          />
        </div>

        {/* Threads List Section */}
        <ThreadsList
          threads={threads}
          currentPersonId={parseInt(personId)}
          isLoading={isLoading}
          onThreadClick={handleThreadClick}
          highlightThreadId={highlightThreadId}
        />
      </div>
    </div>
  );
}

function ConversationsHeader({
  personId,
  zoneId,
  translationLang,
  threadsCount,
  highlightThreadId,
  onBackToZones,
}: {
  personId: string;
  zoneId: string;
  translationLang: string;
  threadsCount: number;
  highlightThreadId: string | null;
  onBackToZones: () => void;
}) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left side - Navigation and Title */}
        <div>
          <button
            onClick={onBackToZones}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-3 flex items-center space-x-2 transition-colors"
          >
            <span>←</span>
            <span>Terug naar zones</span>
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Conversaties
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Zone {zoneId}
            </span>
            <span>•</span>
            <span>{threadsCount} conversaties gevonden</span>
            <span>•</span>
            <span>Taal: {translationLang.toUpperCase()}</span>
          </div>

          {highlightThreadId && (
            <p className="text-sm text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block">
              🔍 Gemarkeerde conversatie: {highlightThreadId}
            </p>
          )}
        </div>

        {/* Right side - Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
