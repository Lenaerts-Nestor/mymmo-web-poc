// src/app/components/inbox/inboxHeader.tsx - Improved Design

"use client";

import { useState, useEffect } from "react";
import { InboxHeaderProps } from "@/app/types/inbox";

// Helper function to format last updated time (with hydration-safe date handling)
const formatLastUpdated = (dateString: string, currentTime?: Date): string => {
  const date = new Date(dateString);
  const now = currentTime || new Date();
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
}: InboxHeaderProps) {
  const [lastUpdatedFormatted, setLastUpdatedFormatted] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Handle client-side time formatting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setLastUpdatedFormatted(formatLastUpdated(lastUpdated, now));
  }, [lastUpdated]);

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
            Laatste update: {isClient ? lastUpdatedFormatted : "..."}
          </p>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Live status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
