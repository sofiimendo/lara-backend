# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye MongoDB Atlas, CRUD de productos y pedidos, validación de datos y autenticación de administración. La integración con la landing en React está pendiente.

## Proyectos relacionados

| Proyecto | Descripción |
|---|---|
| lara-stock | Trabajo anterior de backend. |
| lara-pasteleria | Landing desarrollada en React. |
| lara-backend | API actual que se conectará con la landing. |

## Tecnologías

- Node.js y pnpm
- Express
- MongoDB Atlas y Mongoose
- Zod
- bcryptjs y jsonwebtoken
- express-rate-limit
- cors y dotenv
- nodemon para desarrollo

## Instalación

Necesitás Node.js con soporte para `fetch`, pnpm, acceso al repositorio y una conexión de MongoDB Atlas.

### 1. Clonar

```bash
git clone https://github.com/sofiimendo/lara-backend.git
cd lara-backend
```

### 2. Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### 3. Configurar el entorno

Copiá `.env.example` y nombrá la copia `.env`.

| Variable | Uso |
|---|---|
| PORT | Puerto de la API. Usamos 4000. |
| MONGODB_URI | Conexión a Atlas con credenciales y nombre de la base acordada. |
| FRONTEND_URL | Dirección del frontend. En desarrollo: http://localhost:5173. |
| JWT_SECRET | Secreto para firmar y verificar tokens. |

Generá el secreto:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copiá el resultado como valor de `JWT_SECRET` en `.env`.

La conexión de `.env.example` es una plantilla que debe completarse.

En Atlas, habilitá la IP actual de tu computadora y verificá los permisos del usuario de base de datos. Si cambiás de Wi-Fi y cambia tu IP pública, puede ser necesario habilitar la nueva IP.

Cada integrante configura su propio `.env`. No subir contraseñas, secretos ni tokens a GitHub.

Reiniciá el servidor después de cambiar `.env`.

### 4. Iniciar

```bash
pnpm dev
```

Respuesta esperada:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

Dejá esa terminal abierta y usá otra para las pruebas. Esperá a que nodemon termine de reiniciar después de guardar archivos.

## Comprobar la API

Abrí:

```text
http://localhost:4000/api/health
```

Respuesta:

```json
{
  "ok": true,
  "message": "API de Lara Pastelería funcionando"
}
```

La dirección raíz no tiene una ruta definida y responde 404.

## Crear una cuenta administradora

No existe registro público de administradores.

Completá temporalmente en `.env`:

```dotenv
ADMIN_NOMBRE="Nombre de la cuenta"
ADMIN_EMAIL="admin@lara.example"
ADMIN_PASSWORD="REEMPLAZAR_POR_UNA_CONTRASENA_PROPIA"
```

La contraseña debe tener al menos 12 caracteres y no superar los 72 bytes en UTF-8.

Ejecutá:

```bash
node scripts/crearAdmin.js
```

Respuesta esperada:

```text
Conectado a MongoDB
Cuenta administradora creada correctamente
```

El script guarda un hash con bcrypt. Si el email existe, no reemplaza la cuenta.

Guardá las credenciales en un gestor de contraseñas y eliminá las variables `ADMIN_*` de `.env`.

Para la cuenta definitiva, usá un correo al que Lara tenga acceso. Actualmente no se envían correos ni existe recuperación de contraseña.

## Autenticación

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/login | Público, con límite de intentos. |

Enviar JSON con `email` y `password`.

Un login correcto responde 200 con `message`, `token` y `usuario`. Los datos del usuario incluyen id, nombre, email y rol.

El token vence en una hora. Las operaciones protegidas requieren:

```text
Authorization: Bearer TOKEN
```

Las credenciales incorrectas responden 401. El login limita a 10 intentos fallidos por IP en 15 minutos; al superar el límite responde 429.

Las rutas protegidas verifican el token y que la cuenta siga activa y tenga rol admin.

## Productos

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| GET | /api/productos | Listar. | Público |
| GET | /api/productos/:id | Obtener por ID. | Público |
| POST | /api/productos | Crear. | Admin |
| PUT | /api/productos/:id | Actualizar todos los campos editables. | Admin |
| PATCH | /api/productos/:id | Actualizar campos parciales. | Admin |
| DELETE | /api/productos/:id | Eliminar. | Admin |

Para escribir datos, enviar `Content-Type: application/json`.

Campos editables:

- nombre
- descripcion
- precio
- categoria
- imagen
- disponible

POST exige nombre y precio. Los demás campos son opcionales.

PUT exige los seis campos. Descripción e imagen pueden ser textos vacíos. Conserva el ID y la fecha de creación.

PATCH exige al menos un campo editable.

El precio debe ser un número mayor o igual a cero. Se rechazan campos desconocidos.

La creación responde 201. Las demás operaciones exitosas responden 200. Un ID inválido responde 400 y un producto inexistente, 404.

Las consultas públicas actuales incluyen productos no disponibles. El filtrado del catálogo queda pendiente.

## Pedidos

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/pedidos | Crear una consulta. | Público, con límite |
| GET | /api/pedidos | Listar. | Admin |
| GET | /api/pedidos/:id | Obtener por ID. | Admin |
| PUT | /api/pedidos/:id | Actualizar los datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar. | Admin |

Crear una consulta no confirma una reserva. Entra con estado `nuevo`.

PUT conserva el estado actual. DELETE elimina el registro; usar `cancelado` cuando se quiera conservar el historial.

