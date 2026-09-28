<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Client Gateway

API Gateway HTTP construido con NestJS. Expone endpoints REST bajo el prefijo `/api` y reenvía cada petición por gRPC a los microservicios. Por ahora el único backend es [`products-ms`](../products-ms).

## Requisitos

- Node.js y pnpm
- `products-ms` en ejecución y accesible en `PRODUCTS_MICROSERVICE_HOST:PRODUCTS_MICROSERVICE_PORT`

## Configuración

```bash
pnpm install
cp .env.template .env
```

| Variable                     | Descripción                        | Ejemplo     |
| ---------------------------- | ---------------------------------- | ----------- |
| `PORT`                       | Puerto HTTP del gateway            | `3000`      |
| `PRODUCTS_MICROSERVICE_HOST` | Host del servidor gRPC de products | `localhost` |
| `PRODUCTS_MICROSERVICE_PORT` | Puerto del servidor gRPC           | `3001`      |

Las variables se validan con Joi al arrancar. Si falta alguna, la aplicación no inicia.

## Ejecutar

```bash
# desarrollo (watch)
pnpm start:dev

# producción
pnpm build
pnpm start:prod
```

## Endpoints

| Método   | Ruta                              | Descripción                                   |
| -------- | --------------------------------- | --------------------------------------------- |
| `POST`   | `/api/products`                   | Crea un producto (`{ name, price }`)          |
| `GET`    | `/api/products?page=1&limit=10`   | Lista productos paginados                     |
| `GET`    | `/api/products/:id`               | Obtiene un producto                           |
| `PATCH`  | `/api/products/:id`               | Actualiza un producto (`{ name?, price? }`)   |
| `DELETE` | `/api/products/:id`               | Elimina un producto                           |

Los errores gRPC del microservicio se traducen a códigos HTTP (por ejemplo, `NOT_FOUND` → 404 e `INVALID_ARGUMENT` → 400) con el cuerpo `{ statusCode, message }`.

## Contrato gRPC

`src/proto/products.proto` es una copia de `../products-ms/src/proto/products.proto` y los dos archivos deben mantenerse idénticos. Después de modificar el `.proto`, regenera los tipos:

```bash
pnpm proto:gen
```

Esto genera `src/generated/proto/products.ts`. No lo edites a mano.

## Tests y calidad

```bash
pnpm test          # tests unitarios (Vitest)
pnpm test:cov      # cobertura
pnpm test:e2e      # tests e2e
pnpm lint          # oxlint
pnpm format        # prettier
```
