import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import type { DatabaseClient, TestResult } from "./Types.js"
import { measurePerformance } from "./Utils.js"

export abstract class BaseDatabaseClient implements DatabaseClient {
  abstract readonly name: string

  abstract connect(): Effect.Effect<void, unknown>
  abstract executeQuery(query: string, params?: Array<unknown>): Effect.Effect<unknown, unknown>
  abstract executeMany(queries: Array<{ sql: string; params?: Array<unknown> }>): Effect.Effect<void, unknown>
  abstract close(): Effect.Effect<void, unknown>

  runPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
    const self = this
    return measurePerformance(
      `${self.name} Performance Test`,
      self._executePerformanceScenario(),
      iterations
    )
  }

  private _executePerformanceScenario(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      // Create a test table
      yield* self.executeQuery(`
        CREATE TABLE IF NOT EXISTS test_performance (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          value INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Insert some data
      for (let i = 0; i < 10; i++) {
        yield* self.executeQuery(
          "INSERT INTO test_performance (name, value) VALUES (?, ?)",
          [`test_name_${i}`, i * 10]
        )
      }

      // Query the data
      const result = yield* self.executeQuery("SELECT * FROM test_performance")
      yield* Console.log(`${self.name}: Retrieved ${Array.isArray(result) ? result.length : 0} records`)

      // Update some records
      yield* self.executeQuery("UPDATE test_performance SET value = ? WHERE id = ?", [999, 1])

      // Delete a record
      yield* self.executeQuery("DELETE FROM test_performance WHERE id = ?", [2])
    })
  }

  runSelectPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
    const self = this
    return measurePerformance(
      `${self.name} SELECT Performance Test`,
      self._executeSelectScenario(),
      iterations
    )
  }

  private _executeSelectScenario(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* self.executeQuery("SELECT * FROM test_performance WHERE value > ?", [50])
    })
  }

  runInsertPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
    const self = this
    return measurePerformance(
      `${self.name} INSERT Performance Test`,
      self._executeInsertScenario(),
      iterations
    )
  }

  private _executeInsertScenario(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* self.executeQuery(
        "INSERT INTO test_performance (name, value) VALUES (?, ?)",
        [`perf_test_${Date.now()}`, Math.floor(Math.random() * 100)]
      )
    })
  }

  runBatchPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
    const self = this
    return measurePerformance(
      `${self.name} Batch Performance Test`,
      self._executeBatchScenario(iterations),
      1 // Only run the batch operation once
    )
  }

  private _executeBatchScenario(count: number): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      const queries = Array.from({ length: count }, (_, i) => ({
        sql: "INSERT INTO test_performance (name, value) VALUES (?, ?)",
        params: [`batch_test_${i}`, i]
      }))
      yield* self.executeMany(queries)
    })
  }
}
