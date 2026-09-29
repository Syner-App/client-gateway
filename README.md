<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Client Gateway

API Gateway HTTP construido con NestJS. Expone endpoints REST bajo el prefijo `/api` y reenvía cada petición por gRPC a los microservicios [`products-ms`](../products-ms) y [`orders-ms`](../orders-ms).

## Requisitos

- Node.js y pnpm
- `products-ms` en ejecución y accesible en `PRODUCTS_MICROSERVICE_HOST:PRODUCTS_MICROSERVICE_PORT`
- `orders-ms` en ejecución y accesible en `ORDERS_MICROSERVICE_HOST:ORDERS_MICROSERVICE_PORT` (ver el orden de arranque en el [README raíz](../README.md))

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
| `ORDERS_MICROSERVICE_HOST`   | Host del servidor gRPC de orders   | `localhost` |
| `ORDERS_MICROSERVICE_PORT`   | Puerto del servidor gRPC de orders | `3002`      |

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
| `POST`   | `/api/orders`                     | Crea una orden (`{ items: [{ productId, quantity }] }`) → **202** |
| `GET`    | `/api/orders?page=1&limit=10&status=PENDING` | Lista órdenes paginadas            |
| `GET`    | `/api/orders/:id`                 | Obtiene una orden con sus items               |
| `PATCH`  | `/api/orders/:id`                 | Cambia el estado (`{ status }`)               |

### Órdenes asíncronas (saga)

`POST /api/orders` responde **202 Accepted** con la orden en `AWAITING_VALIDATION`, sin precios ni total. `orders-ms` valida los productos con `products-ms` por RabbitMQ y la orden pasa a:

- `PENDING`: los items traen `price` y `name`, y la orden trae `totalAmount`.
- `REJECTED`: con `rejectionReason`, por ejemplo `Products not found or unavailable: #9` o `Product validation timed out`.

El cliente consulta `GET /api/orders/:id` hasta ver uno de esos estados. `AWAITING_VALIDATION` y `REJECTED` los maneja solo la saga: un `PATCH` que mueva la orden hacia o desde esos estados responde 400.

Los errores gRPC del microservicio se traducen a códigos HTTP (por ejemplo, `NOT_FOUND` → 404 e `INVALID_ARGUMENT` → 400) con el cuerpo `{ statusCode, message }`.

## Contrato gRPC

`src/proto/products.proto` y `src/proto/orders.proto` son copias de `../products-ms/src/proto/products.proto` y `../orders-ms/src/proto/orders.proto`; cada par debe mantenerse idéntico. Después de modificar un `.proto`, regenera los tipos:

```bash
pnpm proto:gen
```

Esto genera `src/generated/proto/{products,orders}.ts`. No los edites a mano.

## Tests y calidad

```bash
pnpm test          # tests unitarios (Vitest)
pnpm test:cov      # cobertura
pnpm test:e2e      # tests e2e
pnpm lint          # oxlint
pnpm format        # prettier
```
