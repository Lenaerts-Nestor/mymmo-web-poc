import { OAuthTokenResponse } from "@/app/types/ouath/encryption";

class TokenService {
  private static tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  /**
   * Get OAuth token with intelligent caching
   * Includes 2-minute buffer before expiry for safety
   */
  static async getOAuthToken(): Promise<string> {
    const now = Date.now();
    const bufferTime = 2 * 60 * 1000; // 2 minutes buffer before expiry

    // Check if we have a valid cached token with buffer
    if (this.tokenCache && now < this.tokenCache.expiresAt - bufferTime) {
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

      // Cache the token with 43-minute expiration (2 min buffer from 45 min)
      this.tokenCache = {
        token: data.token,
        expiresAt: now + 43 * 60 * 1000,
      };

      return data.token;
    } catch (error) {
      console.error("OAuth token retrieval failed:", error);
      alert("Authenticatie mislukt. Probeer het opnieuw.");
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

export default TokenService;
