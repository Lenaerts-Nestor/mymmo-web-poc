// src/app/(dashboard)/inbox/[personId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";

import { useInbox } from "@/app/hooks/useInbox";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";
import { InboxList } from "@/app/components/inbox/inboxList";
import { InboxHeader } from "@/app/components/inbox/inboxHeader";

export default function InboxPage() {
  const { personId } = useParams();
  const { user } = useUser();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <InboxContent
          personId={personId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function InboxContent({
  personId,
  translationLang,
}: {
  personId: string;
  translationLang: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { inboxData, isLoading, error, refetch } = useInbox(
    personId,
    translationLang
  );

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      // Clear cache and refetch
      await queryClient.invalidateQueries({
        queryKey: ["inbox", personId, translationLang],
      });
      await refetch();
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Handle item click - navigate to conversations page for that zone
  const handleItemClick = (zoneId: number, threadId: string) => {
    localStorage.setItem("selectedZoneId", zoneId.toString());
    localStorage.setItem("highlightThreadId", threadId);

    router.push(`/conversations/${personId}/${zoneId}?highlight=${threadId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Inbox laden..." />
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
      <InboxHeader
        totalUnreadCount={inboxData.totalUnreadCount}
        lastUpdated={inboxData.lastUpdated}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isManualRefreshing}
      />

      <InboxList
        inboxData={inboxData}
        isLoading={isLoading}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
