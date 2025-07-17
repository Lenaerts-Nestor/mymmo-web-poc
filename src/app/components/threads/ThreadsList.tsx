// src/app/components/threads/ThreadsList.tsx - Updated with highlighting

import { ThreadsListProps } from "@/app/types/threads";
import { ThreadCard } from "./ThreadCard";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import MyMMOApiThreads from "@/app/services/mymmo-thread-service/apiThreads";

// Updated interface to include highlighting
interface ExtendedThreadsListProps extends ThreadsListProps {
  highlightThreadId?: string | null;
}

function ThreadsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 animate-pulse border border-gray-200"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>

          {/* Message content skeleton */}
          <div className="mb-2">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>

          {/* Footer skeleton */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyThreadsState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-6xl mb-6">💬</div>
      <p className="text-2xl font-bold mb-3 text-gray-700">
        Geen conversaties gevonden
      </p>
      <p className="text-lg text-gray-500">
        Er zijn nog geen conversaties in deze zone.
      </p>
    </div>
  );
}

export function ThreadsList({
  threads,
  currentPersonId,
  isLoading,
  onThreadClick,
  highlightThreadId,
}: ExtendedThreadsListProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // OPTIMIZED: Manual refresh with force refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear threads cache first
      MyMMOApiThreads.clearThreadsCache();

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

  // OPTIMIZED: Optimistic update for unread count
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
                ? { ...thread, unread_count: 0, dot: false }
                : thread
            ),
          };
        }
      );

      onThreadClick(threadId);
    }
  };

  if (isLoading) return <ThreadsListSkeleton />;

  if (threads.length === 0) {
    return <EmptyThreadsState />;
  }

  // Calculate total unread messages
  const totalUnreadCount = threads.reduce(
    (sum, thread) => sum + thread.unread_count,
    0
  );

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      {/* OPTIMIZED: Header with real-time status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Conversaties ({threads.length})
          </h2>

          {/* Real-time status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>

          {/* Unread count badge */}
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
              {totalUnreadCount} ongelezen
            </span>
          )}
        </div>

        {/* Manual refresh button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isRefreshing
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Threads grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threads.map((thread) => (
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
