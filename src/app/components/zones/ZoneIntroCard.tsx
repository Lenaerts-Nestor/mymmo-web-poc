import { PersonInfoProps } from "@/app/types/person";

//TODO: iets doen met da appLang en translationLang
export function ZoneIntroCard({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-8 mb-8 backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-stone-800  text-center">
        Zones van{" "}
        {person
          ? `${person.firstName} ${person.lastName}`
          : `Persoon ${personId}`}
      </h1>
    </div>
  );
}
