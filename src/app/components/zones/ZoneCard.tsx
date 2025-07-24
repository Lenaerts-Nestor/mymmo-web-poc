"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Users, Bell } from "lucide-react"; // Added icons
import type { Zone } from "@/app/types/zones";

// Simple Badge component
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {children}
    </span>
  );
}

interface UpdatedZoneCardProps {
  zone: Zone;
  unreadCount?: number;
  hasUnreadMessages?: boolean;
}

// Using the provided color palette for card backgrounds
const zoneCardBackgrounds = [
  "bg-[#b0c2fc]/20", // secondary-lightblue light
  "bg-[#aced94]/20", // secondary-tea light
  "bg-[#ffb5b5]/20", // secondary-melon light
  "bg-[#facf59]/20", // primary-sunglow light
  "bg-[#f5f2de]/20", // primary-offwhite light
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
    const pathSegments =
      typeof window !== "undefined" ? window.location.pathname.split("/") : [];
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
    ${backgroundClass} rounded-2xl p-6 shadow-md transition-all duration-200 border-2 cursor-pointer
    ${
      hasUnreadMessages
        ? "border-[#b0c2fc] hover:shadow-xl hover:scale-[1.03] ring-2 ring-[#b0c2fc] ring-opacity-50" // secondary-lightblue for border/ring
        : "border-[#cfc4c7] hover:shadow-lg hover:scale-[1.02] hover:border-[#a69298]" // gravel-100 for normal, gravel-300 for hover
    }
  `;
  return (
    <div onClick={handleZoneClick} className={`relative ${cardClasses}`}>
      {/* Unread indicator header */}
      {hasUnreadMessages && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#b00205] animate-pulse" />{" "}
            {/* error color */}
            <span className="text-xs font-medium text-[#b00205]">
              Nieuwe berichten
            </span>{" "}
            {/* error color */}
          </div>
          <Badge className="bg-[#b00205] text-[#ffffff] text-xs px-2 py-1 rounded-full font-bold">
            {" "}
            {/* error color */}
            {unreadCount}
          </Badge>
        </div>
      )}
      <h3 className="font-bold text-xl text-[#552e38] mb-3 leading-tight">
        {zone.name}
      </h3>{" "}
      {/* primary-wine */}
      <p className="text-base text-[#765860] mb-4 font-medium">
        {zone.formattedAddress}
      </p>{" "}
      {/* gravel-500 */}
      <div className="bg-[#ffffff]/60 rounded-xl p-3 mb-4 text-sm text-[#765860]">
        {" "}
        {/* pure-white/60, gravel-500 */}
        <p className="font-medium">
          Zone ID: <span className="text-[#facf59]">{zone.zoneId}</span> | Plot
          ID: <span className="text-[#facf59]">{zone.plotId}</span>{" "}
          {/* primary-sunglow */}
        </p>
        <p className="mt-1">
          {zone.street}, {zone.postalCode} {zone.city}
        </p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Badge className="bg-[#facf59]/20 text-[#552e38] font-bold text-sm px-3 py-1 rounded-full">
          {" "}
          {/* primary-sunglow/20, primary-wine */}
          {zone.entityCount} entities
        </Badge>
        <Badge
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            zone.isPublic
              ? "bg-[#aced94] text-[#552e38]" // secondary-tea, primary-wine
              : "bg-[#ffb5b5] text-[#552e38]" // secondary-melon, primary-wine
          }`}
        >
          {zone.isPublic ? "Public" : "Private"}
        </Badge>
      </div>
      {/* Enhanced footer with conversation info */}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-[#cfc4c7]">
        {" "}
        {/* gravel-100 */}
        <div className="flex items-center gap-1 text-[#a69298] font-medium">
          {" "}
          {/* gravel-300 */}
          <Users className="w-3 h-3" />
          <span>{zone.personIds.length} person(s) linked</span>
        </div>
        {/* Conversation status */}
        <div className="flex items-center gap-1">
          {hasUnreadMessages ? (
            <div className="flex items-center gap-1 text-[#b00205]">
              {" "}
              {/* error color */}
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs font-medium">
                {unreadCount} ongelezen
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#765860]">
              {" "}
              {/* gravel-500 */}
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs">Alle berichten gelezen</span>
            </div>
          )}
        </div>
      </div>
      {/* Animated border for high priority zones */}
      {hasUnreadMessages && unreadCount > 5 && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#b00205] animate-pulse pointer-events-none"></div>
      )}{" "}
      {/* error color */}
    </div>
  );
}
