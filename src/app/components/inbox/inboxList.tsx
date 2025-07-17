// src/app/components/inbox/InboxList.tsx

import { InboxData } from "@/app/types/inbox";
import { InboxCard } from "./inboxCard";

interface InboxListProps {
  inboxData: InboxData;
  isLoading: boolean;
  onItemClick: (zoneId: number, threadId: string) => void;
}

function InboxListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          {/* Zone Header skeleton */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 bg-gray-300 rounded-full w-12"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>

          {/* Message Content skeleton */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyInboxState() {
  return (
    <div className="text-center py-16 text-gray-500">
      <div className="text-8xl mb-6">📬</div>
      <p className="text-3xl font-bold mb-4 text-gray-700">Inbox is leeg</p>
      <p className="text-lg text-gray-500 mb-2">
        Geen ongelezen berichten gevonden.
      </p>
      <p className="text-sm text-gray-400">
        Nieuwe berichten verschijnen hier automatisch.
      </p>
    </div>
  );
}

export function InboxList({
  inboxData,
  isLoading,
  onItemClick,
}: InboxListProps) {
  if (isLoading) {
    return (
      <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
        <InboxListSkeleton />
      </div>
    );
  }

  if (inboxData.items.length === 0) {
    return (
      <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
        <EmptyInboxState />
      </div>
    );
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ongelezen berichten ({inboxData.items.length})
        </h2>
        <p className="text-gray-600 text-sm">
          Berichten uit alle zones, gesorteerd op nieuwste eerst
        </p>
      </div>

      <div className="space-y-4">
        {inboxData.items.map((item) => (
          <InboxCard
            key={`${item.zoneId}-${item.thread._id}`}
            item={item}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
