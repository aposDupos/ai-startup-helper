/**
 * Centralized logger for the application.
 * In development: logs everything. In production: only warns/errors.
 */

const isDev = process.env.NODE_ENV !== "production";

function formatContext(context: string): string {
    return `[${context}]`;
}

export const logger = {
    debug(context: string, message: string, ...args: unknown[]) {
        if (isDev) {
            console.debug(formatContext(context), message, ...args);
        }
    },

    info(context: string, message: string, ...args: unknown[]) {
        if (isDev) {
            console.info(formatContext(context), message, ...args);
        }
    },

    warn(context: string, message: string, ...args: unknown[]) {
        console.warn(formatContext(context), message, ...args);
    },

    error(context: string, message: string, ...args: unknown[]) {
        console.error(formatContext(context), message, ...args);
    },
};
