"use client";

import { MapPin, MessageCircle, Bell, Search } from "lucide-react"; // Added icons
import { ZoneCard } from "./ZoneCard";
import type { Zone } from "@/app/types/zones";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface UpdatedZonesListProps {
  zones: ZoneWithUnreadCount[];
  isLoading: boolean;
  search?: string;
  showAllZones: boolean;
  personId: string;
  translationLang: string;
}

function ZonesListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#f5f2de] rounded-2xl p-6 animate-pulse shadow-md"
        >
          {" "}
          {/* primary-offwhite */}
          <div className="h-6 bg-[#cfc4c7] rounded-lg mb-3"></div>{" "}
          {/* gravel-100 */}
          <div className="h-4 bg-[#cfc4c7] rounded-lg mb-4"></div>{" "}
          {/* gravel-100 */}
          <div className="bg-[#ffffff]/60 rounded-xl p-3 mb-4">
            {" "}
            {/* pure-white/60 */}
            <div className="h-3 bg-[#cfc4c7] rounded mb-2"></div>{" "}
            {/* gravel-100 */}
            <div className="h-3 bg-[#cfc4c7] rounded"></div> {/* gravel-100 */}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-[#cfc4c7] rounded-full w-20"></div>{" "}
            {/* gravel-100 */}
            <div className="h-6 bg-[#cfc4c7] rounded-full w-16"></div>{" "}
            {/* gravel-100 */}
          </div>
          <div className="h-3 bg-[#cfc4c7] rounded w-24"></div>{" "}
          {/* gravel-100 */}
        </div>
      ))}
    </div>
  );
}

function EmptyZonesState({ showAllZones }: { showAllZones: boolean }) {
  return (
    <div className="text-center py-12 text-[#765860]">
      {" "}
      {/* gravel-500 */}
      <div className="text-6xl mb-6">
        {showAllZones ? (
          <MapPin className="w-16 h-16 mx-auto text-[#a69298]" />
        ) : (
          <MessageCircle className="w-16 h-16 mx-auto text-[#a69298]" />
        )}{" "}
        {/* gravel-300 */}
      </div>
      <p className="text-2xl font-bold mb-3 text-[#552e38]">
        {" "}
        {/* primary-wine */}
        {showAllZones
          ? "Geen zones gevonden"
          : "Geen zones met ongelezen berichten"}
      </p>
      <p className="text-lg text-[#765860]">
        {" "}
        {/* gravel-500 */}
        {showAllZones
          ? "Er zijn geen zones gevonden voor deze persoon."
          : "Alle berichten zijn gelezen. Gebruik 'Toon alle zones' om alle zones te bekijken."}
      </p>
    </div>
  );
}

export function ZonesList({
  zones,
  isLoading,
  search,
  showAllZones,
  personId,
  translationLang,
}: UpdatedZonesListProps) {
  if (isLoading) return <ZonesListSkeleton />;

  // Apply search filter
  let filteredZones = search
    ? zones.filter(
        (zone) =>
          zone.name.toLowerCase().includes(search.toLowerCase()) ||
          zone.formattedAddress.toLowerCase().includes(search.toLowerCase())
      )
    : zones;
  // Apply unread filter
  if (!showAllZones) {
    filteredZones = filteredZones.filter((zone) => zone.hasUnreadMessages);
  }

  if (filteredZones.length === 0) {
    return (
      <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        {" "}
        {/* pure-white/70 */}
        <EmptyZonesState showAllZones={showAllZones} />
      </div>
    );
  }

  // Calculate statistics
  const totalUnreadCount = filteredZones.reduce(
    (sum, zone) => sum + zone.unreadCount,
    0
  );
  const zonesWithUnreadCount = filteredZones.filter(
    (zone) => zone.hasUnreadMessages
  ).length;

  return (
    <div className="bg-[#ffffff]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      {" "}
      {/* pure-white/70 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#552e38] mb-2">
            {" "}
            {/* primary-wine */}
            {showAllZones ? "Alle Zones" : "Zones met Ongelezen Berichten"} (
            {filteredZones.length})
          </h2>
          {/* Statistics */}
          <div className="flex items-center gap-4 text-sm text-[#765860]">
            {" "}
            {/* gravel-500 */}
            <div className="flex items-center gap-1">
              <Bell className="w-4 h-4 text-[#b00205]" /> {/* error color */}
              <span>
                {totalUnreadCount} ongelezen{" "}
                {totalUnreadCount === 1 ? "bericht" : "berichten"}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#facf59]" />{" "}
              {/* primary-sunglow */}
              <span>
                {zonesWithUnreadCount} van {zones.length} zones heeft ongelezen
                berichten
              </span>
            </div>
            {search && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Search className="w-4 h-4 text-[#a69298]" />{" "}
                  {/* gravel-300 */}
                  <span>Gefilterd op: "{search}"</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#aced94] rounded-full animate-pulse"></div>{" "}
          {/* secondary-tea */}
          <span className="text-sm text-[#765860]">Live updates</span>{" "}
          {/* gravel-500 */}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredZones.map((zone) => (
          <ZoneCard
            key={zone.zoneId}
            zone={zone}
            unreadCount={zone.unreadCount}
            hasUnreadMessages={zone.hasUnreadMessages}
          />
        ))}
      </div>
    </div>
  );
}
