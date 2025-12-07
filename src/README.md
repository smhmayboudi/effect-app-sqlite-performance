# Effect-TS SQL Performance Tests

This project contains performance tests for various Effect-TS SQL packages to compare their performance characteristics.

## Packages Tested

- `@effect/sql-sqlite-node` - SQLite implementation using better-sqlite3 for Node.js
- `@effect/sql-sqlite-bun` - SQLite implementation using bun:sqlite for Bun runtime
- `@effect/sql-sqlite-wasm` - SQLite implementation using WASM for browser/Node.js compatibility
- `@effect/sql-libsql` - LibSQL implementation (Turso) for distributed SQLite

## Test Scenarios

The performance tests include several scenarios to measure different aspects of database performance:

1. **Basic Performance Test** - Comprehensive test including create, insert, select, update, and delete operations
2. **SELECT Performance Test** - Measures read performance for complex queries
3. **INSERT Performance Test** - Measures write performance for insert operations
4. **Batch Performance Test** - Measures performance for batch operations

## Running the Tests

### Prerequisites

- Node.js 18+ (or Bun if testing the Bun adapter)
- pnpm package manager

### Installation

```bash
pnpm install
```

### Running the Main Performance Comparison

```bash
pnpm run start
pnpm run start:bun
```

This will execute the main performance comparison test that runs all scenarios against all database adapters.

### Running Tests via Vitest

```bash
pnpm run test
```

This will run the performance tests through the Vitest framework.

## Understanding the Results

Each test result includes the following metrics:

- **Execution Time**: Total time taken in milliseconds
- **Operations/Second**: Calculated throughput metric
- **Memory Usage**: Difference in memory usage before and after the test
  - RSS: Resident Set Size difference
  - Heap Total: Total heap memory difference
  - Heap Used: Used heap memory difference
- **Errors**: Number of failed operations during the test

## Architecture

The performance testing framework is structured as follows:

```
src/
├── Types.ts            # Type definitions for tests and results
├── Utils.ts            # Performance measurement utilities
├── BaseClient.ts       # Abstract base class for database clients
├── SqliteNodeClient.ts # Node.js SQLite implementation
├── SqliteBunClient.ts  # Bun SQLite implementation
├── SqliteWasmClient.ts # WASM SQLite implementation
├── LibsqlClient.ts     # LibSQL implementation
└── TestRunner.ts       # Main test runner class
```

## Customizing Tests

To modify the number of iterations or specific test scenarios, you can adjust the parameters in:

- `src/Program.ts` - Main entry point (adjust iterations in the `runComparisonTest` call)
- `test/performance.test.ts` - Individual test file with separate execution paths

## Adding New Database Adapters

To add a new database adapter:

1. Create a new client class that extends `BaseDatabaseClient`
2. Implement the required methods (`connect`, `executeQuery`, `executeMany`, `close`)
3. Add the client instance to the `PerformanceTestRunner` constructor
4. Update the package dependencies as needed

## License

MIT
