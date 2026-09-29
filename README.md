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

| Método   | Ruta | Descripción |
| -------- | ---- | ----------- |
| `POST`   | `/api/products` | Crea un producto (`{ nombre, codigo_sku, categoria, precio, stock_actual?, stock_minimo?, proveedor }`) |
| `GET`    | `/api/products?page=1&limit=10` | Lista productos. Filtros opcionales: `categoria`, `proveedor`, `nombre`, `activo`, `stock_bajo` (`true`/`false`) |
| `GET`    | `/api/products/:id` | Obtiene un producto |
| `PATCH`  | `/api/products/:id` | Actualiza un producto (todo menos `stock_actual`) |
| `DELETE` | `/api/products/:id` | Desactiva un producto (`activo = false`) |
| `POST`   | `/api/products/:id/stock` | Ajusta el inventario (`{ tipo: "entrada" \| "salida", cantidad, motivo }`) |
| `GET`    | `/api/alerts?estado=ACTIVA` | Lista alertas de stock bajo, con filtro opcional por estado |
| `POST`   | `/api/purchase-orders` | Crea una orden de compra (`{ producto_id, proveedor, cantidad_solicitada, motivo? }`) → **202** |
| `GET`    | `/api/purchase-orders?page=1&limit=10&estado=PENDIENTE` | Lista órdenes de compra |
| `GET`    | `/api/purchase-orders/:id` | Obtiene una orden de compra |
| `PATCH`  | `/api/purchase-orders/update-status-purchase/:id` | Cambia el estado (`{ estado, motivo? }`) |

### Alertas de stock bajo

`products-ms` crea una alerta `STOCK_BAJO` `ACTIVA` cuando `stock_actual <= stock_minimo` y la pasa a `RESUELTA` cuando el stock vuelve a superar el mínimo. Se evalúa en cada cambio de stock: ajustes, órdenes recibidas, alta de productos y seed.

### Órdenes de compra (saga)

`POST /api/purchase-orders` responde **202 Accepted** con la orden en `EN_VALIDACION`. `orders-ms` valida el producto con `products-ms` por RabbitMQ y la orden pasa a `PENDIENTE` o a `RECHAZADA` (con `motivo`, por ejemplo `Product #9 not found or inactive` o `Product validation timed out`).

Después, `PATCH /api/purchase-orders/update-status-purchase/:id` acepta:

| `estado`    | Desde       | Notas |
| ----------- | ----------- | ----- |
| `APROBADA`  | `PENDIENTE` | |
| `RECHAZADA` | `PENDIENTE` | `motivo` obligatorio |
| `RECIBIDA`  | `APROBADA`  | `products-ms` suma `cantidad_solicitada` al stock y lo registra en el historial |

Cualquier otro `estado` responde 400 por validación. Una transición que no parte del estado indicado también responde 400.

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
