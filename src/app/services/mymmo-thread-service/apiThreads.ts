// src/app/services/mymmo-thread-service/apiThreads.ts - ENHANCED WITH MESSAGING

import ApiClient from "../encryption/apiClient";
import { GetThreadsPayload, GetThreadsResponse } from "../../types/threads";

// ===== NEW MESSAGE TYPES =====
export interface ThreadMessage {
  _id: string;
  text: string;
  attachments: any[];
  thread_id: string;
  lang_id_detected: string;
  metadata: {
    recipients: number[];
  };
  is_deleted: boolean;
  created_by: number;
  created_on: string;
  updated_on: string;
  updated_by: number | null;
  __v: number;
  first_message?: boolean;
  firstname?: string;
}

export interface GetThreadDetailsPayload {
  threadId: string;
  transLangId: string;
  personId: number;
}

export interface GetThreadDetailsResponse {
  data: {
    readMessages: ThreadMessage[];
    unreadMessages: ThreadMessage[];
  };
}

export interface SaveMessagePayload {
  threadId: string;
  text: string;
  createdBy: number;
  completed: boolean;
}

export interface SaveMessageResponse {
  data: {
    message: string;
    messageId: string;
  };
}

export interface ThreadStatusUpdatePayload {
  threadId: string;
  personId: number;
}

export interface ThreadStatusUpdateResponse {
  data: {
    message: string;
  };
}

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
   * 🆕 Get thread details with messages
   * REAL-TIME: Short cache for active chat experience
   */
  static async getThreadDetails(
    payload: GetThreadDetailsPayload
  ): Promise<GetThreadDetailsResponse> {
    try {
      const response = await ApiClient.secureApiCall<GetThreadDetailsResponse>(
        "/service/mymmo-thread-service/getThreadDetails",
        payload,
        3 * 1000, // 3 seconds cache for real-time feel
        true // Enable caching
      );

      return response;
    } catch (error) {
      console.error("getThreadDetails failed:", error);
      throw error;
    }
  }

  /**
   * 🆕 Send message to thread
   * NO CACHE: Always fresh for write operations
   */
  static async saveMessage(
    payload: SaveMessagePayload
  ): Promise<SaveMessageResponse> {
    try {
      const response = await ApiClient.secureApiCall<SaveMessageResponse>(
        "/service/mymmo-thread-service/saveMessage",
        payload,
        0, // No cache for write operations
        false // Disable caching
      );

      // Clear thread details cache to force refresh
      ApiClient.clearCacheByPattern("getThreadDetails");
      ApiClient.clearCacheByPattern("getThreads");

      return response;
    } catch (error) {
      console.error("saveMessage failed:", error);
      throw error;
    }
  }

  /**
   * 🆕 Update thread status (mark as read)
   * NO CACHE: Always fresh for write operations
   */
  static async updateThreadStatus(
    payload: ThreadStatusUpdatePayload
  ): Promise<ThreadStatusUpdateResponse> {
    try {
      const response =
        await ApiClient.secureApiCall<ThreadStatusUpdateResponse>(
          "/service/mymmo-thread-service/threadStatusUpdate",
          payload,
          0, // No cache for write operations
          false // Disable caching
        );

      // Clear relevant caches after status update
      ApiClient.clearCacheByPattern("getThreads");
      ApiClient.clearCacheByPattern("getThreadDetails");

      return response;
    } catch (error) {
      console.error("updateThreadStatus failed:", error);
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
   * 🆕 Force refresh thread details (bypass cache)
   * Useful after sending message or marking as read
   */
  static async refreshThreadDetails(
    payload: GetThreadDetailsPayload
  ): Promise<GetThreadDetailsResponse> {
    try {
      const response = await ApiClient.forceRefresh<GetThreadDetailsResponse>(
        "/service/mymmo-thread-service/getThreadDetails",
        payload
      );

      return response;
    } catch (error) {
      console.error("refreshThreadDetails failed:", error);
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

  /**
   * 🆕 Clear thread details cache manually
   * Useful when you know messages have changed
   */
  static clearThreadDetailsCache(): void {
    ApiClient.clearCacheByPattern("getThreadDetails");
  }
}

export default MyMMOApiThreads;
