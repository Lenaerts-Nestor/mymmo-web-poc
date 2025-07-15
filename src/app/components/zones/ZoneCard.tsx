import { ZoneCardProps } from "@/app/types/zones";

export function ZoneCard({ zone }: ZoneCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-800 mb-2 text-lg">{zone.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{zone.formattedAddress}</p>

      <div className="text-xs text-gray-500 mb-4">
        <p>
          Zone ID: {zone.zoneId} | Plot ID: {zone.plotId}
        </p>
        <p>
          {zone.street}, {zone.postalCode} {zone.city}
        </p>
      </div>

      <div className="flex justify-between items-center text-xs mb-3">
        <span className="text-blue-600 font-medium">
          {zone.entityCount} entities
        </span>
        <span
          className={`px-3 py-1 rounded-full font-medium ${
            zone.isPublic
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {zone.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="text-xs text-gray-400">
        {zone.personIds.length} person(s) linked
      </div>
    </div>
  );
}
