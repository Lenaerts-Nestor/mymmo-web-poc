import EncryptionService from "../encryption/encryptionService";
import {
  GetZonesByPersonPayload,
  GetZonesByPersonResponse,
  GetZonesListPayload,
  GetZonesListResponse,
  GetZonesByFilterPayload,
  GetZonesByFilterResponse,
  CreateZonePayload,
  CreateZoneResponse,
  UpdateZonePayload,
  UpdateZoneResponse,
} from "../../types/apiEndpoints";

class MyMMOApiZone {
  /**
   * Get zones by person ID
   * Uses longer cache time since zones don't change frequently
   */
  static async getZonesByPerson(
    personId: number,
    userId: number,
    langId: string
  ): Promise<GetZonesByPersonResponse> {
    const payload: GetZonesByPersonPayload = {
      personId,
      userId,
      langId,
    };

    try {
      const response =
        await EncryptionService.secureApiCall<GetZonesByPersonResponse>(
          "/service/mymmo-service/getZonesByPerson",
          payload,
          8 * 60 * 1000, // 8 minutes cache - zones don't change frequently
          true // Enable caching
        );
      return response;
    } catch (error) {
      console.error("getZonesByPerson failed:", error);
      throw error;
    }
  }

  /**
   * Get zones list (geographical)
   * Cache for shorter time since location-based data might change
   */
  static async getZonesList(
    payload: GetZonesListPayload
  ): Promise<GetZonesListResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetZonesListResponse>(
          "/service/mymmo-service/getZonesList",
          payload,
          5 * 60 * 1000, // 5 minutes cache
          true // Enable caching
        );
      return response;
    } catch (error) {
      console.error("getZonesList failed:", error);
      throw error;
    }
  }

  /**
   * Get zones by filter
   * Cache for moderate time
   */
  static async getZonesByFilter(
    payload: GetZonesByFilterPayload
  ): Promise<GetZonesByFilterResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetZonesByFilterResponse>(
          "/service/mymmo-service/getZonesByFilter",
          payload,
          5 * 60 * 1000, // 5 minutes cache
          true // Enable caching
        );
      return response;
    } catch (error) {
      console.error("getZonesByFilter failed:", error);
      throw error;
    }
  }

  /**
   * Create zone
   * No caching for write operations
   */
  static async createZone(
    payload: CreateZonePayload
  ): Promise<CreateZoneResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<CreateZoneResponse>(
          "/service/mymmo-service/createZone",
          payload,
          0, // No cache for write operations
          false // Disable caching
        );

      // Clear relevant caches after creating a zone
      EncryptionService.clearResponseCache();

      return response;
    } catch (error) {
      console.error("createZone failed:", error);
      throw error;
    }
  }

  /**
   * Update zone
   * No caching for write operations
   */
  static async updateZone(
    payload: UpdateZonePayload
  ): Promise<UpdateZoneResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<UpdateZoneResponse>(
          "/service/mymmo-service/updateZone",
          payload,
          0, // No cache for write operations
          false // Disable caching
        );

      // Clear relevant caches after updating a zone
      EncryptionService.clearResponseCache();

      return response;
    } catch (error) {
      console.error("updateZone failed:", error);
      throw error;
    }
  }
}

export default MyMMOApiZone;
