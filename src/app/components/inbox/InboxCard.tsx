"use client";

import { useRouter } from "next/navigation";
import { ZoneWithUnreadCount } from "@/app/contexts/ZonesContext";

interface InboxCardProps {
  zone: ZoneWithUnreadCount;
  personId: string;
}

export function InboxCard({ zone, personId }: InboxCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    localStorage.setItem("selectedZoneId", zone.zoneId.toString());
    router.push(`/conversations/${personId}/${zone.zoneId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-[#552e38] text-lg">{zone.name}</h3>
        <div className="flex items-center gap-2">
          <span className="bg-[#4f46e5] text-white text-sm px-3 py-1 rounded-full font-bold">
            {zone.unreadCount}
          </span>
          <span className="text-xs bg-[#e0e7ff] text-[#4f46e5] px-2 py-1 rounded-full font-medium">
            nieuw
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#b00205] flex items-center gap-1">
            <div className="w-2 h-2 bg-[#b00205] rounded-full"></div>
            {zone.unreadCount} ongelezen bericht
            {zone.unreadCount !== 1 ? "en" : ""}
          </span>
          <span className="text-[#765860]">Klik om te bekijken →</span>
        </div>
      </div>
    </div>
  );
}
