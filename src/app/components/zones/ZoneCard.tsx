import { ZoneCardProps } from "@/app/types/zones";

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

export function ZoneCard({ zone }: ZoneCardProps) {
  const backgroundClass =
    zoneCardBackgrounds[zone.zoneId % zoneCardBackgrounds.length];

  return (
    <div
      className={`${backgroundClass} rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0`}
    >
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

      <div className="text-sm text-stone-400 font-medium">
        {zone.personIds.length} person(s) linked
      </div>
    </div>
  );
}
