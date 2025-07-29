"use client";

import { useRouter } from "next/navigation";
import { Thread } from "@/app/types/threads";
import { useZonesContext } from "@/app/contexts/ZonesContext";
import { Users, Bell } from "lucide-react";

interface InboxConversationCardProps {
  conversation: Thread;
  personId: string;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const conversationDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (conversationDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export function InboxConversationCard({
  conversation,
  personId,
}: InboxConversationCardProps) {
  const router = useRouter();
  const { zones } = useZonesContext();

  const zone = zones.find(
    (z) => z.zoneId.toString() === conversation.zone_id?.toString()
  );

  const latestMessage =
    conversation.latest_message || conversation.unread_message;
  const lastSender = latestMessage
    ? conversation.followers?.find(
        (follower) => follower.person_id === latestMessage.created_by
      )
    : null;

  const handleCardClick = () => {
    if (conversation.zone_id) {
      localStorage.setItem("selectedZoneId", conversation.zone_id.toString());

      router.push(
        `/conversations/${personId}/${conversation.zone_id}/thread/${conversation._id}`
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] border-[#ffb5b5] hover:border-[#ffb5b5]/80"
    >
      {/* Zone info header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="text-sm text-[#765860]">
          <span className="font-medium">{zone?.name || "Onbekende zone"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#4f46e5] text-white text-sm px-3 py-1 rounded-full font-bold">
            {conversation.unread_count || 0}
          </span>
          <span className="text-xs bg-[#e0e7ff] text-[#4f46e5] px-2 py-1 rounded-full font-medium">
            nieuw
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-[#b0c2fc]/30 rounded-full flex items-center justify-center text-[#552e38] text-sm font-medium">
            {lastSender
              ? getInitials(lastSender.firstName, lastSender.lastName)
              : "?"}
          </div>

          {/* Sender info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#552e38] truncate">
              {lastSender
                ? `${lastSender.firstName} ${lastSender.lastName}`
                : "Onbekend"}
            </p>
            <p className="text-xs text-[#765860]">
              {latestMessage?.created_on
                ? formatDate(latestMessage.created_on)
                : "Onbekend"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[#765860] text-sm leading-relaxed">
          {latestMessage?.text
            ? truncateText(latestMessage.text, 100)
            : "Geen bericht beschikbaar"}
        </p>
      </div>

      {conversation.communication_group?.group_name && (
        <div className="mb-4 p-2 bg-[#f5f2de] rounded-lg">
          <p className="text-xs text-[#765860]">
            Groep:{" "}
            <span className="font-medium text-[#552e38]">
              {conversation.communication_group.group_name}
            </span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-[#cfc4c7]">
        <div className="flex items-center gap-2">
          {conversation.dot && (
            <div className="w-2 h-2 bg-[#b0c2fc] rounded-full animate-pulse"></div>
          )}

          <p className="text-xs text-[#a69298]">
            <Users className="inline-block w-3 h-3 mr-1" />
            {conversation.followers?.length || 0} deelnemer
            {(conversation.followers?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[#b00205]">
          <Bell className="w-3 h-3 animate-pulse" />
          <span className="text-xs font-medium">Ongelezen</span>
        </div>
      </div>
    </div>
  );
}
