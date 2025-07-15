import { PersonEndpoint, PersonInfoProps } from "@/app/types/person";

export function PersonInfo({
  person,
  personId,
  appLang,
  translationLang,
}: PersonInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Zones voor{" "}
        {person
          ? `${person.firstName} ${person.lastName}`
          : `Persoon ${personId}`}
      </h1>

      <div className="text-sm text-gray-600 mb-4">
        App Taal: {appLang} | Vertalingstaal: {translationLang}
      </div>

      {person && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800">Persoon Informatie:</h3>
          <p className="text-blue-700">
            {person.firstName} {person.lastName} (ID: {person.personId})
          </p>
        </div>
      )}
    </div>
  );
}
