import type { Effect } from "effect"

export interface TestResult {
  readonly name: string
  readonly executionTime: number // in milliseconds
  readonly operationsPerSecond: number
  readonly memoryUsage: {
    readonly rss: number
    readonly heapTotal: number
    readonly heapUsed: number
  }
  readonly errors: number
}

export interface PerformanceTest {
  readonly name: string
  readonly description: string
  readonly run: (iterations: number) => Effect.Effect<TestResult, unknown>
}
