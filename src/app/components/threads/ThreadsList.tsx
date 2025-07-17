// src/app/components/threads/ThreadsList.tsx

import { ThreadsListProps } from "@/app/types/threads";
import { ThreadCard } from "./ThreadCard";

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
        Geen threads gevonden
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
}: ThreadsListProps) {
  if (isLoading) return <ThreadsListSkeleton />;

  if (threads.length === 0) {
    return <EmptyThreadsState />;
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Conversaties ({threads.length})
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threads.map((thread) => (
          <ThreadCard
            key={thread._id}
            thread={thread}
            currentPersonId={currentPersonId}
            onClick={onThreadClick}
          />
        ))}
      </div>
    </div>
  );
}
