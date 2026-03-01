import { describe, it, expect, vi } from "vitest";
import { checkRateLimit, RATE_LIMITS, rateLimitHeaders } from "@/lib/rate-limit";

describe("rate limiter", () => {
    it("allows requests under the limit", () => {
        const key = `test:${Date.now()}:allow`;
        const result = checkRateLimit(key, { limit: 5, windowSeconds: 60 });
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
    });

    it("blocks requests over the limit", () => {
        const key = `test:${Date.now()}:block`;
        const config = { limit: 3, windowSeconds: 60 };

        checkRateLimit(key, config);
        checkRateLimit(key, config);
        checkRateLimit(key, config);

        const result = checkRateLimit(key, config);
        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it("returns proper headers", () => {
        const key = `test:${Date.now()}:headers`;
        const result = checkRateLimit(key, { limit: 10, windowSeconds: 60 });
        const headers = rateLimitHeaders(result);

        expect(headers["X-RateLimit-Limit"]).toBe("10");
        expect(headers["X-RateLimit-Remaining"]).toBe("9");
        expect(headers["X-RateLimit-Reset"]).toBeDefined();
    });

    it("predefined RATE_LIMITS exist", () => {
        expect(RATE_LIMITS.chat.limit).toBe(20);
        expect(RATE_LIMITS.tool.limit).toBe(10);
        expect(RATE_LIMITS.api.limit).toBe(100);
    });

    it("counts requests across multiple calls", () => {
        const key = `test:${Date.now()}:count`;
        const config = { limit: 5, windowSeconds: 60 };

        for (let i = 0; i < 5; i++) {
            const result = checkRateLimit(key, config);
            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4 - i);
        }

        const blocked = checkRateLimit(key, config);
        expect(blocked.success).toBe(false);
    });
});
