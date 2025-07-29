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

const zoneCardBackgrounds = [
  "bg-[#b0c2fc]/20",
  "bg-[#aced94]/20",
  "bg-[#ffb5b5]/20",
  "bg-[#facf59]/20",
  "bg-[#f5f2de]/20",
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
    const pathSegments =
      typeof window !== "undefined" ? window.location.pathname.split("/") : [];
    const personIdIndex =
      pathSegments.findIndex((segment) => segment === "zones") + 1;
    const personId = pathSegments[personIdIndex];
    if (personId) {
      router.push(`/conversations/${personId}/${zone.zoneId}`);
    } else {
      console.error("PersonId not found in URL");
    }
  };

  const cardClasses = `
    ${backgroundClass} rounded-2xl p-6 shadow-md transition-all duration-200 border-2 cursor-pointer
    ${
      hasUnreadMessages
        ? "border-[#b0c2fc] hover:shadow-xl hover:scale-[1.03] ring-2 ring-[#b0c2fc] ring-opacity-50"
        : "border-[#cfc4c7] hover:shadow-lg hover:scale-[1.02] hover:border-[#a69298]"
    }
  `;
  return (
    <div onClick={handleZoneClick} className={`relative ${cardClasses}`}>
      {hasUnreadMessages && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#b00205] animate-pulse" />{" "}
            <span className="text-xs font-medium text-[#b00205]">
              Nieuwe berichten
            </span>{" "}
          </div>
          <Badge className="bg-[#b00205] text-[#ffffff] text-xs px-2 py-1 rounded-full font-bold">
            {unreadCount}
          </Badge>
        </div>
      )}
      <h3 className="font-bold text-xl text-[#552e38] mb-3 leading-tight">
        {zone.name}
      </h3>{" "}
      <p className="text-base text-[#765860] mb-4 font-medium">
        {zone.formattedAddress}
      </p>
      <div className="bg-[var(--pure-white)]/60 rounded-xl p-3 mb-4 text-sm text-[var(--gravel-500)]">
        <p className="font-medium">
          Zone ID:{" "}
          <span className="text-[var(--primary-sunglow)]">{zone.zoneId}</span> |
          Plot ID:{" "}
          <span className="text-[var(--primary-sunglow)]">{zone.plotId}</span>{" "}
        </p>
        <p className="mt-1">
          {zone.street}, {zone.postalCode} {zone.city}
        </p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Badge className="bg-[var(--primary-sunglow)]/20 text-[var(--primary-wine)] font-bold text-sm px-3 py-1 rounded-full">
          {zone.entityCount} entities
        </Badge>
        <Badge
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            zone.isPublic
              ? "bg-[var(--secondary-tea)] text-[var(--primary-wine)]"
              : "bg-[var(--secondary-melon)] text-[var(--primary-wine)]"
          }`}
        >
          {zone.isPublic ? "Public" : "Private"}
        </Badge>
      </div>
      <div className="flex justify-between items-center text-sm pt-2 border-t border-[var(--gravel-100)]">
        <div className="flex items-center gap-1 text-[var(--gravel-300)] font-medium">
          <Users className="w-3 h-3" />
          <span>{zone.personIds.length} person(s) linked</span>
        </div>

        <div className="flex items-center gap-1">
          {hasUnreadMessages ? (
            <div className="flex items-center gap-1 text-[var(--error)]">
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs font-medium">
                {unreadCount} ongelezen
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[var(--gravel-500)]">
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs">Alle berichten gelezen</span>
            </div>
          )}
        </div>
      </div>
      {/* Animated border for high priority zones */}
      {hasUnreadMessages && unreadCount > 5 && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[var(--error)] animate-pulse pointer-events-none"></div>
      )}{" "}
      {/* error color */}
    </div>
  );
}
