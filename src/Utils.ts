import * as Clock from "effect/Clock"
import * as Effect from "effect/Effect"
import type { TestResult } from "./Types.js"

export const measurePerformance = <R, E>(
  name: string,
  task: Effect.Effect<R, E>,
  iterations: number = 1
): Effect.Effect<TestResult, E> =>
  Effect.gen(function*() {
    const startTime = yield* Clock.currentTimeMillis
    const startMemory = process.memoryUsage()

    let errors = 0
    for (let i = 0; i < iterations; i++) {
      try {
        yield* task
      } catch (error) {
        errors++
      }
    }

    const endTime = yield* Clock.currentTimeMillis
    const endMemory = process.memoryUsage()

    const executionTime = endTime - startTime
    const operationsPerSecond = iterations / (executionTime / 1000)

    return {
      name,
      executionTime,
      operationsPerSecond,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed
      },
      errors
    } as TestResult
  })

export const formatTestResult = (result: TestResult): string => {
  return `
${result.name} Performance Results:
  Execution Time: ${result.executionTime}ms
  Operations/Second: ${result.operationsPerSecond.toFixed(2)}
  Memory Usage:
    RSS: ${result.memoryUsage.rss} bytes
    Heap Total: ${result.memoryUsage.heapTotal} bytes
    Heap Used: ${result.memoryUsage.heapUsed} bytes
  Errors: ${result.errors}
  `
}
