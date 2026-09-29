# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

NestJS 12 HTTP API gateway. It exposes REST endpoints under the `/api` prefix and forwards each call over gRPC to backend microservices. Backends: `products-ms` (`../products-ms`, `/api/products`) and `order-ms` (`../order-ms`, `/api/orders`, PostgreSQL).

## Commands

Uses pnpm.

- `pnpm start:dev`: runs in watch mode. Needs a `.env` (copy `.env.template`), a running `products-ms` at `PRODUCTS_MICROSERVICE_HOST:PRODUCTS_MICROSERVICE_PORT` and `order-ms` at `ORDERS_MICROSERVICE_HOST:ORDERS_MICROSERVICE_PORT`.
- `pnpm build`: `nest build`. Copies `**/*.proto` into `dist/`, because the gRPC client loads the `.proto` at runtime.
- `pnpm lint`: runs oxlint with type-aware rules. `no-floating-promises` is an error.
- `pnpm format`: runs Prettier.
- `pnpm test`: runs the Vitest unit tests (`**/*.spec.ts`, with globals enabled).
- Single test: `pnpm vitest run src/products/products.controller.spec.ts`, or add `-t "<name>"`.
- `pnpm test:e2e`: runs `**/*.e2e-spec.ts`. The one e2e spec in `test/` is still the Nest starter's `GET /` "Hello World" test and doesn't match the app.
- `pnpm proto:gen`: regenerates `src/generated/proto/{products,orders}.ts` from `src/proto/*.proto` using ts-proto (`nestJs=true`, `stringEnums=true`, `.js` import suffix).

## Architecture

- **ESM + NodeNext.** `"type": "module"`. Relative imports carry an extension, either `.ts` or `.js`, and both appear in the code. `rewriteRelativeImportExtensions` rewrites them at build time. `main.ts` uses top-level `await`. Use `import.meta.dirname` instead of `__dirname`.
- **Config.** `src/config/envs.ts` loads `.env` via `dotenv/config` and validates it with Joi when the module is imported, so a missing variable throws at startup. Add new variables in three places: the `EnvVars` interface, the Joi schema, and the exported `envs` object. Also add them to `.env.template`. DI injection tokens for microservice clients are in `src/config/services.ts`, for example `PRODUCTS_SERVICE`.
- **gRPC client pattern** (see `src/products/`):
  - The module registers `ClientsModule` with `Transport.GRPC`, the proto package name, and `protoPath` pointing at `src/proto/*.proto`.
  - The controller injects `ClientGrpc` and calls `getService<XServiceClient>(X_SERVICE_NAME)` in `onModuleInit`.
  - Handlers return the client's `Observable` directly, and Nest subscribes to it.
  - Types and service or package name constants come from the generated ts-proto file.
  - Route params are parsed with `ParseIntPipe` / `ParseUUIDPipe`. There's no global `ValidationPipe`; `OrdersController` applies one via `@UsePipes`, because protobufjs silently drops unknown enum strings (e.g. `status=FOO`) before the microservice could reject them.
  - Proto enums are exchanged as strings: both client and server set `loader: { enums: String }`. Exclude ts-proto's `UNRECOGNIZED` member when validating (see `src/orders/enum/order.enum.ts`).
- **Proto contract.** `src/proto/products.proto` and `src/proto/orders.proto` are hand-maintained copies of `../products-ms/src/proto/products.proto` and `../order-ms/src/proto/orders.proto`. Each pair must stay identical. After editing a proto, run `pnpm proto:gen`. Never edit `src/generated/` by hand.
- **Error mapping.** `GrpcExceptionFilter` (`src/common/exceptions/`) is registered globally in `main.ts`:
  - It detects gRPC errors by shape (`{ code: number, details: string }`).
  - It maps gRPC status codes to HTTP status codes, for example `NOT_FOUND` → 404 and `INVALID_ARGUMENT` → 400.
  - It responds with `{ statusCode, message: details }`.
  - Every other exception goes to Nest's `BaseExceptionFilter`.
  - To make a new backend error surface with the right HTTP status, add its mapping to `GRPC_TO_HTTP_STATUS`.
- **Tests.** Unit tests mock the gRPC client by providing the injection token with `{ getService: () => ({...}) }`.
