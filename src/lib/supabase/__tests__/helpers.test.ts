import { describe, it, expect } from "vitest";
import { toJsonb, fromJsonb, fromJsonbArray } from "@/lib/supabase/helpers";

describe("JSONB helpers", () => {
    it("toJsonb serializes an object", () => {
        const input = { foo: "bar", baz: [1, 2, 3] };
        const result = toJsonb(input);
        expect(result).toEqual({ foo: "bar", baz: [1, 2, 3] });
    });

    it("toJsonb strips undefined values", () => {
        const input = { a: 1, b: undefined };
        const result = toJsonb(input);
        expect(result).toEqual({ a: 1 });
    });

    it("fromJsonb returns parsed value", () => {
        const json = { level: 5, title: "Builder" };
        const result = fromJsonb<{ level: number; title: string }>(json, { level: 1, title: "Default" });
        expect(result.level).toBe(5);
    });

    it("fromJsonb returns fallback for null", () => {
        const result = fromJsonb<string[]>(null, []);
        expect(result).toEqual([]);
    });

    it("fromJsonbArray parses arrays", () => {
        const json = ["a", "b", "c"];
        const result = fromJsonbArray<string>(json);
        expect(result).toEqual(["a", "b", "c"]);
    });

    it("fromJsonbArray returns empty for null", () => {
        const result = fromJsonbArray(null);
        expect(result).toEqual([]);
    });

    it("fromJsonbArray returns empty for non-array json", () => {
        const result = fromJsonbArray("not an array");
        expect(result).toEqual([]);
    });
});
