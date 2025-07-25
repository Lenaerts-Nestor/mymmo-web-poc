"use client";

import { MessageCircle, RefreshCw, Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationCard } from "./ConversationCard";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { EmptyConversationState } from "./EmptyConversationState";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [showAllThreads, threads.length]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);

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
          {totalPages > 1 && (
            <p className="text-sm text-[#765860] mb-2">
              Pagina {currentPage} van {totalPages} • Toont {startIndex + 1}-
              {Math.min(endIndex, filteredThreads.length)} van{" "}
              {filteredThreads.length} conversaties
            </p>
          )}
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
        {paginatedThreads.map((thread) => (
          <ConversationCard
            key={thread._id}
            thread={thread}
            currentPersonId={currentPersonId}
            onClick={handleConversationClick}
            isHighlighted={highlightThreadId === thread._id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <span className="flex h-9 w-9 items-center justify-center text-[#765860]">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
