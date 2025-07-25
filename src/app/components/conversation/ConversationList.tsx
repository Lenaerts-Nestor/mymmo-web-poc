"use client";

import { MessageCircle, RefreshCw, Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationCard } from "./ConversationCard";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { EmptyConversationState } from "./EmptyConversationState";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { ThreadsListProps } from "@/app/types/threads";

interface ExtendedConversationListProps extends ThreadsListProps {
  highlightThreadId?: string | null;
  showAllConversation?: boolean; // 🆕 TOGGLE PROP
}

// ...existing code...

export function ConversationsList({
  threads,
  currentPersonId,
  isLoading,
  onThreadClick,
  highlightThreadId,
  showAllConversation: showAllThreads = true,
}: ExtendedConversationListProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConversationClick = (threadId: string) => {
    if (onThreadClick) {
      queryClient.setQueryData(
        ["threads", currentPersonId.toString()],
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((thread: any) =>
              thread._id === threadId
                ? { ...thread, unread_count: 0, unreadCount: 0, dot: false }
                : thread
            ),
          };
        }
      );
      onThreadClick(threadId);
    }
  };

  if (isLoading) return <ConversationListSkeleton />;

  let filteredThreads = threads;
  if (!showAllThreads) {
    filteredThreads = threads.filter(
      (thread) => (thread.unread_count || (thread as any).unreadCount || 0) > 0
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        <EmptyConversationState showAllConversations={showAllThreads} />
      </div>
    );
  }

  const totalUnreadCount = filteredThreads.reduce(
    (sum, thread) =>
      sum + (thread.unread_count || (thread as any).unreadCount || 0),
    0
  );
  const threadsWithUnreadCount = filteredThreads.filter(
    (thread) => (thread.unread_count || (thread as any).unreadCount || 0) > 0
  ).length;

  return (
    <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#552e38] mb-2">
            {showAllThreads ? "Alle Conversaties" : "Ongelezen Conversaties"} (
            {filteredThreads.length})
          </h2>
          <div className="flex items-center gap-4 text-sm text-[#765860]">
            {totalUnreadCount > 0 && (
              <>
                <Badge className="bg-[#b00205] text-[#ffffff] px-3 py-1 rounded-full font-bold">
                  {totalUnreadCount} ongelezen
                </Badge>
                <span>•</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-[#b0c2fc]" />{" "}
              <span>
                {threadsWithUnreadCount} van {threads.length} conversaties heeft
                ongelezen berichten
              </span>
            </div>
            {!showAllThreads && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Search className="w-4 h-4 text-[#a69298]" />{" "}
                  {/* gravel-300 */}
                  <span>Gefilterd op ongelezen</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredThreads.map((thread) => (
          <ConversationCard
            key={thread._id}
            thread={thread}
            currentPersonId={currentPersonId}
            onClick={handleConversationClick}
            isHighlighted={highlightThreadId === thread._id}
          />
        ))}
      </div>
    </div>
  );
}
