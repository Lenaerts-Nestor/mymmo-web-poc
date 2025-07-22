// src/app/hooks/threads/useThreads.ts - REFACTORED: Clean Threads Hook

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Thread, GetThreadsResponse } from "../../types/threads";
import MyMMOApiThreads from "../../services/mymmo-thread-service/apiThreads";
import { useThreadPolling } from "./useThreadPolling";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isSocketConnected: boolean;
  socketStatus: string;
  pollingContext: string;
}

export function useThreads(
  personId: string,
  zoneId: string,
  transLangId: string,
  isActiveChatPage: boolean = false
): UseThreadsResult {
  const queryClient = useQueryClient();

  // Handle thread updates via socket
  const handleThreadUpdate = (data: any) => {
    console.log("🔥 Thread list update received:", data);

    // Invalidate threads cache for instant UI updates
    queryClient.invalidateQueries({
      queryKey: ["threads", personId, zoneId, transLangId],
    });

    // Also invalidate related caches
    queryClient.invalidateQueries({
      queryKey: ["inbox"],
    });

    queryClient.invalidateQueries({
      queryKey: ["zonesWithUnread"],
    });
  };

  // Get polling configuration with socket integration
  const {
    interval,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchIntervalInBackground,
    pollingContext,
    isSocketConnected,
    socketStatus,
  } = useThreadPolling({
    enabled: true,
    onThreadUpdate: handleThreadUpdate,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["threads", personId, zoneId, transLangId],
    queryFn: async (): Promise<GetThreadsResponse> => {
      const personIdNum = parseInt(personId);
      const zoneIdNum = parseInt(zoneId);

      // Debug logging for API call monitoring
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [THREADS] API call triggered:", {
          personId: personIdNum,
          zoneId: zoneIdNum,
          context: pollingContext,
          interval,
          socketConnected: isSocketConnected,
        });
      }

      return await MyMMOApiThreads.getThreads({
        zoneId: zoneIdNum,
        personId: personIdNum,
        type: "active",
        transLangId: transLangId,
      });
    },

    // Use the optimized polling configuration
    staleTime,
    gcTime,
    refetchInterval: interval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    refetchOnMount,

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
    isSocketConnected,
    socketStatus,
    pollingContext,
  };
}