La documentación de campos, validaciones, respuestas e integración está en [PEDIDOS.md](./PEDIDOS.md).

## Pruebas manuales con scripts

Con el servidor funcionando, ejecutar en otra terminal:

| Script | Prueba |
|---|---|
| `node scripts/probarLogin.js` | Login y recepción de token. |
| `node scripts/probarAccesoAdmin.js` | Crear y eliminar un producto con acceso admin. |
| `node scripts/probarPutProducto.js` | PUT completo e incompleto de productos. |
| `node scripts/probarPedidoAdmin.js` | Rechazo de un estado inválido en un pedido existente. |
| `node scripts/probarCrudPedido.js` | PUT y DELETE de un pedido de prueba. |

Los scripts piden credenciales y no imprimen el token. Las contraseñas se ven al escribirlas; no compartirlas en capturas ni mensajes.

Las pruebas usan la base configurada en `.env`. Los scripts que crean registros de prueba intentan eliminarlos al terminar. Si la limpieza falla, revisá el ID informado.

## Pruebas con Postman

La colección está disponible en:

[Lara Pastelería API — colección de Postman](./postman/Lara-Pasteleria-API.postman_collection.json)

Actualmente contiene 13 solicitudes: login, CRUD de productos y casos de error de productos. Fueron ejecutadas manualmente en Postman. Incluye un ejemplo guardado de producto inexistente.

Todavía no contiene pruebas automatizadas con aserciones. Las solicitudes de pedidos, usuarios y los casos adicionales de autenticación se incorporarán en las siguientes etapas.

### Configuración

1. Iniciar el backend con `pnpm dev`.
2. En Postman, usar Import y seleccionar el archivo de la colección.
3. Crear un entorno local llamado `Lara Local`.
4. Agregar las siguientes variables y seleccionar ese entorno.

| Variable | Valor |
|---|---|
| adminEmail | Email de una administradora activa de prueba. |
| adminPassword | Contraseña de esa administradora. |
| token | Token recibido al iniciar sesión, sin comillas. |
| productoID | `_id` del producto creado para las pruebas. |

La colección define `baseUrl` como `http://localhost:4000`. Puede modificarse para apuntar a otra instancia de la API.

Los nombres de las variables distinguen mayúsculas y minúsculas: usar `productoID`, con ID en mayúsculas.

Guardar credenciales y token únicamente como valores locales. No compartirlos ni exportar el entorno con datos reales. La colección utiliza referencias a variables y no incluye credenciales reales.

### Ejecución manual

1. Ejecutar `Listar productos`: debe responder 200.
2. Ejecutar `Login admin`: debe responder 200. Copiar el token recibido a la variable local `token`.
3. Ejecutar `Crear producto`: debe responder 201. Copiar el `_id` recibido a `productoID`.
4. Ejecutar `Consultar producto por ID`: debe responder 200.
5. Ejecutar `Actualizar producto con PUT`: debe responder 200 y conservar `_id` y `createdAt`.
6. Ejecutar `Actualizar producto parcial`: debe responder 200 y modificar solo precio y disponibilidad.
7. Ejecutar `Rechazar producto negativo`: debe responder 400.
8. Ejecutar `Rechazar PUT incompleto`: debe responder 400.
9. Ejecutar `Rechazar edicion sin token`: debe responder 401.
10. Ejecutar `Rechazar token invalido`: debe responder 401.
11. Ejecutar `Rechazar ID invalido`: debe responder 400.
12. Consultar nuevamente el producto para comprobar que los intentos rechazados no cambiaron sus datos.
13. Ejecutar `Eliminar producto`: debe responder 200.
14. Ejecutar nuevamente `Consultar producto por ID`: debe responder 404.

La solicitud `Consultar producto inexistente` conserva el ID de un producto de prueba eliminado e incluye el ejemplo `404 — Producto inexistente`. En otra base, comprobar primero que ese ID no exista.

El orden de la lista lateral no representa el orden de ejecución: seguir los pasos anteriores.

El token vence en una hora. Si una operación protegida devuelve 401 por vencimiento, repetir el login y actualizar la variable local `token`.

Las operaciones crean, modifican y eliminan datos reales en la base configurada. Usar productos de prueba y eliminarlos al terminar.

## Organización

```text
postman/
scripts/
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  schemas/
  services/
  utils/
```

- `postman`: colección exportada para pruebas de la API.
- `scripts`: creación de cuentas y pruebas.
- `config`: conexión a MongoDB.
- `controllers`: respuestas HTTP.
- `middlewares`: validación, autenticación y errores.
- `models`: estructura de documentos.
- `routes`: direcciones y métodos.
- `schemas`: validación con Zod.
- `services`: operaciones y lógica del backend.
- `utils`: utilidades compartidas.

## Trabajo en equipo

Desde una copia sin cambios pendientes:

```bash
git switch main
git pull --ff-only
```

Creá una rama para tu tarea:

```bash
git switch -c feat/nombre-de-la-tarea
```

Revisá los cambios, creá un commit, subí la rama y abrí un Pull Request hacia `main`.

Coordiná los archivos que vas a modificar con la otra integrante.

## Pendientes para la entrega

- Revisar e integrar el CRUD de cuentas autorizadas a cargo de Yami.
- Completar las pruebas de pedidos, usuarios y autenticación con Postman.
- Unificar y actualizar la colección exportada.
- Integración con la landing y el panel de administración.
- Despliegue de la API en Render.
- URL publicada documentada.
- Entrega por mail con nombres de las integrantes.