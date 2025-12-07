import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { BaseDatabaseClient } from "./BaseClient.js"

// A simplified implementation using the most common patterns in Effect-SQL
export class SqliteNodeClient extends BaseDatabaseClient {
  readonly name = "@effect/sql-sqlite-node"

  connect(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* Console.log(`${self.name}: Connected to SQLite in-memory database`)
    })
  }

  executeQuery(query: string, params?: Array<unknown>): Effect.Effect<unknown, unknown> {
    // In a real implementation, this would use the actual effect/sql API
    // For now, we simulate with a simple effect that returns mock data
    return Effect.succeed([
      { id: 1, name: "test", value: 100 }
    ])
  }

  executeMany(queries: Array<{ sql: string; params?: Array<unknown> }>): Effect.Effect<void, unknown> {
    return Effect.forEach(queries, ({ params, sql }) => this.executeQuery(sql, params), { concurrency: 1 }).pipe(
      Effect.map(() => undefined)
    ) // Map the result to undefined to return void
  }

  close(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* Console.log(`${self.name}: Disconnected from database`)
    })
  }
}
