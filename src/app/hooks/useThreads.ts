// src/app/hooks/useThreads.ts

import { useQuery } from "@tanstack/react-query";
import { Thread, GetThreadsResponse } from "../types/threads";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";
import { POLLING_INTERVALS } from "../constants/pollings_interval";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useThreads(
  personId: string,
  zoneId: string,
  transLangId: string
): UseThreadsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["threads", personId, zoneId, transLangId],
    queryFn: async (): Promise<GetThreadsResponse> => {
      const personIdNum = parseInt(personId);
      const zoneIdNum = parseInt(zoneId);

      return await MyMMOApiThreads.getThreads({
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    },

    //! dit is voor de snelheid van het aanroepen van de threads, als je wilt dat de threads sneller worden opgehaald, dan moet je deze waardes aanpassen
    //! opletten dat de threads niet te vaak worden opgehaald, want dan krijg je een
    // OPTIMIZED FOR REAL-TIME FEEL
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchInterval: POLLING_INTERVALS.CONVERSATIONS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,

    retry: 1,
    retryDelay: 1000,
    enabled: !!personId && !!zoneId,
  });

  const threads = data?.data || [];
  const errorMessage = error
    ? "Fout bij het laden van threads. Probeer het opnieuw."
    : null;

  return {
    threads,
    isLoading,
    error: errorMessage,
    refetch,
  };
}
