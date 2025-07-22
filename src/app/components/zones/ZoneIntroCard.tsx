// src/app/components/zones/ZoneIntroCard.tsx - SAFE VERSION

import { PersonInfoProps } from "@/app/types/person";

export function ZoneIntroCard({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  // Safe name handling
  const displayName =
    person?.firstName && person?.lastName
      ? `${person.firstName} ${person.lastName}`
      : person?.firstName
      ? person.firstName
      : `Persoon ${personId}`;

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-3">
          Zones van <span className="text-blue-600">{displayName}</span>
        </h1>

        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Welkom bij je zones overzicht. Hier vind je alle zones waar je toegang
          toe hebt, inclusief real-time updates van ongelezen berichten.
        </p>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
            <p>Person ID: {personId}</p>
            <p>Person Data: {person ? "Loaded" : "Loading..."}</p>
            <p>App Lang: {appLang}</p>
            <p>Translation Lang: {translationLang}</p>
          </div>
        )}
      </div>
    </div>
  );
}
