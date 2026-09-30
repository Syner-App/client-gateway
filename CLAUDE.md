# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

NestJS 12 HTTP API gateway. It exposes REST endpoints under the `/api` prefix and forwards each call over gRPC to backend microservices. Backends: `products-ms` (`../products-ms`, `/api/products`, `/api/alerts`), `orders-ms` (`../orders-ms`, `/api/purchase-orders`) and `auth-ms` (`../auth-ms`, `/api/auth`).

## Commands

Uses pnpm.

- `pnpm start:dev`: runs in watch mode. Needs a `.env` (copy `.env.template`), a running `products-ms` at `PRODUCTS_MICROSERVICE_HOST:PRODUCTS_MICROSERVICE_PORT`, `orders-ms` at `ORDERS_MICROSERVICE_HOST:ORDERS_MICROSERVICE_PORT` and `auth-ms` at `AUTH_MICROSERVICE_HOST:AUTH_MICROSERVICE_PORT`.
- `pnpm build`: `nest build`. Copies `**/*.proto` into `dist/`, because the gRPC client loads the `.proto` at runtime.
- `pnpm lint`: runs oxlint with type-aware rules. `no-floating-promises` is an error.
- `pnpm format`: runs Prettier.
- `pnpm test`: runs the Vitest unit tests (`**/*.spec.ts`, with globals enabled).
- Single test: `pnpm vitest run src/products/products.controller.spec.ts`, or add `-t "<name>"`.
- `pnpm test:e2e`: runs `**/*.e2e-spec.ts`. The one e2e spec in `test/` is still the Nest starter's `GET /` "Hello World" test and doesn't match the app.
- `pnpm proto:gen`: regenerates `src/generated/proto/{products,orders,auth}.ts` from `src/proto/*.proto` using ts-proto (`nestJs=true`, `stringEnums=true`, `.js` import suffix).

Docker: `docker compose up -d --build` from the `syner/` root runs the whole stack in dev mode. It uses the service `Dockerfile`, bind-mounts `src/`, and runs `start:dev`; `node_modules` stays in the image. The compose `environment:` overrides `.env`, which keeps `localhost` for running outside Docker.

## Architecture

- **ESM + NodeNext.** `"type": "module"`. Relative imports carry an extension, either `.ts` or `.js`, and both appear in the code. `rewriteRelativeImportExtensions` rewrites them at build time. `main.ts` uses top-level `await`. Use `import.meta.dirname` instead of `__dirname`.
- **Config.** `src/config/envs.ts` loads `.env` via `dotenv/config` and validates it with Joi when the module is imported, so a missing variable throws at startup. Add new variables in three places: the `EnvVars` interface, the Joi schema, and the exported `envs` object. Also add them to `.env.template`. DI injection tokens for microservice clients are in `src/config/services.ts`, for example `PRODUCTS_SERVICE`.
- **gRPC client pattern** (see `src/products/`):
  - The module registers `ClientsModule` with `Transport.GRPC`, the proto package name, and `protoPath` pointing at `src/proto/*.proto`.
  - The controller injects `ClientGrpc` and calls `getService<XServiceClient>(X_SERVICE_NAME)` in `onModuleInit`.
  - Handlers return the client's `Observable` directly, and Nest subscribes to it.
  - Types and service or package name constants come from the generated ts-proto file.
  - Route params are parsed with `ParseIntPipe` / `ParseUUIDPipe`. There's no global `ValidationPipe`; every controller applies one via `@UsePipes`, because protobufjs silently drops unknown enum strings (e.g. `estado=FOO`) before the microservice could reject them, and query strings need converting (`@Type(() => Number)`, `@ToBoolean()` from `src/common/transforms/`).
  - Fields are snake_case and proto enums are strings: both clients in `src/transport/grpc.module.ts` and the servers set `loader: { keepCase: true, enums: String }`, and `proto:gen` uses `snakeToCamel=false`. Build enum lists with `enumValues()` (`src/common/enum-values.ts`), which drops ts-proto's `UNRECOGNIZED` member.
- **Proto contract.** `src/proto/products.proto`, `src/proto/orders.proto` and `src/proto/auth.proto` are hand-maintained copies of `../products-ms/src/proto/products.proto`, `../orders-ms/src/proto/orders.proto` and `../auth-ms/src/proto/auth.proto`. Each pair must stay identical. After editing a proto, run `pnpm proto:gen`. Never edit `src/generated/` by hand.
- **Error mapping.** `GrpcExceptionFilter` (`src/common/exceptions/`) is registered globally in `main.ts`:
  - It detects gRPC errors by shape (`{ code: number, details: string }`).
  - It maps gRPC status codes to HTTP status codes, for example `NOT_FOUND` → 404 and `INVALID_ARGUMENT` → 400.
  - It responds with `{ statusCode, message: details }`.
  - Every other exception goes to Nest's `BaseExceptionFilter`.
  - To make a new backend error surface with the right HTTP status, add its mapping to `GRPC_TO_HTTP_STATUS`.
- **Purchase orders are asynchronous (saga).** `POST /api/purchase-orders` returns **202** with the order in `EN_VALIDACION`: orders-ms validates the product with products-ms over RabbitMQ, and the order then moves to `PENDIENTE` or `RECHAZADA` (with `motivo`). `PATCH /api/purchase-orders/update-status-purchase/:id` takes `{ estado, motivo? }`: `UpdateStatusPurchaseDto` only allows `APROBADA`, `RECHAZADA` (motivo required via `@ValidateIf`) and `RECIBIDA`; orders-ms answers `FAILED_PRECONDITION` (→ 400) when the order is not in the required source state.
- **Auth (`src/auth/`).** `POST /api/auth/login` (`{ email, password }`, the only public route) returns `{ user, token }` from auth-ms; `user` carries `role` (`owner | admin | user`, proto enum `Role`). `@Auth(...roles)` (`src/auth/decorators/auth.decorator.ts`) = `@Roles(...roles)` metadata + `UseGuards(AuthGuard, RolesGuard)`. `AuthGuard` reads `Authorization: Bearer <token>`, calls auth-ms `Verify` (which reloads the user, so the role is always current) and sets `request.user` / `request.token` (renewed JWT), read with `@User()` / `@Token()`. `RolesGuard` checks `request.user.role` against the handler roles (overriding the controller ones); no roles = any authenticated user → otherwise 403. Pattern: `@Auth()` once on the controller and metadata-only `@Roles(...MANAGER_ROLES)` on write handlers (repeating `@Auth` on a handler would run `AuthGuard`, a gRPC call, twice). `AuthModule` exports both guards; modules using `@Auth` import it.
- **Roles.** `user`: read products, alerts, purchase orders + `POST /api/products/:id/stock`. `owner`/`admin` (`MANAGER_ROLES` in `src/auth/roles.ts`): also create/edit/delete products, create purchase orders, `PATCH update-status`, and `POST /api/auth/register` (`{ name, email, password, role? }`; the gateway sends the caller's role as `requester_role` and auth-ms decides: admin may only create `user`). `PATCH /api/auth/users/:id/role` (`{ role }`) is owner only; the gateway sends the caller id as `requester_id` and auth-ms rejects changing your own role. auth-ms errors: `UNAUTHENTICATED` → 401, `PERMISSION_DENIED` → 403, `NOT_FOUND` → 404, `ALREADY_EXISTS` (email taken) → 409.
- **Tests.** Unit tests mock the gRPC client by providing the injection token with `{ getService: () => ({...}) }`.
