// src/app/components/threads/ThreadsList.tsx - Improved Design

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
          className="bg-white rounded-2xl shadow-sm p-6 animate-pulse border border-gray-200"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>

          {/* Message content skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>

          {/* Footer skeleton */}
          <div className="flex justify-between items-center">
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
    <div className="text-center py-16">
      <div className="text-8xl mb-6">💬</div>
      <h2 className="text-3xl font-bold mb-4 text-gray-700">
        Geen conversaties gevonden
      </h2>
      <p className="text-lg text-gray-500 mb-4">
        Er zijn nog geen conversaties in deze zone.
      </p>
      <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
}: ExtendedThreadsListProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh with force refresh
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
    return (
      <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        <EmptyThreadsState />
      </div>
    );
  }

  // Calculate total unread messages
  const totalUnreadCount = threads.reduce(
    (sum, thread) => sum + thread.unread_count,
    0
  );

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
        {/* Left side - Title and Stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Conversaties ({threads.length})
          </h2>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {totalUnreadCount > 0 && (
              <>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                  {totalUnreadCount} ongelezen
                </span>
                <span>•</span>
              </>
            )}
            <span>Alle actieve conversaties in deze zone</span>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Real-time status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
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
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
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
