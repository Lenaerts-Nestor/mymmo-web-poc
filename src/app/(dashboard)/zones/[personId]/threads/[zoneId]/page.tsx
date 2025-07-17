// src/app/(dashboard)/zones/[personId]/threads/[zoneId]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ThreadsList } from "@/app/components/threads/ThreadsList";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useThreads } from "@/app/hooks/useThreads";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";

export default function ThreadsPage() {
  const { personId, zoneId } = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const translationLang =
    searchParams.get("translationLang") ||
    user?.translationLang ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ThreadsContent
          personId={personId as string}
          zoneId={zoneId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ThreadsContent({
  personId,
  zoneId,
  translationLang,
}: {
  personId: string;
  zoneId: string;
  translationLang: string;
}) {
  const { threads, isLoading, error, refetch } = useThreads(
    personId,
    zoneId,
    translationLang
  );

  // Debug logging
  console.log("🔍 [THREADS] Debug info:", {
    personId,
    zoneId,
    translationLang,
    threadsCount: threads.length,
    isLoading,
    error,
    threads: threads.slice(0, 2), // Log first 2 threads
  });

  const handleThreadClick = (threadId: string) => {
    // For now, just log the click - messaging will be implemented later
    console.log("Thread clicked:", threadId);
    // TODO: Navigate to individual thread/conversation page
    // router.push(`/zones/${personId}/threads/${zoneId}/conversation/${threadId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Threads laden..." />
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
    <div className="w-full mx-auto">
      {/* Header info */}
      <div className="mb-6">
        <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Zone Conversaties
          </h1>
          <p className="text-gray-600 mb-2">
            Zone ID: {zoneId} | Persoon ID: {personId}
          </p>
          <p className="text-sm text-gray-500">
            Gevonden: {threads.length} threads | Translation: {translationLang}
          </p>
        </div>
      </div>

      {/* Threads list */}
      <ThreadsList
        threads={threads}
        currentPersonId={parseInt(personId)}
        isLoading={isLoading}
        onThreadClick={handleThreadClick}
      />
    </div>
  );
}
