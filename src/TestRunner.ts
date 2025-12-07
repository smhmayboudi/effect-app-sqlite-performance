import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { LibsqlClient } from "./LibsqlClient.js"
import { SqliteBunClient } from "./SqliteBunClient.js"
import { SqliteNodeClient } from "./SqliteNodeClient.js"
import { SqliteWasmClient } from "./SqliteWasmClient.js"
import type { TestResult } from "./Types.js"
import { formatTestResult } from "./Utils.js"

export class PerformanceTestRunner {
  private clients: Array<{
    client: InstanceType<
      typeof SqliteNodeClient | typeof SqliteBunClient | typeof SqliteWasmClient | typeof LibsqlClient
    >
    name: string
  }>

  constructor() {
    this.clients = [
      { client: new SqliteNodeClient(), name: "@effect/sql-sqlite-node" },
      { client: new SqliteBunClient(), name: "@effect/sql-sqlite-bun" },
      { client: new SqliteWasmClient(), name: "@effect/sql-sqlite-wasm" },
      { client: new LibsqlClient(), name: "@effect/sql-libsql" }
    ]
  }

  runAllTests(iterations: number = 100): Effect.Effect<Array<TestResult>, unknown> {
    const self = this
    return Effect.gen(function*() {
      const results: Array<TestResult> = []

      for (const { client, name } of self.clients) {
        yield* Console.log(`\n--- Testing ${name} ---`)

        // Connect to the database
        yield* client.connect()

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
          yield* client.close()
        }
      }

      return results
    })
  }

  runComparisonTest(iterations: number = 100): Effect.Effect<void, unknown> {
    return (new PerformanceTestRunner()).runAllTests(iterations).pipe(
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
              yield* Console.log(`  ${result.name.split(" ")[1]}: ${result.operationsPerSecond.toFixed(2)} ops/sec`)
            }
          }
        })
      )
    )
  }
}
