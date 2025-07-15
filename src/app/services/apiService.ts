// src/services/apiService.ts
import {
  GetZonesByPersonPayload,
  GetZonesByPersonResponse,
} from "../types/zones";
import EncryptionService from "./encryptionService";

// TypeScript interfaces for API responses

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
  static async getZonesList(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
   * Create zone
   * Endpoint: /service/mymmo-service/createZone
   */
  static async createZone(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async updateZone(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async getAllProperties(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async getActiveProperties(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async updatePerson(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async deletePersonAccount(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async createCommunicationGroup(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async updateCommunicationGroup(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async sendOtp(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async verifyOtp(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
  static async createPerson(payload: any): Promise<any> {
    try {
      const response = await EncryptionService.secureApiCall(
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
