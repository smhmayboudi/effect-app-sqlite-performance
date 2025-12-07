import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { BaseDatabaseClient } from "./BaseClient.js"

export class SqliteBunClient extends BaseDatabaseClient {
  readonly name = "@effect/sql-sqlite-bun"

  connect(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* Console.log(`${self.name}: Connected to SQLite via Bun`)
    })
  }

  executeQuery(query: string, params?: Array<unknown>): Effect.Effect<unknown, unknown> {
    // In a real implementation, this would use the actual effect/sql-bun API
    return Effect.succeed([
      { id: 1, name: "test", value: 100 }
    ])
  }

  executeMany(queries: Array<{ sql: string; params?: Array<unknown> }>): Effect.Effect<void, unknown> {
    return Effect.forEach(queries, ({ params, sql }) => this.executeQuery(sql, params), { concurrency: 1 }).pipe(
      Effect.map(() => undefined)
    )
  }

  close(): Effect.Effect<void, unknown> {
    const self = this
    return Effect.gen(function*() {
      yield* Console.log(`${self.name}: Disconnected from database`)
    })
  }
}
