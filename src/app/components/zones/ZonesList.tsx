// src/app/components/zones/ZonesList.tsx - Responsive Grid

import { ZoneCard } from "./ZoneCard";
import { Zone } from "@/app/types/zones";

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
          className="bg-gray-100 rounded-2xl p-6 animate-pulse shadow-md"
        >
          <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-lg mb-4"></div>
          <div className="bg-white/60 rounded-xl p-3 mb-4">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyZonesState({ showAllZones }: { showAllZones: boolean }) {
  return (
    <div className="text-center py-12 text-stone-500">
      <div className="text-6xl mb-6">{showAllZones ? "🏗️" : "📬"}</div>
      <p className="text-2xl font-bold mb-3 text-stone-700">
        {showAllZones
          ? "Geen zones gevonden"
          : "Geen zones met ongelezen berichten"}
      </p>
      <p className="text-lg text-stone-500">
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
      <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
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
    <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 mb-2">
            {showAllZones ? "Alle Zones" : "Zones met Ongelezen Berichten"} (
            {filteredZones.length})
          </h2>

          {/* Statistics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              🔔 {totalUnreadCount} ongelezen{" "}
              {totalUnreadCount === 1 ? "bericht" : "berichten"}
            </span>
            <span>•</span>
            <span>
              📍 {zonesWithUnreadCount} van {zones.length} zones heeft ongelezen
              berichten
            </span>
            {search && (
              <>
                <span>•</span>
                <span>🔍 Gefilterd op: "{search}"</span>
              </>
            )}
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live updates</span>
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
