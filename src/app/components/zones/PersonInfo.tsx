import { PersonInfoProps } from "@/app/types/person";

export function PersonInfo({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-8 mb-8 backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-stone-800 mb-4">
        Zones voor{" "}
        {person
          ? `${person.firstName} ${person.lastName}`
          : `Persoon ${personId}`}
      </h1>

      <div className="text-base text-stone-600 mb-6 font-medium">
        App Taal: <span className="text-amber-600">{appLang}</span> |
        Vertalingstaal:{" "}
        <span className="text-amber-600">{translationLang}</span>
      </div>

      {person && (
        <div className="bg-amber-50 rounded-xl p-4 mb-4 border-l-4 border-amber-400">
          <h3 className="font-bold text-stone-800 mb-2">Persoon Informatie:</h3>
          <p className="text-stone-700 font-medium">
            {person.firstName} {person.lastName} (ID:{" "}
            <span className="text-amber-600">{person.personId}</span>)
          </p>
        </div>
      )}
    </div>
  );
}
