import TokenService from "./tokenService";
import EncryptionService from "./encryptionService";
import CacheService from "./cacheService";

class ApiClient {
  private static async performSecureApiCall<T>(
    endpoint: string,
    payload: any
  ): Promise<T> {
    try {
      const encryptedPayload = await EncryptionService.encryptData(payload);

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
    cacheTTL?: number,
    useCache?: boolean
  ): Promise<T> {
    const config = CacheService.getCacheConfig(endpoint);
    const finalTTL = cacheTTL !== undefined ? cacheTTL : config.ttl;
    const finalUseCache = useCache !== undefined ? useCache : config.useCache;

    const cacheKey = CacheService.generateCacheKey(endpoint, payload);

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
      const result = await this.performSecureApiCall<T>(endpoint, payload);

      if (finalUseCache && finalTTL > 0) {
        CacheService.setCachedResponse(cacheKey, result, endpoint);
      }

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

  static async forceRefresh<T>(endpoint: string, payload: any): Promise<T> {
    const cacheKey = CacheService.generateCacheKey(endpoint, payload);
    CacheService.removeCacheEntry(cacheKey);

    return this.secureApiCall<T>(endpoint, payload, 0, false);
  }

  static clearTokenCache(): void {
    TokenService.clearTokenCache();
  }

  static clearCacheByPattern(pattern: string): void {
    CacheService.clearCacheByPattern(pattern);
  }

  static clearResponseCache(): void {
    CacheService.clearAllCache();
  }

  static async uploadFile(file: File, endpoint: string): Promise<any> {
    try {
      const token = await TokenService.getOAuthToken();
      const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;

      const formData = new FormData();
      formData.append("file", file);

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
