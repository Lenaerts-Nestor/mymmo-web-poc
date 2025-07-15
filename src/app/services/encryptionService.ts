// src/services/encryptionService.ts

interface OAuthResponse {
  data: {
    token: string;
    expires_at: string;
  };
}

class EncryptionService {
  private static tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  private static readonly BASE_URL = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;
  private static readonly CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  private static readonly CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

  /**
   * Get OAuth token with 1-hour caching
   */
  static async getOAuthToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid cached token
    if (this.tokenCache && now < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    try {
      // Create form data for OAuth request
      const formData = new FormData();
      formData.append("client_secret", this.CLIENT_SECRET!);

      const response = await fetch(`${this.BASE_URL}/oauth`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OAuth request failed: ${response.status}`);
      }

      const data: OAuthResponse = await response.json();

      // Cache the token with 1-hour expiration
      this.tokenCache = {
        token: data.data.token,
        expiresAt: now + 60 * 60 * 1000, // 1 hour from now
      };

      return data.data.token;
    } catch (error) {
      console.error("OAuth token retrieval failed:", error);
      alert("Authenticatie mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Encrypt data payload
   */
  static async encryptData(payload: any): Promise<string> {
    try {
      const token = await this.getOAuthToken();

      const response = await fetch(`${this.BASE_URL}/encrypt-decrypt/encrypt`, {
        method: "POST",
        headers: {
          "x-client-id": this.CLIENT_ID!,
          "x-secret-key": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Encryption failed: ${response.status}`);
      }

      const encryptedString = await response.text();
      return encryptedString.replace(/^"|"$/g, ""); // Remove surrounding quotes
    } catch (error) {
      console.error("Data encryption failed:", error);
      alert("Data versleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Decrypt data response
   */
  static async decryptData<T>(encryptedString: string): Promise<T> {
    try {
      const token = await this.getOAuthToken();

      const response = await fetch(`${this.BASE_URL}/encrypt-decrypt/decrypt`, {
        method: "POST",
        headers: {
          "x-client-id": this.CLIENT_ID!,
          "x-secret-key": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encryptedString),
      });

      if (!response.ok) {
        throw new Error(`Decryption failed: ${response.status}`);
      }

      const decryptedData = await response.json();
      return decryptedData as T;
    } catch (error) {
      console.error("Data decryption failed:", error);
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
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "x-client-id": this.CLIENT_ID!,
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
