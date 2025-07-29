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

  return (
    <div className="min-h-screen bg-[#f9f6f2] p-6">
      <div className="max-w-7xl mx-auto">
        <InboxHeader totalUnread={totalUnreadCount} />
        
        {/* Cards Area with Loading Overlay */}
        <div className="relative mt-6">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#552e38]"></div>
                <p className="text-sm text-[#552e38] font-medium">Laden van ongelezen berichten...</p>
              </div>
            </div>
          )}
          
          {unreadConversations.length === 0 && !isLoading ? (
            <EmptyInboxState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}