import EncryptionService from "../encryption/encryptionService";
import {
  CreatePersonPayload,
  CreatePersonResponse,
  UpdatePersonPayload,
  UpdatePersonResponse,
  DeletePersonAccountPayload,
  DeletePersonAccountResponse,
} from "../../types/apiEndpoints";

class MyMMOApiPerson {
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
}

export default MyMMOApiPerson;
