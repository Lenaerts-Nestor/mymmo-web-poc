"use client";

import { MessageCircle, RefreshCw, Bell, Search } from "lucide-react"; // Added icons
import { Badge } from "@/components/ui/badge"; // Assuming shadcn Badge is available
import { ThreadCard } from "./ThreadCard";
import { useQueryClient } from "@tanstack/react-query"; // Keep this if you use React Query elsewhere
import { useState } from "react";
// import MyMMOApiThreads from "@/app/services/mymmo-thread-service/apiThreads"; // Commented out as it's not provided

import type { ThreadsListProps } from "@/app/types/threads";

// Updated interface to include highlighting and toggle
interface ExtendedThreadsListProps extends ThreadsListProps {
  highlightThreadId?: string | null;
  showAllThreads?: boolean; // 🆕 TOGGLE PROP
}

function ThreadsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#ffffff] rounded-2xl shadow-sm p-6 animate-pulse border border-[#cfc4c7]"
        >
          {" "}
          {/* pure-white, gravel-100 */}
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#cfc4c7] rounded-full"></div>{" "}
              {/* gravel-100 */}
              <div>
                <div className="h-4 bg-[#cfc4c7] rounded w-24 mb-1"></div>{" "}
                {/* gravel-100 */}
                <div className="h-3 bg-[#cfc4c7] rounded w-16"></div>{" "}
                {/* gravel-100 */}
              </div>
            </div>
            <div className="w-6 h-6 bg-[#cfc4c7] rounded-full"></div>{" "}
            {/* gravel-100 */}
          </div>
          {/* Message content skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-[#cfc4c7] rounded w-full mb-2"></div>{" "}
            {/* gravel-100 */}
            <div className="h-4 bg-[#cfc4c7] rounded w-3/4"></div>{" "}
            {/* gravel-100 */}
          </div>
          {/* Footer skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#cfc4c7] rounded-full"></div>{" "}
              {/* gravel-100 */}
              <div className="h-3 bg-[#cfc4c7] rounded w-20"></div>{" "}
              {/* gravel-100 */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🆕 EMPTY STATE COMPONENT - Updated for toggle context
function EmptyThreadsState({ showAllThreads }: { showAllThreads: boolean }) {
  return (
    <div className="text-center py-16 text-[#765860]">
      {" "}
      {/* gravel-500 */}
      <div className="text-6xl mb-6">
        {showAllThreads ? (
          <MessageCircle className="w-16 h-16 mx-auto text-[#a69298]" />
        ) : (
          <Bell className="w-16 h-16 mx-auto text-[#a69298]" />
        )}{" "}
        {/* gravel-300 */}
      </div>
      <h2 className="text-3xl font-bold mb-4 text-[#552e38]">
        {" "}
        {/* primary-wine */}
        {showAllThreads
          ? "Geen conversaties gevonden"
          : "Geen ongelezen conversaties"}
      </h2>
      <p className="text-lg text-[#765860] mb-4">
        {" "}
        {/* gravel-500 */}
        {showAllThreads
          ? "Er zijn nog geen conversaties in deze zone."
          : "Alle conversaties zijn gelezen. Gebruik 'Alle conversaties' om alle threads te bekijken."}
      </p>
      <div className="inline-flex items-center gap-2 text-sm text-[#765860] bg-[#f5f2de] px-4 py-2 rounded-full">
        {" "}
        {/* gravel-500, primary-offwhite */}
        <div className="w-2 h-2 bg-[#aced94] rounded-full animate-pulse"></div>{" "}
        {/* secondary-tea */}
        <span>Automatisch bijgewerkt</span>
      </div>
    </div>
  );
}

export function ThreadsList({
  threads,
  currentPersonId,
  isLoading,
  onThreadClick,
  highlightThreadId,
  showAllThreads = true, // 🆕 DEFAULT: Show all threads
}: ExtendedThreadsListProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh with force refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear threads cache first
      // MyMMOApiThreads.clearThreadsCache(); // Commented out as MyMMOApiThreads is not provided
      // Then invalidate React Query cache
      await queryClient.invalidateQueries({
        queryKey: ["threads"],
      });
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Optimistic update for unread count
  const handleThreadClick = (threadId: string) => {
    if (onThreadClick) {
      // Optimistically update unread count to 0
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

  if (isLoading) return <ThreadsListSkeleton />;

  // 🆕 APPLY FILTER: Filter threads based on toggle
  let filteredThreads = threads;
  if (!showAllThreads) {
    filteredThreads = threads.filter(
      (thread) => (thread.unread_count || (thread as any).unreadCount || 0) > 0
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        {" "}
        {/* pure-white/70 */}
        <EmptyThreadsState showAllThreads={showAllThreads} />
      </div>
    );
  }

  // Calculate total unread messages from filtered threads
  const totalUnreadCount = filteredThreads.reduce(
    (sum, thread) => sum + (thread.unread_count || (thread as any).unreadCount || 0),
    0
  );
  // Calculate statistics
  const threadsWithUnreadCount = filteredThreads.filter(
    (thread) => (thread.unread_count || (thread as any).unreadCount || 0) > 0
  ).length;

  return (
    <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      {" "}
      {/* pure-white/70 */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Left side - Title and Stats */}
        <div>
          <h2 className="text-2xl font-bold text-[#552e38] mb-2">
            {" "}
            {/* primary-wine */}
            {showAllThreads ? "Alle Conversaties" : "Ongelezen Conversaties"} (
            {filteredThreads.length})
          </h2>
          <div className="flex items-center gap-4 text-sm text-[#765860]">
            {" "}
            {/* gravel-500 */}
            {totalUnreadCount > 0 && (
              <>
                <Badge className="bg-[#b00205] text-[#ffffff] px-3 py-1 rounded-full font-bold">
                  {" "}
                  {/* error color */}
                  {totalUnreadCount} ongelezen
                </Badge>
                <span>•</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-[#b0c2fc]" />{" "}
              {/* secondary-lightblue */}
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
      {/* Threads grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredThreads.map((thread) => (
          <ThreadCard
            key={thread._id}
            thread={thread}
            currentPersonId={currentPersonId}
            onClick={handleThreadClick}
            isHighlighted={highlightThreadId === thread._id}
          />
        ))}
      </div>
    </div>
  );
}
