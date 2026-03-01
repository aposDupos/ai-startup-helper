import { describe, it, expect } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
    it("exports debug, info, warn, error methods", () => {
        expect(typeof logger.debug).toBe("function");
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.error).toBe("function");
    });

    it("does not throw when called", () => {
        expect(() => logger.debug("Test", "debug message")).not.toThrow();
        expect(() => logger.info("Test", "info message")).not.toThrow();
        expect(() => logger.warn("Test", "warn message")).not.toThrow();
        expect(() => logger.error("Test", "error message")).not.toThrow();
    });
});
