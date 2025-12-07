import { SqlClient } from "@effect/sql"
import { Console, Context, Effect, Layer } from "effect"
import type { TestResult } from "./Types.js"
import { measurePerformance } from "./Utils.js"

export class BaseClient extends Context.Tag("BaseClient")<BaseClient, {
  runPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown>
  runSelectPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown>
  runInsertPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown>
  runBatchPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown>
}>() {}

export const BaseClientLayer = (name: string) =>
  Layer.effect(
    BaseClient,
    Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const _executePerformanceScenario = (): Effect.Effect<void, unknown> => {
        return Effect.gen(function*() {
          // Create a test table
          yield* sql`
        CREATE TABLE IF NOT EXISTS test_performance (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          value INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

          // Insert some data
          for (let i = 0; i < 10; i++) {
            yield* sql`INSERT INTO test_performance (name, value) VALUES ('test_name', 0)`
          }

          // Query the data
          const result = yield* sql`SELECT * FROM test_performance`
          yield* Console.log(`${name}: Retrieved ${Array.isArray(result) ? result.length : 0} records`)

          // Update some records
          yield* sql`UPDATE test_performance SET value = 999 WHERE id = 1`

          // Delete a record
          yield* sql`DELETE FROM test_performance WHERE id = 2`
        })
      }

      const _executeSelectScenario = (): Effect.Effect<void, unknown> => {
        return Effect.gen(function*() {
          yield* sql`SELECT * FROM test_performance WHERE value > 50`
        })
      }

      const _executeInsertScenario = (): Effect.Effect<void, unknown> => {
        return Effect.gen(function*() {
          yield* sql`INSERT INTO test_performance (name, value) VALUES ('perf_test', 1)`
        })
      }

      const _executeBatchScenario = (count: number): Effect.Effect<void, unknown> => {
        return Effect.gen(function*() {
          return yield* sql`INSERT INTO test_performance (name, value) VALUES ${
            sql.unsafe(Array(count).fill("('batch_test', 2)").join(","))
          }`
        })
      }

      return BaseClient.of({
        runPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
          return measurePerformance(
            `${name} Performance Test`,
            _executePerformanceScenario(),
            iterations
          )
        },
        runSelectPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
          return measurePerformance(
            `${name} SELECT Performance Test`,
            _executeSelectScenario(),
            iterations
          )
        },
        runInsertPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
          return measurePerformance(
            `${name} INSERT Performance Test`,
            _executeInsertScenario(),
            iterations
          )
        },
        runBatchPerformanceTest(iterations: number): Effect.Effect<TestResult, unknown> {
          return measurePerformance(
            `${name} Batch Performance Test`,
            _executeBatchScenario(iterations),
            1 // Only run the batch operation once
          )
        }
      })
    })
  )
