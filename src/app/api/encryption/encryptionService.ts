import {
  DecryptResponse,
  EncryptResponse,
  OAuthTokenResponse,
} from "@/app/types/ouath/encryption";

class EncryptionService {
  private static tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  /**
   * Get OAuth token with 1-hour caching (via server-side API)
   */
  static async getOAuthToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid cached token
    if (this.tokenCache && now < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OAuth request failed");
      }

      const data: OAuthTokenResponse = await response.json();

      // Cache the token with 1-hour expiration
      this.tokenCache = {
        token: data.token,
        expiresAt: now + 60 * 60 * 1000, // 1 hour from now
      };

      return data.token;
    } catch (error) {
      console.error("OAuth token retrieval failed:", error);
      // TODO: Replace with proper UI notification in next step
      alert("Authenticatie mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Encrypt data payload (via server-side API)
   */
  static async encryptData(payload: any): Promise<string> {
    try {
      const token = await this.getOAuthToken();

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
      // TODO: Replace with proper UI notification in next step
      alert("Data versleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Decrypt data response (via server-side API)
   */
  static async decryptData<T>(encryptedString: string): Promise<T> {
    try {
      const token = await this.getOAuthToken();

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
      // TODO: Replace with proper UI notification in next step
      alert("Data ontsleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Complete secure API call flow: encrypt → call → decrypt
   */
  static async secureApiCall<T>(endpoint: string, payload: any): Promise<T> {
    try {
      // Step 1: Encrypt the payload
      const encryptedPayload = await this.encryptData(payload);

      // Step 2: Make the API call with encrypted payload
      const token = await this.getOAuthToken();
      const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;

      const response = await fetch(`${serviceRegistry}${endpoint}`, {
        method: "POST",
        headers: {
          "x-client-id": "1",
          "x-secret-key": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encryptedPayload),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const encryptedResponse = await response.text();
      const cleanEncryptedResponse = encryptedResponse.replace(/^"|"$/g, "");

      // Step 3: Decrypt the response
      const decryptedData = await this.decryptData<T>(cleanEncryptedResponse);

      return decryptedData;
    } catch (error) {
      console.error("Secure API call failed:", error);
      // TODO: Replace with proper UI notification in next step
      alert("API aanroep mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Clear cached token (for logout or token refresh)
   */
  static clearTokenCache(): void {
    this.tokenCache = null;
  }
}

export default EncryptionService;
