// src/services/apiService.ts

import EncryptionService from "../api/encryption/encryptionService";
import {
  // Properties
  GetAllPropertiesPayload,
  GetAllPropertiesResponse,
  GetActivePropertiesPayload,
  GetActivePropertiesResponse,

  // Zones List & Management
  GetZonesListPayload,
  GetZonesListResponse,
  GetZonesByFilterPayload,
  CreateZonePayload,
  CreateZoneResponse,
  UpdateZonePayload,
  UpdateZoneResponse,

  // Person Management
  CreatePersonPayload,
  CreatePersonResponse,
  UpdatePersonPayload,
  UpdatePersonResponse,
  DeletePersonAccountPayload,
  DeletePersonAccountResponse,

  // OTP
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,

  // Communication Groups
  CreateCommunicationGroupPayload,
  CreateCommunicationGroupResponse,
  UpdateCommunicationGroupPayload,
  UpdateCommunicationGroupResponse,
  GetZonesByPersonPayload,
  GetZonesByPersonResponse,
  GetZonesByFilterResponse,
} from "../types/apiEndpoints";

class MyMMOAPI {
  /**
   * Get zones by person ID
   * Endpoint: /service/mymmo-service/getZonesByPerson
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
   * Endpoint: /service/mymmo-service/getZonesList
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
   * Endpoint: /service/mymmo-service/getZonesByFilter
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
   * Endpoint: /service/mymmo-service/createZone
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
   * Endpoint: /service/mymmo-service/updateZone
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

  /**
   * Update person
   * Endpoint: /service/mymmo-service/updatePerson
   */
  static async updatePerson(
    payload: UpdatePersonPayload
  ): Promise<UpdatePersonResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<UpdatePersonResponse>(
          "/service/mymmo-service/updatePerson",
          payload
        );

      return response;
    } catch (error) {
      console.error("updatePerson failed:", error);
      throw error;
    }
  }

  /**
   * Delete person account
   * Endpoint: /service/mymmo-service/deletePersonAccount
   */
  static async deletePersonAccount(
    payload: DeletePersonAccountPayload
  ): Promise<DeletePersonAccountResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<DeletePersonAccountResponse>(
          "/service/mymmo-service/deletePersonAccount",
          payload
        );

      return response;
    } catch (error) {
      console.error("deletePersonAccount failed:", error);
      throw error;
    }
  }

  /**
   * Create communication group
   * Endpoint: /service/mymmo-service/createCommunicationGroup
   */
  static async createCommunicationGroup(
    payload: CreateCommunicationGroupPayload
  ): Promise<CreateCommunicationGroupResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<CreateCommunicationGroupResponse>(
          "/service/mymmo-service/createCommunicationGroup",
          payload
        );

      return response;
    } catch (error) {
      console.error("createCommunicationGroup failed:", error);
      throw error;
    }
  }

  /**
   * Update communication group
   * Endpoint: /service/mymmo-service/updateCommunicationGroup
   */
  static async updateCommunicationGroup(
    payload: UpdateCommunicationGroupPayload
  ): Promise<UpdateCommunicationGroupResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<UpdateCommunicationGroupResponse>(
          "/service/mymmo-service/updateCommunicationGroup",
          payload
        );

      return response;
    } catch (error) {
      console.error("updateCommunicationGroup failed:", error);
      throw error;
    }
  }

  /**
   * Send OTP
   * Endpoint: /service/mymmo-service/sendOtp
   */
  static async sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
    try {
      const response = await EncryptionService.secureApiCall<SendOtpResponse>(
        "/service/mymmo-service/sendOtp",
        payload
      );

      return response;
    } catch (error) {
      console.error("sendOtp failed:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   * Endpoint: /service/mymmo-service/verifyOtp
   */
  static async verifyOtp(
    payload: VerifyOtpPayload
  ): Promise<VerifyOtpResponse> {
    try {
      const response = await EncryptionService.secureApiCall<VerifyOtpResponse>(
        "/service/mymmo-service/verifyOtp",
        payload
      );

      return response;
    } catch (error) {
      console.error("verifyOtp failed:", error);
      throw error;
    }
  }

  /**
   * Create person
   * Endpoint: /service/mymmo-service/createPerson
   */
  static async createPerson(
    payload: CreatePersonPayload
  ): Promise<CreatePersonResponse> {
    try {
      const response =
        await EncryptionService.secureApiCall<CreatePersonResponse>(
          "/service/mymmo-service/createPerson",
          payload
        );

      return response;
    } catch (error) {
      console.error("createPerson failed:", error);
      throw error;
    }
  }
}

export default MyMMOAPI;
