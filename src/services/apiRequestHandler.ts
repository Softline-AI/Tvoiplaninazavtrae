/**
 * Universal API Request Handler with retry logic, rate limiting, and caching
 */

interface RequestConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  cacheDuration?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RateLimiter {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number;
}

class ApiRequestHandler {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  private readonly DEFAULT_CONFIG: Required<RequestConfig> = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    cacheDuration: 300000, // 5 minutes
  };

  /**
   * Initialize rate limiter for a domain
   */
  private initRateLimiter(domain: string, maxTokens: number = 10, refillRate: number = 1): void {
    if (!this.rateLimiters.has(domain)) {
      this.rateLimiters.set(domain, {
        tokens: maxTokens,
        lastRefill: Date.now(),
        maxTokens,
        refillRate,
      });
    }
  }

  /**
   * Check and consume rate limit token
   */
  private async consumeRateLimit(domain: string): Promise<void> {
    this.initRateLimiter(domain);
    const limiter = this.rateLimiters.get(domain)!;

    const now = Date.now();
    const timePassed = now - limiter.lastRefill;
    const tokensToAdd = (timePassed / 1000) * limiter.refillRate;

    limiter.tokens = Math.min(limiter.maxTokens, limiter.tokens + tokensToAdd);
    limiter.lastRefill = now;

    if (limiter.tokens < 1) {
      const waitTime = ((1 - limiter.tokens) / limiter.refillRate) * 1000;
      console.log(`[RateLimit] ⏳ Waiting ${Math.round(waitTime)}ms for ${domain}`);
      await this.sleep(waitTime);
      limiter.tokens = 1;
    }

    limiter.tokens -= 1;
  }

  /**
   * Get cache key from URL
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string, maxAge: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] 📦 Cache hit for ${key.substring(0, 50)}...`);
    return entry.data as T;
  }

  /**
   * Save data to cache
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getBackoffDelay(attempt: number, baseDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 30000);
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Main request method with retry logic
   */
  async request<T>(
    url: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<T | null> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    const cached = this.getFromCache<T>(cacheKey, finalConfig.cacheDuration);
    if (cached !== null) {
      return cached;
    }

    // Deduplicate concurrent requests
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log(`[Request] 🔄 Waiting for pending request: ${url.substring(0, 50)}...`);
      return pending;
    }

    // Extract domain for rate limiting
    const domain = new URL(url).hostname;

    // Create new request promise
    const requestPromise = this.executeRequest<T>(
      url,
      options,
      finalConfig,
      domain,
      cacheKey
    );

    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    config: Required<RequestConfig>,
    domain: string,
    cacheKey: string
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        // Rate limiting
        await this.consumeRateLimit(domain);

        const startTime = Date.now();
        console.log(`[Request] 🔍 Attempt ${attempt + 1}/${config.maxRetries}: ${url.substring(0, 60)}...`);

        const response = await this.fetchWithTimeout(url, options, config.timeout);
        const duration = Date.now() - startTime;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[Request] ✅ Success in ${duration}ms`);

        // Cache successful response
        this.setCache(cacheKey, data);

        return data as T;
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now();

        console.error(
          `[Request] ❌ Attempt ${attempt + 1} failed:`,
          error instanceof Error ? error.message : 'Unknown error'
        );

        // Don't retry on certain errors
        if (
          error instanceof Error &&
          (error.name === 'AbortError' ||
            error.message.includes('HTTP 4')) // 4xx errors
        ) {
          console.log('[Request] 🚫 Non-retryable error, stopping');
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < config.maxRetries - 1) {
          const delay = this.getBackoffDelay(attempt, config.retryDelay);
          console.log(`[Request] ⏳ Waiting ${Math.round(delay)}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    console.error(
      `[Request] 💥 All ${config.maxRetries} attempts failed for: ${url.substring(0, 60)}...`
    );
    return null;
  }

  /**
   * Batch requests with concurrency limit
   */
  async batchRequest<T>(
    urls: string[],
    options: RequestInit = {},
    config: RequestConfig = {},
    concurrency: number = 5
  ): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      const promise = this.request<T>(url, options, config).then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Cache] 🗑️ Cache cleared');
  }

  /**
   * Clear specific domain cache
   */
  clearDomainCache(domain: string): void {
    for (const [key] of this.cache) {
      if (key.includes(domain)) {
        this.cache.delete(key);
      }
    }
    console.log(`[Cache] 🗑️ Cache cleared for domain: ${domain}`);
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; domains: string[] } {
    const domains = new Set<string>();
    for (const [key] of this.cache) {
      try {
        const url = key.split(':')[1];
        if (url) {
          const domain = new URL(url).hostname;
          domains.add(domain);
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    return {
      size: this.cache.size,
      domains: Array.from(domains),
    };
  }
}

export const apiRequestHandler = new ApiRequestHandler();
export type { RequestConfig };
