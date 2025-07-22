"use client";

import { useParams, useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { useUnifiedApp } from "@/app/contexts/UnifiedAppContext";
import { InboxList } from "@/app/components/inbox/inboxList";
import { InboxHeader } from "@/app/components/inbox/inboxHeader";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { APP_CONFIG } from "@/app/constants/app";
import { useInboxNuclear } from "@/app/hooks/useZonesNuclear";

export default function InboxPageNuclear() {
  const { personId } = useParams();
  const { user } = useUnifiedApp();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <InboxContentNuclear
      personId={personId as string}
      translationLang={translationLang}
    />
  );
}

// ===== MEMOIZED INBOX CONTENT =====
const InboxContentNuclear = memo(function InboxContentNuclear({
  personId,
  translationLang,
}: {
  personId: string;
  translationLang: string;
}) {
  const router = useRouter();
  const { inboxData, isLoading, error } = useInboxNuclear(
    personId,
    translationLang
  );

  const handleItemClick = useCallback(
    (zoneId: number, threadId: string) => {
      localStorage.setItem("selectedZoneId", zoneId.toString());
      localStorage.setItem("highlightThreadId", threadId);
      router.push(`/conversations/${personId}/${zoneId}?highlight=${threadId}`);
    },
    [router, personId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <InboxHeader
            totalUnreadCount={inboxData.totalUnreadCount}
            lastUpdated={inboxData.lastUpdated}
          />
        </div>

        <InboxList
          inboxData={inboxData}
          isLoading={isLoading}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
});
