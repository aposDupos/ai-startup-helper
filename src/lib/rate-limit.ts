/**
 * In-memory rate limiter.
 *
 * Uses a simple sliding-window counter per user-key.
 * For production with multiple server instances, replace with Upstash/Redis.
 */

import { logger } from "@/lib/logger";

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /** Max requests in the window */
    limit: number;
    /** Window size in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
}

/**
 * Check rate limit for a given key (typically userId + action).
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    const remaining = Math.max(0, config.limit - entry.timestamps.length);
    const oldestInWindow = entry.timestamps[0] ?? now;
    const resetMs = oldestInWindow + windowMs;

    if (entry.timestamps.length >= config.limit) {
        logger.warn("RateLimit", `Limit exceeded for key=${key}`);
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            resetMs,
        };
    }

    entry.timestamps.push(now);
    return {
        success: true,
        limit: config.limit,
        remaining: remaining - 1,
        resetMs,
    };
}

// ---------------------------------------------------------------------------
// Predefined rate limits
// ---------------------------------------------------------------------------

export const RATE_LIMITS = {
    chat: { limit: 20, windowSeconds: 60 } satisfies RateLimitConfig,
    tool: { limit: 10, windowSeconds: 60 } satisfies RateLimitConfig,
    api: { limit: 100, windowSeconds: 60 } satisfies RateLimitConfig,
} as const;

/**
 * Build rate-limit headers for HTTP response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000)),
    };
}
