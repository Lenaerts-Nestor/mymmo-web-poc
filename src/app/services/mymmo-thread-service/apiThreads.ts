// src/app/services/mymmo-thread-service/apiThreads.ts - FIXED WITH CORRECT ENDPOINTS

import ApiClient from "../encryption/apiClient";
import { GetThreadsPayload, GetThreadsResponse } from "../../types/threads";

// ===== MESSAGE TYPES =====
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
  attachments?: any[];
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
  archiveStatus?: boolean;
}

export interface ThreadStatusUpdateResponse {
  data: {
    message: string;
  };
}

// 🆕 Thread Last Access Update Interface (for correct unread counter updates)
export interface ThreadLastAccessUpdatePayload {
  threadId: string;
  personId: number;
}

class MyMMOApiThreads {
  /**
   * Get threads with smart caching for real-time updates
   */
  static async getThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
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
   * Get thread details with messages - OPTIMIZED FOR REAL-TIME
   */
  static async getThreadDetails(
    payload: GetThreadDetailsPayload
  ): Promise<GetThreadDetailsResponse> {
    try {
      const response = await ApiClient.secureApiCall<GetThreadDetailsResponse>(
        "/service/mymmo-thread-service/getThreadDetails",
        payload,
        2 * 1000, // 2 seconds cache for ultra real-time feel
        true
      );
      return response;
    } catch (error) {
      console.error("getThreadDetails failed:", error);
      throw error;
    }
  }

  /**
   * Send message to thread - ENHANCED CACHE INVALIDATION
   */
  static async saveMessage(
    payload: SaveMessagePayload
  ): Promise<SaveMessageResponse> {
    try {
      const response = await ApiClient.secureApiCall<SaveMessageResponse>(
        "/service/mymmo-thread-service/saveMessage",
        payload,
        0,
        false
      );

      // 🚀 ENHANCED: Clear multiple caches for immediate updates
      ApiClient.clearCacheByPattern("getThreadDetails");
      ApiClient.clearCacheByPattern("getThreads");
      ApiClient.clearCacheByPattern("getZonesByPerson"); // Also clear zones to update unread counts

      return response;
    } catch (error) {
      console.error("saveMessage failed:", error);
      throw error;
    }
  }

  /**
   * 🔧 FIXED: Update thread status (mark as completed) - DIFFERENT FROM MARK AS READ
   */
  static async updateThreadStatus(
    payload: ThreadStatusUpdatePayload
  ): Promise<ThreadStatusUpdateResponse> {
    try {
      const response =
        await ApiClient.secureApiCall<ThreadStatusUpdateResponse>(
          "/service/mymmo-thread-service/threadStatusUpdate",
          payload,
          0,
          false
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
   * 🆕 NEW: Update thread last access (CORRECT endpoint for mark as read)
   * This is the RIGHT endpoint that updates last_accessed for unread counts
   */
  static async updateThreadLastAccess(payload: {
    threadId: string;
    personId: number;
  }): Promise<ThreadStatusUpdateResponse> {
    try {
      // 🔧 TRY CORRECT ENDPOINT: Send personId and let backend handle it
      const response =
        await ApiClient.secureApiCall<ThreadStatusUpdateResponse>(
          "/service/mymmo-thread-service/threadLastAccessUpdate",
          {
            threadId: payload.threadId,
            personId: payload.personId, // Try camelCase first
          },
          0,
          false
        );

      // 🚀 IMMEDIATE: Clear caches for instant read status update
      ApiClient.clearCacheByPattern("getThreadDetails");
      ApiClient.clearCacheByPattern("getThreads");
      ApiClient.clearCacheByPattern("getZonesByPerson");

      return response;
    } catch (error) {
      console.error(
        "updateThreadLastAccess with personId failed, trying personid:",
        error
      );

      // 🔧 FALLBACK: Try lowercase 'personid' if camelCase fails
      try {
        const response =
          await ApiClient.secureApiCall<ThreadStatusUpdateResponse>(
            "/service/mymmo-thread-service/threadLastAccessUpdate",
            {
              threadId: payload.threadId,
              personid: payload.personId, // Try lowercase
            },
            0,
            false
          );

        // Clear caches on success
        ApiClient.clearCacheByPattern("getThreadDetails");
        ApiClient.clearCacheByPattern("getThreads");
        ApiClient.clearCacheByPattern("getZonesByPerson");

        return response;
      } catch (fallbackError) {
        console.error("Both personId and personid failed:", fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Force refresh threads (bypass cache)
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
   * Force refresh thread details (bypass cache)
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
   */
  static clearThreadsCache(): void {
    ApiClient.clearCacheByPattern("getThreads");
  }

  /**
   * Clear thread details cache manually
   */
  static clearThreadDetailsCache(): void {
    ApiClient.clearCacheByPattern("getThreadDetails");
  }
}

export default MyMMOApiThreads;
