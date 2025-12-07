import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { PerformanceTestRunner } from "./TestRunner.js"

const main = Effect.gen(function*() {
  yield* Console.log(
    "Starting performance comparison tests for Effect-TS SQL packages..."
  )

  const runner = new PerformanceTestRunner()
  yield* runner.runComparisonTest(50) // Using 50 iterations for initial test

  yield* Console.log("\nPerformance tests completed!")
}).pipe(
  Effect.catchAllDefect((error) => Console.error("Test execution failed:", error))
)

// Run the effect
Effect.runPromise(main).then(
  () => console.log("All tests completed successfully"),
  (error) => console.error("Tests failed with error:", error)
)
