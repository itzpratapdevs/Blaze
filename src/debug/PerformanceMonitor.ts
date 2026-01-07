/**
 * Performance sample.
 */
interface PerfSample {
    duration: number;
    timestamp: number;
}

/**
 * Performance metric.
 */
interface PerfMetric {
    samples: PerfSample[];
    total: number;
    count: number;
    min: number;
    max: number;
    startTime?: number;
}

/**
 * Performance report entry.
 */
export interface PerformanceEntry {
    label: string;
    average: number;
    min: number;
    max: number;
    total: number;
    count: number;
}

/**
 * PerformanceMonitor for tracking execution times.
 *
 * @example
 * ```typescript
 * PerformanceMonitor.begin('update');
 * // ... game update logic
 * PerformanceMonitor.end('update');
 *
 * PerformanceMonitor.begin('render');
 * // ... render logic
 * PerformanceMonitor.end('render');
 *
 * // Get report
 * const report = PerformanceMonitor.getReport();
 * console.log(report);
 * ```
 */
export class PerformanceMonitor {
    private static _metrics: Map<string, PerfMetric> = new Map();
    private static _maxSamples: number = 60;
    private static _enabled: boolean = true;

    /**
     * Enable or disable the monitor.
     */
    static set enabled(value: boolean) {
        PerformanceMonitor._enabled = value;
    }

    static get enabled(): boolean {
        return PerformanceMonitor._enabled;
    }

    /**
     * Set the maximum number of samples to keep per metric.
     */
    static setMaxSamples(count: number): void {
        PerformanceMonitor._maxSamples = count;
    }

    /**
     * Begin timing a metric.
     */
    static begin(label: string): void {
        if (!PerformanceMonitor._enabled) return;

        let metric = PerformanceMonitor._metrics.get(label);
        if (!metric) {
            metric = {
                samples: [],
                total: 0,
                count: 0,
                min: Infinity,
                max: -Infinity,
            };
            PerformanceMonitor._metrics.set(label, metric);
        }

        metric.startTime = performance.now();
    }

    /**
     * End timing a metric.
     */
    static end(label: string): number {
        if (!PerformanceMonitor._enabled) return 0;

        const metric = PerformanceMonitor._metrics.get(label);
        if (!metric || metric.startTime === undefined) {
            console.warn(`PerformanceMonitor: No begin() for label '${label}'`);
            return 0;
        }

        const endTime = performance.now();
        const duration = endTime - metric.startTime;
        metric.startTime = undefined;

        // Add sample
        const sample: PerfSample = {
            duration,
            timestamp: endTime,
        };

        metric.samples.push(sample);

        // Keep only recent samples
        if (metric.samples.length > PerformanceMonitor._maxSamples) {
            const removed = metric.samples.shift()!;
            metric.total -= removed.duration;
            metric.count--;
        }

        // Update stats
        metric.total += duration;
        metric.count++;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);

        return duration;
    }

    /**
     * Measure a function's execution time.
     */
    static measure<T>(label: string, fn: () => T): T {
        PerformanceMonitor.begin(label);
        const result = fn();
        PerformanceMonitor.end(label);
        return result;
    }

    /**
     * Measure an async function's execution time.
     */
    static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        PerformanceMonitor.begin(label);
        const result = await fn();
        PerformanceMonitor.end(label);
        return result;
    }

    /**
     * Get the average time for a metric.
     */
    static getAverageTime(label: string): number {
        const metric = PerformanceMonitor._metrics.get(label);
        if (!metric || metric.count === 0) return 0;
        return metric.total / metric.count;
    }

    /**
     * Get the last sample time for a metric.
     */
    static getLastTime(label: string): number {
        const metric = PerformanceMonitor._metrics.get(label);
        if (!metric || metric.samples.length === 0) return 0;
        return metric.samples[metric.samples.length - 1].duration;
    }

    /**
     * Get the minimum time for a metric.
     */
    static getMinTime(label: string): number {
        const metric = PerformanceMonitor._metrics.get(label);
        return metric?.min ?? 0;
    }

    /**
     * Get the maximum time for a metric.
     */
    static getMaxTime(label: string): number {
        const metric = PerformanceMonitor._metrics.get(label);
        return metric?.max ?? 0;
    }

    /**
     * Get a complete performance report.
     */
    static getReport(): PerformanceEntry[] {
        const report: PerformanceEntry[] = [];

        for (const [label, metric] of PerformanceMonitor._metrics) {
            if (metric.count === 0) continue;

            report.push({
                label,
                average: metric.total / metric.count,
                min: metric.min === Infinity ? 0 : metric.min,
                max: metric.max === -Infinity ? 0 : metric.max,
                total: metric.total,
                count: metric.count,
            });
        }

        // Sort by average time (slowest first)
        report.sort((a, b) => b.average - a.average);

        return report;
    }

    /**
     * Get a formatted report string.
     */
    static getReportString(): string {
        const report = PerformanceMonitor.getReport();
        if (report.length === 0) return 'No performance data';

        const lines = ['Performance Report:', '-'.repeat(50)];

        for (const entry of report) {
            lines.push(
                `${entry.label}: avg=${entry.average.toFixed(2)}ms, ` +
                `min=${entry.min.toFixed(2)}ms, max=${entry.max.toFixed(2)}ms`
            );
        }

        return lines.join('\n');
    }

    /**
     * Reset a specific metric.
     */
    static resetMetric(label: string): void {
        PerformanceMonitor._metrics.delete(label);
    }

    /**
     * Reset all metrics.
     */
    static reset(): void {
        PerformanceMonitor._metrics.clear();
    }

    /**
     * Get all metric labels.
     */
    static getLabels(): string[] {
        return Array.from(PerformanceMonitor._metrics.keys());
    }
}
