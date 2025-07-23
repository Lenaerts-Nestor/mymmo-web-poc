// src/app/(dashboard)/inbox/[personId]/page.tsx - Responsive Design

"use client";

import { useParams, useRouter } from "next/navigation";

import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";

import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";
import { InboxList } from "@/app/components/inbox/inboxList";
import { InboxHeader } from "@/app/components/inbox/inboxHeader";
import { useSocketInbox } from "@/app/hooks/inbox/useSocketInbox";

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

  const { inboxData, isLoading, error, refetch } = useSocketInbox(
    personId,
    translationLang
  );

  // Handle item click - navigate to conversations page for that zone
  const handleItemClick = (zoneId: number, threadId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedZoneId", zoneId.toString());
      localStorage.setItem("highlightThreadId", threadId);
    }

    router.push(`/conversations/${personId}/${zoneId}?highlight=${threadId}`);
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
          <InboxHeader
            totalUnreadCount={inboxData.totalUnreadCount}
            lastUpdated={inboxData.lastUpdated}
          />
        </div>

        {/* Inbox List Section */}
        <InboxList
          inboxData={inboxData}
          isLoading={isLoading}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
}
