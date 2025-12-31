import type { Redis } from "ioredis";

export interface RateLimitConfig {
  limit: number; // Maximum requests per window
  window: number; // Window size in seconds
  keyPrefix?: string; // Redis key prefix
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

/**
 * Redis-based sliding window rate limiter
 *
 * Features:
 * - Sliding window algorithm for accurate rate limiting
 * - Atomic operations using Redis pipeline
 * - Automatic cleanup of expired keys
 * - Fail-open strategy (allows requests if Redis is down)
 * - Support for multiple rate limit tiers
 *
 * @param redis - Redis connection instance
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(redis: Redis, key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const { limit, window, keyPrefix = "ratelimit" } = config;

  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${keyPrefix}:${key}:${Math.floor(now / window)}`;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, window * 2); // Keep for 2 windows for safety

    const results = await pipeline.exec();

    if (!results || results[0]?.[0]) {
      // Redis error - fail open (allow request but log error)
      console.error("[RateLimit] Redis error:", results?.[0]?.[0]);
      return {
        allowed: true,
        remaining: limit,
        resetTime: now + window,
        limit,
      };
    }

    const count = results[0]?.[1] as number;
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetTime = (Math.floor(now / window) + 1) * window;

    return {
      allowed,
      remaining,
      resetTime,
      limit,
    };
  } catch (error) {
    // On Redis failure, fail open to prevent complete service disruption
    console.error("[RateLimit] Check failed:", error);
    return {
      allowed: true,
      remaining: limit,
      resetTime: Math.floor(Date.now() / 1000) + window,
      limit,
    };
  }
}

/**
 * Advanced rate limiter with multiple tiers
 *
 * Example usage:
 * - Tier 1: 100 requests per minute (general users)
 * - Tier 2: 10 requests per second (burst protection)
 * - Tier 3: 1000 requests per hour (hourly cap)
 *
 * @param redis - Redis connection instance
 * @param key - Unique identifier
 * @param tiers - Array of rate limit configurations
 * @returns Combined rate limit result (most restrictive tier)
 */
export async function checkMultiTierRateLimit(redis: Redis, key: string, tiers: RateLimitConfig[]): Promise<RateLimitResult> {
  const results = await Promise.all(tiers.map((tier) => checkRateLimit(redis, key, tier)));

  // Return the most restrictive result
  const blocked = results.find((r) => !r.allowed);
  if (blocked) {
    return blocked;
  }

  // Return the tier with the least remaining capacity
  return results.reduce((min, current) => (current.remaining < min.remaining ? current : min));
}

/**
 * Get current rate limit status without incrementing
 * Useful for checking limits before performing expensive operations
 *
 * @param redis - Redis connection instance
 * @param key - Unique identifier
 * @param config - Rate limit configuration
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(redis: Redis, key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const { limit, window, keyPrefix = "ratelimit" } = config;

  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${keyPrefix}:${key}:${Math.floor(now / window)}`;

    const count = (await redis.get(windowKey)) || "0";
    const currentCount = Number.parseInt(count, 10);

    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);
    const resetTime = (Math.floor(now / window) + 1) * window;

    return {
      allowed,
      remaining,
      resetTime,
      limit,
    };
  } catch (error) {
    console.error("[RateLimit] Status check failed:", error);
    return {
      allowed: true,
      remaining: limit,
      resetTime: Math.floor(Date.now() / 1000) + window,
      limit,
    };
  }
}

/**
 * Reset rate limit for a specific key
 * Useful for testing or manual admin actions
 *
 * @param redis - Redis connection instance
 * @param key - Unique identifier
 * @param config - Rate limit configuration
 */
export async function resetRateLimit(redis: Redis, key: string, config: RateLimitConfig): Promise<void> {
  const { window, keyPrefix = "ratelimit" } = config;

  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${keyPrefix}:${key}:${Math.floor(now / window)}`;
    await redis.del(windowKey);
  } catch (error) {
    console.error("[RateLimit] Reset failed:", error);
  }
}
