# Effect Package Template

This template provides a solid foundation for building scalable and maintainable TypeScript package with Effect.

## Running Code

This template leverages [tsx](https://tsx.is) to allow execution of TypeScript files via NodeJS as if they were written in plain JavaScript.

To execute a file with `tsx`:

```sh
pnpm tsx ./path/to/the/file.ts
```

## Operations

**Building**

To build the package:

```sh
pnpm build
```

**Testing**

To test the package:

```sh
pnpm test
```

## Performance Tests

This project includes comprehensive performance tests for Effect-TS SQL packages. See the [src/README.md](./src/README.md) for details.

To run the performance comparison tests:

```sh
pnpm run start
pnpm run start:bun
```

The performance tests compare:

- `@effect/sql-sqlite-node` - SQLite implementation using better-sqlite3 for Node.js
- `@effect/sql-sqlite-bun` - SQLite implementation using bun:sqlite for Bun runtime
- `@effect/sql-sqlite-wasm` - SQLite implementation using WASM for browser/Node.js compatibility
- `@effect/sql-libsql` - LibSQL implementation (Turso) for distributed SQLite
