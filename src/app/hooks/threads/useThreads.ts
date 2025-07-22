// src/app/hooks/threads/useThreads.ts - FIXED CONTEXT USAGE

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Thread, GetThreadsResponse } from "../../types/threads";
import MyMMOApiThreads from "../../services/mymmo-thread-service/apiThreads";
import { useUnifiedApp } from "../../contexts/UnifiedAppContext"; // FIXED: Use unified context

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
  const { isSocketConnected, socketStatus } = useUnifiedApp(); // FIXED: Use unified context

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

  // Simplified polling - use unified socket status
  const pollingInterval = isActiveChatPage
    ? isSocketConnected
      ? 30000
      : 5000 // 30s with socket, 5s without
    : isSocketConnected
    ? 60000
    : 30000; // 60s with socket, 30s without

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
          isActiveChatPage,
          interval: pollingInterval,
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

    // Simplified polling configuration
    staleTime: isSocketConnected ? 30000 : 0,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
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
    isSocketConnected,
    socketStatus,
    pollingContext: isActiveChatPage ? "active-chat" : "background-chat",
  };
}
