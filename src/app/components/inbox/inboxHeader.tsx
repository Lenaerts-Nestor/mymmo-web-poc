// src/app/components/inbox/inboxHeader.tsx - Improved Design

import { RefreshCw } from "lucide-react";
import { InboxHeaderProps } from "@/app/types/inbox";

// Helper function to format last updated time
const formatLastUpdated = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 60) {
    return `${diffSeconds} seconden geleden`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minuten geleden`;
  } else {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export function InboxHeader({
  totalUnreadCount,
  lastUpdated,
  onManualRefresh,
  isRefreshing,
}: InboxHeaderProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left side - Title and Info */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Inbox
            {totalUnreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-xl px-3 py-1 rounded-full font-bold">
                {totalUnreadCount}
              </span>
            )}
          </h1>

          <p className="text-gray-600 mb-2">
            {totalUnreadCount === 0
              ? "Geen ongelezen berichten"
              : `${totalUnreadCount} ongelezen ${
                  totalUnreadCount === 1 ? "bericht" : "berichten"
                } uit alle zones`}
          </p>

          <p className="text-sm text-gray-500">
            Laatste update: {formatLastUpdated(lastUpdated)}
          </p>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Live status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>

          {/* Manual refresh button */}
          <button
            onClick={onManualRefresh}
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
    </div>
  );
}
