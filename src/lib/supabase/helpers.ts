/**
 * Type-safe JSONB conversion helpers for Supabase.
 *
 * Supabase returns JSONB columns as `Json` type (basically `unknown`).
 * These helpers provide safe conversion with runtime validation.
 */

import type { Json } from "@/types/database";

/**
 * Convert a typed object to Supabase Json for INSERT/UPDATE.
 * Essentially strips the TypeScript type for safe storage.
 */
export function toJsonb<T>(value: T): Json {
    return JSON.parse(JSON.stringify(value)) as Json;
}

/**
 * Parse a JSONB value from Supabase into a typed object.
 * Returns the value cast to T, or the fallback if null/undefined.
 */
export function fromJsonb<T>(json: Json | null | undefined, fallback: T): T {
    if (json === null || json === undefined) return fallback;
    return json as unknown as T;
}

/**
 * Parse a JSONB array from Supabase.
 */
export function fromJsonbArray<T>(json: Json | null | undefined): T[] {
    if (!json || !Array.isArray(json)) return [];
    return json as unknown as T[];
}
