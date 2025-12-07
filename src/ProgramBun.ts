import { LibsqlClient } from "@effect/sql-libsql"
import { SqliteClient as SqliteBunClient } from "@effect/sql-sqlite-bun"
// import { SqliteClient as SqliteWasmClient } from "@effect/sql-sqlite-wasm"
import { Console, Effect, Layer } from "effect"
import { BaseClientLayer } from "./BaseClient.js"
import { TestRunner, TestRunnerLayer } from "./TestRunner.js"

const program = Effect.gen(function*() {
  yield* Console.log(
    "Starting performance comparison tests for Effect-TS SQL packages..."
  )

  const runner = yield* TestRunner
  yield* runner.runComparisonTest(100) // Using 100 iterations for initial test

  yield* Console.log("\nPerformance tests completed!")
}).pipe(
  Effect.catchAllDefect((error) => Console.error("Test execution failed:", error))
)

const main = Effect.all([
  Effect.provide(
    program,
    Layer.provide(
      TestRunnerLayer("@effect/sql-libsql"),
      Layer.provide(
        BaseClientLayer("@effect/sql-libsql"),
        LibsqlClient.layer({ url: ":memory:" })
      )
    )
  ),
  Effect.provide(
    program,
    Layer.provide(
      TestRunnerLayer("@effect/sql-sqlite-bun"),
      Layer.provide(
        BaseClientLayer("@effect/sql-sqlite-bun"),
        SqliteBunClient.layer({ filename: ":memory:" })
      )
    )
  )
  // Effect.provide(
  //   program,
  //   Layer.provide(
  //     TestRunnerLayer("@effect/sql-sqlite-wasm"),
  //     Layer.provide(
  //       BaseClientLayer("@effect/sql-sqlite-wasm"),
  //       SqliteWasmClient.layerMemory({})
  //     )
  //   )
  // )
], { concurrency: 1 })

// Run the effect
Effect.runPromise(main).then(
  () => console.log("All tests completed successfully"),
  (error) => console.error("Tests failed with error:", error)
)
