import { describe, it, expect } from "vitest";
import {
    getUserToday,
    getUserYesterday,
    getWeekStartForTimezone,
    DEFAULT_TIMEZONE,
} from "@/lib/utils/date";

describe("date utilities", () => {
    it("getUserToday returns YYYY-MM-DD format", () => {
        const today = getUserToday("UTC");
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("getUserYesterday is one day before getUserToday", () => {
        const today = getUserToday("UTC");
        const yesterday = getUserYesterday("UTC");
        const daysDiff =
            (new Date(today).getTime() - new Date(yesterday).getTime()) /
            (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(1);
    });

    it("different timezones may produce different dates", () => {
        // Pacific and Asia/Tokyo can be a day apart
        const pacific = getUserToday("America/Los_Angeles");
        const tokyo = getUserToday("Asia/Tokyo");
        // Both should be valid dates
        expect(pacific).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(tokyo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("getWeekStartForTimezone returns a Monday", () => {
        const weekStart = getWeekStartForTimezone("UTC");
        const day = new Date(weekStart).getDay();
        expect(day).toBe(1); // Monday
    });

    it("DEFAULT_TIMEZONE is Europe/Moscow", () => {
        expect(DEFAULT_TIMEZONE).toBe("Europe/Moscow");
    });
});
