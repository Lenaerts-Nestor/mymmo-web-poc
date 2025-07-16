import { useState, useEffect } from "react";
import { PersonEndpoint } from "@/app/types/person";
import MyMMOAPI from "@/app/services/apiService";
import { GetZonesByPersonResponse } from "../types/apiEndpoints";
import { Zone } from "../types/zones";

export function useZones(personId: string, translationLang: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [person, setPerson] = useState<PersonEndpoint>();
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const personIdNum = parseInt(personId);
      const response: GetZonesByPersonResponse =
        await MyMMOAPI.getZonesByPerson(
          personIdNum,
          personIdNum,
          translationLang
        );

      if (response.status === 200) {
        if (!response.data.person[0]) {
          throw new Error("Persoon niet gevonden");
        }

        setZones(response.data.zones);
        setPerson(response.data.person[0]);
      } else {
        setError(`API fout: Status ${response.status}`);
      }
    } catch (err) {
      setError("Fout bij het laden van zones. Probeer het opnieuw.");
      console.error("Zones fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [personId, translationLang]);

  return {
    zones,
    person: person!,
    isLoading,
    error,
    refetch: fetchZones,
  };
}
