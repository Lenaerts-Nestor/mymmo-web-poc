import EncryptionService from "../../api/encryption/encryptionService";
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
          payload
        );
      return response;
    } catch (error) {
      console.error("getZonesByPerson failed:", error);
      throw error;
    }
  }

  /**
   * Get zones list (geographical)
   */
  static async getZonesList(
    payload: GetZonesListPayload
  ): Promise<GetZonesListResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetZonesListResponse>(
          "/service/mymmo-service/getZonesList",
          payload
        );
      return response;
    } catch (error) {
      console.error("getZonesList failed:", error);
      throw error;
    }
  }

  /**
   * Get zones by filter
   */
  static async getZonesByFilter(
    payload: GetZonesByFilterPayload
  ): Promise<GetZonesByFilterResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<GetZonesByFilterResponse>(
          "/service/mymmo-service/getZonesByFilter",
          payload
        );
      return response;
    } catch (error) {
      console.error("getZonesByFilter failed:", error);
      throw error;
    }
  }

  /**
   * Create zone
   */
  static async createZone(
    payload: CreateZonePayload
  ): Promise<CreateZoneResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<CreateZoneResponse>(
          "/service/mymmo-service/createZone",
          payload
        );
      return response;
    } catch (error) {
      console.error("createZone failed:", error);
      throw error;
    }
  }

  /**
   * Update zone
   */
  static async updateZone(
    payload: UpdateZonePayload
  ): Promise<UpdateZoneResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<UpdateZoneResponse>(
          "/service/mymmo-service/updateZone",
          payload
        );
      return response;
    } catch (error) {
      console.error("updateZone failed:", error);
      throw error;
    }
  }
}

export default MyMMOApiZone;
