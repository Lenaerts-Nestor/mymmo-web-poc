import TokenService from "./tokenService";
import EncryptionService from "./encryptionService";
import CacheService from "./cacheService";

class ApiClient {
  /**
   * Perform secure API call without caching
   */
  private static async performSecureApiCall<T>(
    endpoint: string,
    payload: any
  ): Promise<T> {
    try {
      // Step 1: Encrypt the payload
      const encryptedPayload = await EncryptionService.encryptData(payload);

      // Step 2: Make the API call with encrypted payload
      const token = await TokenService.getOAuthToken();
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
      const decryptedData = await EncryptionService.decryptData<T>(
        cleanEncryptedResponse
      );

      return decryptedData;
    } catch (error) {
      console.error("Secure API call failed:", error);
      throw error;
    }
  }

  /**
   * Complete secure API call flow with intelligent caching
   */
  static async secureApiCall<T>(
    endpoint: string,
    payload: any,
    cacheTTL?: number, // Optional override
    useCache?: boolean // Optional override
  ): Promise<T> {
    // Use endpoint-specific config or provided overrides
    const config = CacheService.getCacheConfig(endpoint);
    const finalTTL = cacheTTL !== undefined ? cacheTTL : config.ttl;
    const finalUseCache = useCache !== undefined ? useCache : config.useCache;

    // Create optimized cache key
    const cacheKey = CacheService.generateCacheKey(endpoint, payload);

    // Check cache first if enabled
    if (finalUseCache && finalTTL > 0) {
      const cachedResult = CacheService.getCachedResponse<T>(
        cacheKey,
        endpoint
      );
      if (cachedResult) {
        return cachedResult;
      }
    }

    try {
      // Perform the actual API call
      const result = await this.performSecureApiCall<T>(endpoint, payload);

      // Cache the result if enabled
      if (finalUseCache && finalTTL > 0) {
        CacheService.setCachedResponse(cacheKey, result, endpoint);
      }

      // Clear related caches for write operations
      if (
        endpoint.includes("create") ||
        endpoint.includes("update") ||
        endpoint.includes("delete")
      ) {
        CacheService.clearCacheByPattern("getThreads");
        CacheService.clearCacheByPattern("getZonesByPerson");
      }

      return result;
    } catch (error) {
      console.error("Secure API call failed:", error);
      alert("API aanroep mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Force refresh specific endpoint (bypass cache)
   */
  static async forceRefresh<T>(endpoint: string, payload: any): Promise<T> {
    const cacheKey = CacheService.generateCacheKey(endpoint, payload);
    CacheService.removeCacheEntry(cacheKey);

    return this.secureApiCall<T>(endpoint, payload, 0, false);
  }

  /**
   * Clear cached token (for logout or token refresh)
   */
  static clearTokenCache(): void {
    TokenService.clearTokenCache();
  }

  /**
   * Clear response cache by pattern
   */
  static clearCacheByPattern(pattern: string): void {
    CacheService.clearCacheByPattern(pattern);
  }

  /**
   * Clear all response cache
   */
  static clearResponseCache(): void {
    CacheService.clearAllCache();
  }

  /**
   * Upload file without encryption (for file uploads)
   */
  static async uploadFile(file: File, endpoint: string): Promise<any> {
    try {
      const token = await TokenService.getOAuthToken();
      const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${serviceRegistry}${endpoint}`, {
        method: "POST",
        headers: {
          "x-client-id": "1",
          "x-secret-key": token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  }
}

export default ApiClient;
