// src/app/services/mymmo-thread-service/apiThreads.ts

import EncryptionService from "../encryption/encryptionService";
import { GetThreadsPayload, GetThreadsResponse } from "../../types/threads";

class MyMMOApiThreads {
  /**
   * OPTIMIZED: Get threads with smart caching for real-time updates
   * Uses 5-second cache TTL for smooth real-time feel
   */
  static async getThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
      // Use the optimized encryption service
      // No need to specify cache params - it uses endpoint-specific config
      const response =
        await EncryptionService.secureApiCall<GetThreadsResponse>(
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
   * OPTIMIZED: Force refresh threads (bypass cache)
   * Useful for manual refresh or after important actions
   */
  static async refreshThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
      const response = await EncryptionService.forceRefresh<GetThreadsResponse>(
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
   * OPTIMIZED: Clear threads cache manually
   * Useful when you know data has changed
   */
  static clearThreadsCache(): void {
    EncryptionService.clearCacheByPattern("getThreads");
  }
}

export default MyMMOApiThreads;
