import { DecryptResponse, EncryptResponse } from "@/app/types/ouath/encryption";
import TokenService from "./tokenService";

class EncryptionService {
  /**
   * Encrypt data payload via server-side API
   */
  static async encryptData(payload: any): Promise<string> {
    try {
      const token = await TokenService.getOAuthToken();

      const response = await fetch("/api/encryption/encrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload, token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Encryption failed");
      }

      const data: EncryptResponse = await response.json();
      return data.encrypted;
    } catch (error) {
      console.error("Data encryption failed:", error);
      alert("Data versleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Decrypt data response via server-side API
   */
  static async decryptData<T>(encryptedString: string): Promise<T> {
    try {
      const token = await TokenService.getOAuthToken();

      const response = await fetch("/api/encryption/decrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encrypted: encryptedString, token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Decryption failed");
      }

      const data: DecryptResponse = await response.json();
      return data.decrypted as T;
    } catch (error) {
      console.error("Data decryption failed:", error);
      alert("Data ontsleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }
}

export default EncryptionService;
