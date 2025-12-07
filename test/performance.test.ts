import { describe, it } from "@effect/vitest"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { LibsqlClient } from "../src/LibsqlClient.js"
import { SqliteBunClient } from "../src/SqliteBunClient.js"
import { SqliteNodeClient } from "../src/SqliteNodeClient.js"
import { SqliteWasmClient } from "../src/SqliteWasmClient.js"
import { formatTestResult } from "../src/Utils.js"

describe("Performance Tests", () => {
  it("should run performance comparisons for all SQL packages", () => {
    const runTest = Effect.gen(function*() {
      yield* Console.log("Running individual performance tests...")

      // Test Sqlite Node
      const nodeClient = new SqliteNodeClient()
      yield* nodeClient.connect()
      const nodeResult = yield* nodeClient.runPerformanceTest(5)
      yield* Console.log(formatTestResult(nodeResult))
      yield* nodeClient.close()

      // Test Sqlite Bun
      const bunClient = new SqliteBunClient()
      yield* bunClient.connect()
      const bunResult = yield* bunClient.runPerformanceTest(5)
      yield* Console.log(formatTestResult(bunResult))
      yield* bunClient.close()

      // Test Sqlite WASM
      const wasmClient = new SqliteWasmClient()
      yield* wasmClient.connect()
      const wasmResult = yield* wasmClient.runPerformanceTest(5)
      yield* Console.log(formatTestResult(wasmResult))
      yield* wasmClient.close()

      // Test Libsql
      const libsqlClient = new LibsqlClient()
      yield* libsqlClient.connect()
      const libsqlResult = yield* libsqlClient.runPerformanceTest(5)
      yield* Console.log(formatTestResult(libsqlResult))
      yield* libsqlClient.close()

      // Summary
      yield* Console.log("\n" + "=".repeat(50))
      yield* Console.log("PERFORMANCE SUMMARY")
      yield* Console.log("=".repeat(50))
      yield* Console.log(`@effect/sql-sqlite-node: ${nodeResult.operationsPerSecond.toFixed(2)} ops/sec`)
      yield* Console.log(`@effect/sql-sqlite-bun: ${bunResult.operationsPerSecond.toFixed(2)} ops/sec`)
      yield* Console.log(`@effect/sql-sqlite-wasm: ${wasmResult.operationsPerSecond.toFixed(2)} ops/sec`)
      yield* Console.log(`@effect/sql-libsql: ${libsqlResult.operationsPerSecond.toFixed(2)} ops/sec`)
    })

    return Effect.runPromise(runTest)
  })
})
