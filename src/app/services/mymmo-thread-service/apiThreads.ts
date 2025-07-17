import ApiClient from "../encryption/apiClient";
import { GetThreadsPayload, GetThreadsResponse } from "../../types/threads";

class MyMMOApiThreads {
  /**
   * Get threads with smart caching for real-time updates
   * Uses 5-second cache TTL for smooth real-time feel
   */
  static async getThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
      // Use the optimized ApiClient
      // No need to specify cache params - it uses endpoint-specific config
      const response = await ApiClient.secureApiCall<GetThreadsResponse>(
        "/service/mymmo-thread-service/getThreads",
        payload
      );

      return response;
    } catch (error) {
      console.error("getThreads failed:", error);
      throw error;
    }
  }

  /**
   * Force refresh threads (bypass cache)
   * Useful for manual refresh or after important actions
   */
  static async refreshThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
      const response = await ApiClient.forceRefresh<GetThreadsResponse>(
        "/service/mymmo-thread-service/getThreads",
        payload
      );

      return response;
    } catch (error) {
      console.error("refreshThreads failed:", error);
      throw error;
    }
  }

  /**
   * Clear threads cache manually
   * Useful when you know data has changed
   */
  static clearThreadsCache(): void {
    ApiClient.clearCacheByPattern("getThreads");
  }
}

export default MyMMOApiThreads;
