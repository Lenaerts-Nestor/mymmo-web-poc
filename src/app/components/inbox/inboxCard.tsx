// src/app/components/inbox/InboxCard.tsx - Enhanced Brand Styling

"use client";

import { useState, useEffect } from "react";
import { InboxItem } from "@/app/types/inbox";

interface InboxCardProps {
  item: InboxItem;
  onClick: (zoneId: number, threadId: string) => void;
}

// Helper function to format time ago (with hydration-safe date handling)
const formatTimeAgo = (dateString: string, currentTime?: Date): string => {
  const date = new Date(dateString);
  const now = currentTime || new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Net nu";
  if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}u geleden`;
  if (diffInMinutes < 10080)
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;

  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
  });
};

export function InboxCard({ item, onClick }: InboxCardProps) {
  const [timeFormatted, setTimeFormatted] = useState<string>("");
  const [dateFormatted, setDateFormatted] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  const hasUnread = item.unreadCount > 0;

  // Get thread and latest message info
  const thread = item.thread;
  const latestMessage = thread.latest_message;

  // Handle client-side time formatting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setTimeFormatted(formatTimeAgo(latestMessage.created_on, now));
    setDateFormatted(new Date(latestMessage.created_on).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }));
  }, [latestMessage.created_on]);

  // Find sender info from followers based on who created the latest message
  const sender = thread.followers.find(
    (follower) => follower.person_id === latestMessage.created_by
  );

  const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : "Onbekende afzender";
  const senderInitials = sender
    ? `${sender.firstName.charAt(0)}${sender.lastName.charAt(0)}`.toUpperCase()
    : "OA";
  const senderAvatar = sender?.profilePic;

  const handleClick = () => {
    onClick(item.zoneId, thread._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`inbox-card ${hasUnread ? "inbox-card--unread" : ""} group`}
    >
      {/* ZONE HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3
            className="text-xl font-semibold mb-2 transition-colors group-hover:text-[color:var(--gravel-500)]"
            style={{ color: "var(--primary-wine)" }}
          >
            {item.zoneName}
          </h3>
          {item.zoneDescription && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--gravel-500)" }}
            >
              {item.zoneDescription}
            </p>
          )}
        </div>

        {/* UNREAD BADGE */}
        {hasUnread && (
          <div className="flex items-center space-x-3">
            <span
              className="inbox-unread-badge"
              // inbox-unread-badge already uses the correct vars
            >
              {item.unreadCount}
            </span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-[8px]"
              style={{
                backgroundColor: "var(--primary-offwhite)",
                color: "var(--gravel-500)",
              }}
            >
              nieuw
            </span>
          </div>
        )}
      </div>

      {/* MESSAGE CONTENT */}
      <div className="flex items-start space-x-4 mb-6">
        {/* SENDER AVATAR */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ borderColor: "var(--primary-sunglow)" }}
          >
            {senderAvatar ? (
              <img
                src={senderAvatar}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "var(--secondary-lightblue)" }}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--primary-wine)" }}
                >
                  {senderInitials}
                </span>
              </div>
            )}
          </div>

          {/* Online indicator */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full"
            style={{ backgroundColor: "var(--secondary-tea)" }}
          ></div>
        </div>

        {/* MESSAGE INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4
              className="font-semibold text-base"
              style={{ color: "var(--primary-wine)" }}
            >
              {senderName}
            </h4>
            <span
              className="text-xs px-2 py-1 rounded-[8px] font-medium"
              style={{
                backgroundColor: "var(--primary-offwhite)",
                color: "var(--gravel-300)",
              }}
            >
              {isClient ? timeFormatted : "..."}
            </span>
          </div>

          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: "var(--gravel-500)" }}
          >
            {latestMessage.text || (
              <span className="italic" style={{ color: "var(--gravel-300)" }}>
                Geen bericht tekst beschikbaar
              </span>
            )}
          </p>

          {/* Message type indicator */}
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center space-x-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--secondary-lightblue)" }}
              ></div>
              <span className="text-xs" style={{ color: "var(--gravel-300)" }}>
                Tekstbericht
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="flex justify-between items-center pt-4 border-t"
        style={{ borderColor: "var(--gravel-100)" }}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              hasUnread ? "animate-pulse" : ""
            }`}
            style={{
              backgroundColor: hasUnread
                ? "var(--secondary-melon)"
                : "var(--secondary-tea)",
            }}
          ></div>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--gravel-300)" }}
          >
            {hasUnread
              ? `${item.unreadCount} ongelezen bericht${
                  item.unreadCount !== 1 ? "en" : ""
                }`
              : "Alles gelezen"}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs" style={{ color: "var(--gravel-500)" }}>
            {isClient ? dateFormatted : "..."}
          </span>

          {/* Arrow indicator */}
          <div
            className="transition-colors group-hover:text-[color:var(--primary-wine)]"
            style={{ color: "var(--gravel-300)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Priority indicator for highly unread conversations */}
      {hasUnread && item.unreadCount >= 5 && (
        <div
          className="absolute top-4 right-4 w-3 h-3 rounded-full animate-bounce"
          style={{ backgroundColor: "var(--error)" }}
        ></div>
      )}
    </div>
  );
}
