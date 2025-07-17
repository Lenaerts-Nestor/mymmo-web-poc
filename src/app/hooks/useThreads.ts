// src/app/hooks/useThreads.ts

import { useQuery } from "@tanstack/react-query";
import { Thread, GetThreadsResponse } from "../types/threads";
import MyMMOApiThreads from "../services/mymmo-thread-service/apiThreads";

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

    // OPTIMIZED FOR REAL-TIME FEEL
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 10 * 1000,
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
