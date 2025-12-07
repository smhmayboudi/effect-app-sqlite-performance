import { Console, Context, Effect, Layer } from "effect"
import { BaseClient } from "./BaseClient.js"
import type { TestResult } from "./Types.js"
import { formatTestResult } from "./Utils.js"

export class TestRunner extends Context.Tag("TestRunner")<TestRunner, {
  runAllTests(iterations: number): Effect.Effect<Array<TestResult>, unknown>
  runComparisonTest(iterations: number): Effect.Effect<void, unknown>
}>() {}

export const TestRunnerLayer = (name: string) =>
  Layer.effect(
    TestRunner,
    Effect.gen(function*() {
      const client = yield* BaseClient

      const runAllTests = (iterations: number = 100): Effect.Effect<Array<TestResult>, unknown> => {
        return Effect.gen(function*() {
          const results: Array<TestResult> = []

          // for (const { client, name } of self.clients) {
          yield* Console.log(`\n--- Testing ${name} ---`)

          // Connect to the database
          // yield* client.connect()

          try {
            // Run basic performance test
            const basicResult = yield* client.runPerformanceTest(iterations)
            results.push(basicResult)
            yield* Console.log(formatTestResult(basicResult))

            // Run SELECT performance test
            const selectResult = yield* client.runSelectPerformanceTest(iterations)
            results.push(selectResult)
            yield* Console.log(formatTestResult(selectResult))

            // Run INSERT performance test
            const insertResult = yield* client.runInsertPerformanceTest(iterations)
            results.push(insertResult)
            yield* Console.log(formatTestResult(insertResult))

            // Run batch performance test with smaller count to avoid overwhelming
            const batchResult = yield* client.runBatchPerformanceTest(Math.min(iterations, 50))
            results.push(batchResult)
            yield* Console.log(formatTestResult(batchResult))
          } finally {
            // Close the connection
            // yield* client.close()
          }
          // }

          return results
        })
      }

      return TestRunner.of({
        runAllTests,

        runComparisonTest(iterations: number = 100): Effect.Effect<void, unknown> {
          return runAllTests(iterations).pipe(
            Effect.flatMap((allResults) =>
              Effect.gen(function*() {
                yield* Console.log("Starting comprehensive performance comparison...")

                // Print summary comparison
                yield* Console.log("\n" + "=".repeat(50))
                yield* Console.log("PERFORMANCE COMPARISON SUMMARY")
                yield* Console.log("=".repeat(50))

                const groupedResults = allResults.reduce((acc, result) => {
                  if (!acc[result.name]) {
                    acc[result.name] = []
                  }
                  acc[result.name].push(result)
                  return acc
                }, {} as Record<string, Array<TestResult>>)

                for (const [clientName, results] of Object.entries(groupedResults)) {
                  yield* Console.log(`\n${clientName}:`)
                  for (const result of results) {
                    yield* Console.log(
                      `  ${result.name.split(" ")[1]}: ${result.operationsPerSecond.toFixed(2)} ops/sec`
                    )
                  }
                }
              })
            )
          )
        }
      })
    })
  )
