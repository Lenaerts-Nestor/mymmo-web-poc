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

      // Call the threads API
      return await MyMMOApiThreads.getThreads({
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    },
    staleTime: 1 * 60 * 1000, // 1 minute - threads change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes - React Query garbage collection time
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!personId && !!zoneId,
    // Add refetch interval for real-time updates
    refetchInterval: 30 * 1000, // 30 seconds - similar to CEO-POC pattern
  });

  // Transform data or provide defaults
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
