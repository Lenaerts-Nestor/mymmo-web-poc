import { useQuery } from "@tanstack/react-query";
import { PersonEndpoint } from "@/app/types/person";
import { GetZonesByPersonResponse } from "../types/apiEndpoints";
import { Zone } from "../types/zones";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

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

      // Use the cached API call with longer TTL for zones data
      return await MyMMOApiZone.getZonesByPerson(
        personIdNum,
        personIdNum,
        translationLang
      );
    },
    staleTime: POLLING_INTERVALS.ZONES, // 5 minutes - React Query stale time
    gcTime: 10 * 60 * 1000, // 10 minutes - React Query garbage collection time
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!personId,
    // Add refetch interval for data that might change
    refetchInterval: 10 * 60 * 1000, // 10 minutes
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
