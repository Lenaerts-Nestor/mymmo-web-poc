class CacheService {
  private static responseCache = new Map<
    string,
    {
      data: any;
      timestamp: number;
      ttl: number;
    }
  >();

  // Cache configuration for different endpoint types
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
   * Generate optimized cache key based on endpoint and payload
   */
  static generateCacheKey(endpoint: string, payload: any): string {
    // For threads, include specific fields to prevent stale data
    if (endpoint.includes("getThreads")) {
      const { zoneId, personId, type, transLangId } = payload;
      return `${endpoint}:${zoneId}:${personId}:${type}:${transLangId}`;
    }

    // For other endpoints, use full payload
    return `${endpoint}:${JSON.stringify(payload)}`;
  }

  /**
   * Get cached response if valid and not expired
   */
  static getCachedResponse<T>(cacheKey: string, endpoint: string): T | null {
    const cached = this.responseCache.get(cacheKey);
    const config = this.CACHE_CONFIG[endpoint] || {
      ttl: 5 * 60 * 1000,
      useCache: true,
    };

    if (!config.useCache) {
      return null;
    }

    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      console.log(`CacheService: Cache HIT for ${endpoint}`);
      return cached.data;
    }

    if (cached) {
      // Remove expired cache entry
      this.responseCache.delete(cacheKey);
      console.log(`CacheService: Cache EXPIRED for ${endpoint}`);
    }

    return null;
  }

  /**
   * Set cached response with endpoint-specific TTL
   */
  static setCachedResponse(
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
      `CacheService: Cache SET for ${endpoint} (TTL: ${config.ttl}ms)`
    );
  }

  /**
   * Clear cache entries by endpoint pattern
   */
  static clearCacheByPattern(pattern: string): void {
    const keysToDelete = Array.from(this.responseCache.keys()).filter((key) =>
      key.includes(pattern)
    );

    keysToDelete.forEach((key) => {
      this.responseCache.delete(key);
    });

    console.log(
      `CacheService: Cleared ${keysToDelete.length} cache entries for pattern: ${pattern}`
    );
  }

  /**
   * Clear all cached responses
   */
  static clearAllCache(): void {
    this.responseCache.clear();
    console.log("CacheService: All cache cleared");
  }

  /**
   * Get cache configuration for an endpoint
   */
  static getCacheConfig(endpoint: string): { ttl: number; useCache: boolean } {
    return (
      this.CACHE_CONFIG[endpoint] || {
        ttl: 5 * 60 * 1000,
        useCache: true,
      }
    );
  }

  /**
   * Remove specific cache entry
   */
  static removeCacheEntry(cacheKey: string): void {
    this.responseCache.delete(cacheKey);
  }
}

export default CacheService;
