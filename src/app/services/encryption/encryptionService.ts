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

  // OPTIMIZED: Different cache strategies for different data types
  private static responseCache = new Map<
    string,
    {
      data: any;
      timestamp: number;
      ttl: number;
    }
  >();

  // OPTIMIZED: Cache configuration types
  private static readonly CACHE_CONFIG: Record<
    string,
    { ttl: number; useCache: boolean }
  > = {
    // Real-time data - short cache
    "/service/mymmo-thread-service/getThreads": {
      ttl: 5 * 1000, // 5 seconds only
      useCache: true,
    },
    // Semi-static data - medium cache
    "/service/mymmo-service/getZonesByPerson": {
      ttl: 2 * 60 * 1000, // 2 minutes
      useCache: true,
    },
    // Static data - long cache
    "/service/mymmo-service/getAllProperties": {
      ttl: 10 * 60 * 1000, // 10 minutes
      useCache: true,
    },
    // Write operations - no cache
    "/service/mymmo-service/createZone": {
      ttl: 0,
      useCache: false,
    },
    "/service/mymmo-service/updateZone": {
      ttl: 0,
      useCache: false,
    },
  };

  /**
   * OPTIMIZED: Clear cache by endpoint pattern
   */
  static clearCacheByPattern(pattern: string): void {
    const keysToDelete = Array.from(this.responseCache.keys()).filter((key) =>
      key.includes(pattern)
    );

    keysToDelete.forEach((key) => {
      this.responseCache.delete(key);
    });

    console.log(
      `EncryptionService: Cleared ${keysToDelete.length} cache entries for pattern: ${pattern}`
    );
  }

  /**
   * Clear response cache (useful for testing or forced refresh)
   */
  static clearResponseCache(): void {
    this.responseCache.clear();
  }

  /**
   * OPTIMIZED: Smart cache key generation
   */
  private static generateCacheKey(endpoint: string, payload: any): string {
    // For threads, include timestamp to prevent stale data
    if (endpoint.includes("getThreads")) {
      const { zoneId, personId, type, transLangId } = payload;
      return `${endpoint}:${zoneId}:${personId}:${type}:${transLangId}`;
    }

    // For other endpoints, use full payload
    return `${endpoint}:${JSON.stringify(payload)}`;
  }

  /**
   * OPTIMIZED: Get cached response with better logic
   */
  private static getCachedResponse<T>(
    cacheKey: string,
    endpoint: string
  ): T | null {
    const cached = this.responseCache.get(cacheKey);
    const config = this.CACHE_CONFIG[endpoint] || {
      ttl: 5 * 60 * 1000,
      useCache: true,
    };

    if (!config.useCache) {
      return null;
    }

    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      console.log(`EncryptionService: Cache HIT for ${endpoint}`);
      return cached.data;
    }

    if (cached) {
      // Remove expired cache entry
      this.responseCache.delete(cacheKey);
      console.log(`EncryptionService: Cache EXPIRED for ${endpoint}`);
    }

    return null;
  }

  /**
   * OPTIMIZED: Cache response with endpoint-specific TTL
   */
  private static setCachedResponse(
    cacheKey: string,
    data: any,
    endpoint: string
  ): void {
    const config = this.CACHE_CONFIG[endpoint] || {
      ttl: 5 * 60 * 1000,
      useCache: true,
    };

    if (!config.useCache || config.ttl === 0) {
      return;
    }

    this.responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
    });

    console.log(
      `EncryptionService: Cache SET for ${endpoint} (TTL: ${config.ttl}ms)`
    );
  }

  /**
   * OPTIMIZED: Get OAuth token with better caching
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
      alert("Data ontsleuteling mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * Perform the actual secure API call (without caching)
   */
  private static async performSecureApiCall<T>(
    endpoint: string,
    payload: any
  ): Promise<T> {
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
      throw error;
    }
  }

  /**
   * OPTIMIZED: Complete secure API call flow with intelligent caching
   */
  static async secureApiCall<T>(
    endpoint: string,
    payload: any,
    cacheTTL?: number, // Optional override
    useCache?: boolean // Optional override
  ): Promise<T> {
    // Use endpoint-specific config or provided overrides
    const config = this.CACHE_CONFIG[endpoint] || {
      ttl: 5 * 60 * 1000,
      useCache: true,
    };
    const finalTTL = cacheTTL !== undefined ? cacheTTL : config.ttl;
    const finalUseCache = useCache !== undefined ? useCache : config.useCache;

    // Create optimized cache key
    const cacheKey = this.generateCacheKey(endpoint, payload);

    // Check cache first if enabled
    if (finalUseCache && finalTTL > 0) {
      const cachedResult = this.getCachedResponse<T>(cacheKey, endpoint);
      if (cachedResult) {
        return cachedResult;
      }
    }

    try {
      // Perform the actual API call
      const result = await this.performSecureApiCall<T>(endpoint, payload);

      // Cache the result if enabled
      if (finalUseCache && finalTTL > 0) {
        this.setCachedResponse(cacheKey, result, endpoint);
      }

      // OPTIMIZED: Clear related caches for write operations
      if (
        endpoint.includes("create") ||
        endpoint.includes("update") ||
        endpoint.includes("delete")
      ) {
        this.clearCacheByPattern("getThreads");
        this.clearCacheByPattern("getZonesByPerson");
      }

      return result;
    } catch (error) {
      console.error("Secure API call failed:", error);
      alert("API aanroep mislukt. Probeer het opnieuw.");
      throw error;
    }
  }

  /**
   * OPTIMIZED: Force refresh specific endpoint
   */
  static async forceRefresh<T>(endpoint: string, payload: any): Promise<T> {
    const cacheKey = this.generateCacheKey(endpoint, payload);
    this.responseCache.delete(cacheKey);

    return this.secureApiCall<T>(endpoint, payload, 0, false);
  }

  /**
   * Clear cached token (for logout or token refresh)
   */
  static clearTokenCache(): void {
    this.tokenCache = null;
  }
}

export default EncryptionService;
