import { ZonesListProps } from "@/app/types/zones";
import { ZoneCard } from "./ZoneCard";

function ZonesListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-between items-center mb-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyZonesState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <div className="text-4xl mb-4">🏗️</div>
      <p className="text-lg font-medium mb-2">Geen zones gevonden</p>
      <p className="text-sm">Er zijn geen zones gevonden voor deze persoon.</p>
    </div>
  );
}

export function ZonesList({ zones, isLoading }: ZonesListProps) {
  if (isLoading) return <ZonesListSkeleton />;

  if (zones.length === 0) {
    return <EmptyZonesState />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Zones ({zones.length})
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {zones.map((zone) => (
          <ZoneCard key={zone.zoneId} zone={zone} />
        ))}
      </div>
    </div>
  );
}
