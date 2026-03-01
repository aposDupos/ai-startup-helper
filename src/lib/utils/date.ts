/**
 * Timezone-safe date utilities.
 *
 * All date comparisons (streaks, quests, reports) should use these helpers
 * instead of raw `new Date()` to respect user timezones.
 */

/**
 * Get today's date string (YYYY-MM-DD) in the user's timezone.
 */
export function getUserToday(timezone: string): string {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: timezone }).format(
        new Date()
    );
}

/**
 * Get yesterday's date string (YYYY-MM-DD) in the user's timezone.
 */
export function getUserYesterday(timezone: string): string {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return new Intl.DateTimeFormat("sv-SE", { timeZone: timezone }).format(now);
}

/**
 * Get the Monday (week start) for a given date in the user's timezone.
 */
export function getWeekStartForTimezone(timezone: string, date?: Date): string {
    const d = date ? new Date(date) : new Date();
    // Get day of week in user's timezone
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
    }).format(d);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayIndex = dayNames.indexOf(dayOfWeek);
    const diff = dayIndex === 0 ? -6 : 1 - dayIndex; // Monday offset
    d.setDate(d.getDate() + diff);

    return new Intl.DateTimeFormat("sv-SE", { timeZone: timezone }).format(d);
}

/**
 * Default timezone used when user hasn't set one.
 */
export const DEFAULT_TIMEZONE = "Europe/Moscow";
