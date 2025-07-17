// src/app/services/mymmo-service/apiThreads.ts

import EncryptionService from "../../api/encryption/encryptionService";
import { GetThreadsPayload, GetThreadsResponse } from "../../types/threads";

class MyMMOApiThreads {
  /**
   * Get threads for a specific zone
   * Endpoint: /service/mymmo-thread-service/getThreads
   */
  static async getThreads(
    payload: GetThreadsPayload
  ): Promise<GetThreadsResponse> {
    try {
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
}

export default MyMMOApiThreads;
