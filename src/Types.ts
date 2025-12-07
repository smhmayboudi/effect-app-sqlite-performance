import { type Effect } from "effect"

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

export interface DatabaseClient {
  readonly name: string
  readonly connect: () => Effect.Effect<void, unknown>
  readonly executeQuery: (query: string, params?: Array<unknown>) => Effect.Effect<unknown, unknown>
  readonly executeMany: (queries: Array<{ sql: string; params?: Array<unknown> }>) => Effect.Effect<void, unknown>
  readonly close: () => Effect.Effect<void, unknown>
}
