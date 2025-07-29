import { MapPin } from "lucide-react";
import type { PersonInfoProps } from "@/app/types/person";

export function ZoneIntroCard({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  return (
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-offwhite)] via-[var(--pure-white)] to-[var(--primary-offwhite)] rounded-2xl -mx-4 -my-2 border border-[var(--gravel-100)]"></div>

      <div className="relative text-center py-8">
        <div className="inline-flex items-center gap-2 bg-[var(--primary-sunglow)] text-[var(--primary-wine)] px-3 py-1 rounded-full text-sm font-medium mb-4">
          <MapPin className="w-4 h-4" />
          Zone Management
        </div>

        <h1 className="text-4xl font-bold text-[var(--primary-wine)] mb-3 tracking-tight">
          Zones van{" "}
          <span className="bg-gradient-to-r from-[var(--primary-wine)] to-[var(--gravel-500)] bg-clip-text text-transparent">
            {person
              ? `${person.firstName} ${person.lastName}`
              : `Persoon ${personId}`}
          </span>
        </h1>

        <p className="text-lg text-[var(--gravel-500)] max-w-2xl mx-auto leading-relaxed">
          Welkom bij je zones overzicht. Hier vind je alle zones waar je toegang
          toe hebt,{" "}
          <span className="font-medium text-[var(--primary-wine)]">
            inclusief real-time updates
          </span>{" "}
          van ongelezen berichten.
        </p>

        <div className="flex items-center justify-center mt-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--gravel-100)] to-transparent w-24"></div>
          <div className="w-2 h-2 bg-[var(--primary-sunglow)] rounded-full mx-4"></div>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--gravel-100)] to-transparent w-24"></div>
        </div>
      </div>
    </div>
  );
}
