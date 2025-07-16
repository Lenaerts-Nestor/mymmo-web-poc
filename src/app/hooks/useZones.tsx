import { useQuery } from "@tanstack/react-query";
import { PersonEndpoint } from "@/app/types/person";
import { GetZonesByPersonResponse } from "../types/apiEndpoints";
import { Zone } from "../types/zones";
import MyMMOApiZone from "../services/mymmo-service/apiZones";

interface UseZonesResult {
  zones: Zone[];
  person: PersonEndpoint;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useZones(
  personId: string,
  translationLang: string
): UseZonesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["zones", personId, translationLang],
    queryFn: async (): Promise<GetZonesByPersonResponse> => {
      const personIdNum = parseInt(personId);
      return await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!personId,
  });

  // Transform data or provide defaults
  const zones = data?.data?.zones || [];
  const person = data?.data?.person?.[0];
  const errorMessage = error
    ? "Fout bij het laden van zones. Probeer het opnieuw."
    : null;

  if (!person && !isLoading && !error) {
    return {
      zones: [],
      person: {} as PersonEndpoint,
      isLoading: false,
      error: "Persoon niet gevonden",
      refetch,
    };
  }

  return {
    zones,
    person: person!,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
