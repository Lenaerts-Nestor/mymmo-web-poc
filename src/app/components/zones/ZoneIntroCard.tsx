// src/app/components/zones/ZoneIntroCard.tsx - Responsive Design

import { PersonInfoProps } from "@/app/types/person";

export function ZoneIntroCard({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-3">
          Zones van{" "}
          <span className="text-blue-600">
            {person
              ? `${person.firstName} ${person.lastName}`
              : `Persoon ${personId}`}
          </span>
        </h1>

        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Welkom bij je zones overzicht. Hier vind je alle zones waar je toegang
          toe hebt, inclusief real-time updates van ongelezen berichten.
        </p>
      </div>
    </div>
  );
}
