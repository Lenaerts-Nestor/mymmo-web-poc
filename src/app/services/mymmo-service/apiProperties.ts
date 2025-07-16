import EncryptionService from "../../api/encryption/encryptionService";
import {
  GetAllPropertiesPayload,
  GetAllPropertiesResponse,
  GetActivePropertiesPayload,
  GetActivePropertiesResponse,
} from "../../types/apiEndpoints";

class MyMMOApiProperties {
  /**
   * Get all properties
   * Endpoint: /service/mymmo-service/getAllProperties
   */
  static async getAllProperties(
    payload: GetAllPropertiesPayload
  ): Promise<GetAllPropertiesResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetAllPropertiesResponse>(
          "/service/mymmo-service/getAllProperties",
          payload
        );
      return response;
    } catch (error) {
      console.error("getAllProperties failed:", error);
      throw error;
    }
  }

  /**
   * Get active properties
   * Endpoint: /service/mymmo-service/getActiveProperties
   */
  static async getActiveProperties(
    payload: GetActivePropertiesPayload
  ): Promise<GetActivePropertiesResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetActivePropertiesResponse>(
          "/service/mymmo-service/getActiveProperties",
          payload
        );
      return response;
    } catch (error) {
      console.error("getActiveProperties failed:", error);
      throw error;
    }
  }
}

export default MyMMOApiProperties;
