// src/app/components/zones/ZoneCard.tsx - Updated with unread indicators

"use client";

import { useRouter } from "next/navigation";
import { Zone } from "@/app/types/zones";

interface UpdatedZoneCardProps {
  zone: Zone;
  unreadCount?: number;
  hasUnreadMessages?: boolean;
}

//dit is gewoon om leuke kleuren te hebben voor de zones
// je kan dit aanpassen of uitbreiden met meer kleuren
const zoneCardBackgrounds = [
  "bg-purple-100",
  "bg-green-100",
  "bg-pink-100",
  "bg-yellow-50",
  "bg-blue-50",
  "bg-orange-50",
];

export function ZoneCard({
  zone,
  unreadCount = 0,
  hasUnreadMessages = false,
}: UpdatedZoneCardProps) {
  const router = useRouter();

  const backgroundClass =
    zoneCardBackgrounds[zone.zoneId % zoneCardBackgrounds.length];

  const handleZoneClick = () => {
    // Get personId from current URL or context
    const pathSegments = typeof window !== 'undefined' 
      ? window.location.pathname.split("/")
      : [];
    const personIdIndex =
      pathSegments.findIndex((segment) => segment === "zones") + 1;
    const personId = pathSegments[personIdIndex];

    if (personId) {
      // Navigate to conversations page for this zone
      router.push(`/conversations/${personId}/${zone.zoneId}`);
    } else {
      console.error("PersonId not found in URL");
    }
  };

  // Enhanced styling for zones with unread messages
  const cardClasses = `
    ${backgroundClass} rounded-2xl p-6 shadow-md transition-all duration-200 border-0 cursor-pointer
    ${
      hasUnreadMessages
        ? "hover:shadow-xl hover:scale-[1.03] ring-2 ring-blue-400 ring-opacity-50"
        : "hover:shadow-lg hover:scale-[1.02]"
    }
  `;

  return (
    <div onClick={handleZoneClick} className={`relative ${cardClasses}`}>
      {/* Unread indicator header */}
      {hasUnreadMessages && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-600">
              Nieuwe berichten
            </span>
          </div>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {unreadCount}
          </span>
        </div>
      )}

      <h3 className="font-bold text-xl text-stone-800 mb-3 leading-tight">
        {zone.name}
      </h3>

      <p className="text-base text-stone-600 mb-4 font-medium">
        {zone.formattedAddress}
      </p>

      <div className="bg-white/60 rounded-xl p-3 mb-4 text-sm text-stone-500">
        <p className="font-medium">
          Zone ID: <span className="text-amber-600">{zone.zoneId}</span> | Plot
          ID: <span className="text-amber-600">{zone.plotId}</span>
        </p>
        <p className="mt-1">
          {zone.street}, {zone.postalCode} {zone.city}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
          {zone.entityCount} entities
        </span>
        <span
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            zone.isPublic
              ? "bg-emerald-500 text-white"
              : "bg-orange-400 text-white"
          }`}
        >
          {zone.isPublic ? "Public" : "Private"}
        </span>
      </div>

      {/* Enhanced footer with conversation info */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-stone-400 font-medium">
          {zone.personIds.length} person(s) linked
        </div>

        {/* Conversation status */}
        <div className="flex items-center space-x-2">
          {hasUnreadMessages ? (
            <div className="flex items-center space-x-1 text-red-600">
              <span className="text-xs">💬</span>
              <span className="text-xs font-medium">
                {unreadCount} ongelezen
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-500">
              <span className="text-xs">💬</span>
              <span className="text-xs">Alle berichten gelezen</span>
            </div>
          )}
        </div>
      </div>

      {/* Animated border for high priority zones */}
      {hasUnreadMessages && unreadCount > 5 && (
        <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}
