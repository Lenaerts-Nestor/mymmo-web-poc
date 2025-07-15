import { ZonesListProps } from "@/app/types/zones";
import { ZoneCard } from "./ZoneCard";

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

function EmptyZonesState() {
  return (
    <div className="text-center py-12 text-stone-500">
      <div className="text-6xl mb-6">🏗️</div>
      <p className="text-2xl font-bold mb-3 text-stone-700">
        Geen zones gevonden
      </p>
      <p className="text-lg text-stone-500">
        Er zijn geen zones gevonden voor deze persoon.
      </p>
    </div>
  );
}

export function ZonesList({ zones, isLoading }: ZonesListProps) {
  if (isLoading) return <ZonesListSkeleton />;

  if (zones.length === 0) {
    return <EmptyZonesState />;
  }

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-stone-800 mb-6">
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
