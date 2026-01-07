/**
 * Log levels for filtering output.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
};

/**
 * Logger utility for debug output.
 * In production builds, debug and info logs can be stripped.
 */
export class Logger {
    private static _level: LogLevel = __DEV__ ? 'debug' : 'warn';
    private static _prefix: string = '[Blaze]';

    /**
     * Set the minimum log level to display.
     */
    static setLevel(level: LogLevel): void {
        this._level = level;
    }

    /**
     * Get the current log level.
     */
    static getLevel(): LogLevel {
        return this._level;
    }

    /**
     * Set the log prefix.
     */
    static setPrefix(prefix: string): void {
        this._prefix = prefix;
    }

    /**
     * Log a debug message.
     * Only shown when level is 'debug'.
     */
    static debug(message: string, ...args: unknown[]): void {
        if (LOG_LEVELS[this._level] <= LOG_LEVELS.debug) {
            console.log(`${this._prefix} [DEBUG]`, message, ...args);
        }
    }

    /**
     * Log an info message.
     */
    static info(message: string, ...args: unknown[]): void {
        if (LOG_LEVELS[this._level] <= LOG_LEVELS.info) {
            console.log(`${this._prefix} [INFO]`, message, ...args);
        }
    }

    /**
     * Log a warning message.
     */
    static warn(message: string, ...args: unknown[]): void {
        if (LOG_LEVELS[this._level] <= LOG_LEVELS.warn) {
            console.warn(`${this._prefix} [WARN]`, message, ...args);
        }
    }

    /**
     * Log an error message.
     */
    static error(message: string, ...args: unknown[]): void {
        if (LOG_LEVELS[this._level] <= LOG_LEVELS.error) {
            console.error(`${this._prefix} [ERROR]`, message, ...args);
        }
    }

    /**
     * Log with a custom tag.
     */
    static tag(tag: string, message: string, ...args: unknown[]): void {
        if (LOG_LEVELS[this._level] <= LOG_LEVELS.info) {
            console.log(`${this._prefix} [${tag}]`, message, ...args);
        }
    }

    /**
     * Assert a condition and log error if false.
     */
    static assert(condition: boolean, message: string): void {
        if (!condition) {
            this.error(`Assertion failed: ${message}`);
            if (__DEV__) {
                throw new Error(`Assertion failed: ${message}`);
            }
        }
    }

    /**
     * Time a function and log the duration.
     */
    static time<T>(label: string, fn: () => T): T {
        if (LOG_LEVELS[this._level] > LOG_LEVELS.debug) {
            return fn();
        }
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        this.debug(`${label}: ${duration.toFixed(2)}ms`);
        return result;
    }

    /**
     * Time an async function and log the duration.
     */
    static async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        if (LOG_LEVELS[this._level] > LOG_LEVELS.debug) {
            return fn();
        }
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        this.debug(`${label}: ${duration.toFixed(2)}ms`);
        return result;
    }
}

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;
