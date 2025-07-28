"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useZonesContext } from "@/app/contexts/ZonesContext";
import { useInboxConversations } from "@/app/hooks/inbox/useInboxConversations";
import { InboxHeader } from "@/app/components/inbox/InboxHeader";
import { EmptyInboxState } from "@/app/components/inbox/EmptyInboxState";
import { InboxConversationCard } from "@/app/components/inbox/InboxConversationCard";

export default function InboxPage() {
  const params = useParams();
  const personId = params.personId as string;
  const { initialize } = useZonesContext();
  const { 
    unreadConversations, 
    isLoading, 
    totalUnreadCount,
    refetch 
  } = useInboxConversations(personId, "nl");

  useEffect(() => {
    if (personId) {
      initialize(personId, "nl");
    }
  }, [personId, initialize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#552e38]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f6f2] p-6">
      <div className="max-w-7xl mx-auto">
        <InboxHeader totalUnread={totalUnreadCount} />
        
        {unreadConversations.length === 0 ? (
          <EmptyInboxState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {unreadConversations.map((conversation) => (
              <InboxConversationCard
                key={conversation._id}
                conversation={conversation}
                personId={personId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}