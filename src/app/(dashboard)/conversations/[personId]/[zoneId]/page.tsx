// src/app/(dashboard)/conversations/[personId]/[zoneId]/page.tsx - FIXED CONTEXT

"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThreadsList } from "@/app/components/threads/ThreadsList";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useThreads } from "@/app/hooks/threads/useThreads";
import { useUnifiedApp } from "@/app/contexts/UnifiedAppContext"; // FIXED: Use unified context
import { APP_CONFIG } from "@/app/constants/app";

export default function ConversationsPage() {
  const { personId, zoneId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUnifiedApp(); // FIXED: Use unified context

  // Wait for user context to be ready
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading user session...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const translationLang =
    searchParams.get("translationLang") ||
    user.translationLang ||
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

  // 🆕 TOGGLE STATE: Voor alle vs alleen ongelezen conversaties
  const [showAllThreads, setShowAllThreads] = useState(true); // Standaard alle threads

  // 🎯 PERFORMANCE: Track if this is an active chat page
  const [isActivePage, setIsActivePage] = useState(true);

  // Handle highlight from inbox navigation
  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight) {
      setHighlightThreadId(highlight);

      // Clear highlight from localStorage if it exists
      const storedHighlight = localStorage.getItem("highlightThreadId");
      if (storedHighlight) {
        localStorage.removeItem("highlightThreadId");
      }

      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightThreadId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Check for highlight in localStorage (from inbox)
    const storedHighlight = localStorage.getItem("highlightThreadId");
    if (storedHighlight) {
      setHighlightThreadId(storedHighlight);
      localStorage.removeItem("highlightThreadId");

      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightThreadId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 🎯 PERFORMANCE: Track page activity for smart polling
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

  // 🎯 FIX: Update localStorage with current zoneId when page loads
  useEffect(() => {
    if (zoneId) {
      console.log(
        "🔍 [CONVERSATIONS] Updating localStorage with current zoneId:",
        zoneId
      );
      localStorage.setItem("selectedZoneId", zoneId);
    }
  }, [zoneId]);

  // 🎯 OPTIMIZED: Use context-aware polling for threads
  const { threads, isLoading, error, refetch } = useThreads(
    personId,
    zoneId,
    translationLang,
    isActivePage // Pass activity context for smart polling
  );

  const handleThreadClick = (threadId: string) => {
    // Navigate to specific thread
    router.push(`/conversations/${personId}/${zoneId}/thread/${threadId}`);
  };

  const handleBackToZones = () => {
    router.push(`/zones/${personId}`);
  };

  // 🆕 TOGGLE HANDLER
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
            isActivePage={isActivePage}
          />
        </div>

        {/* 🆕 TOGGLE SECTION */}
        <div className="mb-6">
          <ConversationsToggle
            showAllThreads={showAllThreads}
            onToggleChange={handleToggleChange}
          />
        </div>

        {/* Threads List Section */}
        <ThreadsList
          threads={threads}
          currentPersonId={parseInt(personId)}
          isLoading={isLoading}
          onThreadClick={handleThreadClick}
          highlightThreadId={highlightThreadId}
          showAllThreads={showAllThreads} // 🆕 PASS TOGGLE STATE
        />
      </div>
    </div>
  );
}

// CONVERSATIONS HEADER COMPONENT (unchanged)
function ConversationsHeader({
  personId,
  zoneId,
  translationLang,
  threadsCount,
  highlightThreadId,
  onBackToZones,
  isActivePage,
}: {
  personId: string;
  zoneId: string;
  translationLang: string;
  threadsCount: number;
  highlightThreadId: string | null;
  onBackToZones: () => void;
  isActivePage: boolean;
}) {
  return (
    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Conversaties
          </h1>
          <div className="flex items-center gap-4 text-sm text-stone-600">
            <span>
              {threadsCount} thread{threadsCount === 1 ? "" : "s"}
            </span>
            {highlightThreadId && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Nieuw bericht gemarkeerd
              </span>
            )}
            {/* 🎯 PERFORMANCE: Show polling status in development */}
            {process.env.NODE_ENV === "development" && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActivePage
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isActivePage
                  ? "⚡ Fast polling (5s)"
                  : "🐌 Slow polling (60s)"}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onBackToZones}
          className="px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
        >
          ← Terug naar zones
        </button>
      </div>
    </div>
  );
}

// 🆕 CONVERSATIONS TOGGLE COMPONENT
function ConversationsToggle({
  showAllThreads,
  onToggleChange,
}: {
  showAllThreads: boolean;
  onToggleChange: (showAll: boolean) => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggleChange(!showAllThreads);

    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-4 w-full max-w-xl">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Conversatie weergave:
        </span>

        <div className="flex items-center space-x-3">
          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showAllThreads ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm ${
                showAllThreads ? "translate-x-7" : "translate-x-1"
              } ${isAnimating ? "scale-105" : ""}`}
            />
          </button>

          {/* Labels */}
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm ${
                !showAllThreads
                  ? "font-semibold text-gray-900"
                  : "text-gray-500"
              }`}
            >
              💬 Alleen ongelezen conversaties
            </span>
            <span className="text-gray-300">|</span>
            <span
              className={`text-sm ${
                showAllThreads ? "font-semibold text-gray-900" : "text-gray-500"
              }`}
            >
              📋 Alle conversaties
            </span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-2 text-xs text-gray-500">
        {showAllThreads
          ? "Alle conversaties worden getoond"
          : "Alleen conversaties met ongelezen berichten worden getoond"}
      </div>
    </div>
  );
}
