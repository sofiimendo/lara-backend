# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye MongoDB Atlas, CRUD de productos, pedidos y usuarios, validación de datos y autenticación de administradores y clientes. La integración con la landing en React está pendiente.

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

Generá el secreto localmente:

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

Mensajes esperados:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

Dejá esa terminal abierta y usá otra para comandos. Esperá a que nodemon termine de reiniciar después de guardar archivos.

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

Para crear la primera cuenta, completá temporalmente en `.env`:

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

Mensajes esperados:

```text
Conectado a MongoDB
Cuenta administradora creada correctamente
```

El script guarda un hash con bcrypt. Si el email existe, no reemplaza la cuenta.

Guardá las credenciales en un gestor de contraseñas y eliminá las variables `ADMIN_*` de `.env`.

Las cuentas adicionales también pueden crearse mediante el módulo de usuarios con una sesión administradora.

Para la cuenta definitiva, usá un correo al que Lara tenga acceso y reemplazá las credenciales de prueba antes del uso definitivo. Actualmente no se envían correos ni existe recuperación de contraseña.

## Autenticación administrativa

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/login | Público, con límite de intentos. |

Enviar JSON con `email` y `password`.

Un login correcto responde 200 con `message`, `token` y `usuario`. Los datos del usuario incluyen id, nombre, email y rol.

El login administrativo solo admite cuentas admin activas.

El token vence en una hora. Las operaciones protegidas requieren:

```text
Authorization: Bearer TOKEN
```

Las credenciales incorrectas responden 401. El login limita a 10 intentos fallidos por IP en 15 minutos; al superar el límite responde 429.

Las rutas administrativas verifican el token y que la cuenta siga activa y tenga rol admin.

## Clientes

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/clientes/registro | Crear una cuenta cliente. | Público, con límite |
| POST | /api/clientes/login | Iniciar sesión como cliente. | Público, con límite |

El registro exige `nombre`, `email` y `password`, normaliza el email y asigna exclusivamente el rol `cliente` y `activo: true`.

La contraseña exige al menos 12 caracteres y un máximo de 72 bytes UTF-8; se almacena como hash bcrypt. Los emails duplicados responden 409 y los campos desconocidos se rechazan.

El registro responde 201 con `message` y `cliente`, sin contraseña ni hash.

El login correcto responde 200 con `message`, `token` y `cliente`. Las credenciales incorrectas responden 401.

El token de cliente dura una hora y usa la audiencia `lara-cliente`.

El registro admite 5 solicitudes por IP cada 15 minutos y el login de clientes, 10 solicitudes por IP cada 15 minutos, incluidos los intentos exitosos. Al superar el límite responden 429.

Las rutas de cliente verifican token, audiencia, cuenta activa y rol.

## Usuarios

El módulo de usuarios permite administrar las cuentas autorizadas para acceder al panel de administración de Lara Pastelería.

No existe registro público de administradores. Todas las rutas de este módulo requieren autenticación JWT y permisos de administrador.

Solo gestionan cuentas con rol `admin`; las cuentas cliente quedan fuera de este CRUD.

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| GET | /api/usuarios | Listar usuarios. | Admin |
| GET | /api/usuarios/:id | Obtener usuario por ID. | Admin |
| POST | /api/usuarios | Crear usuario. | Admin |
| PUT | /api/usuarios/:id | Actualizar usuario. | Admin |
| DELETE | /api/usuarios/:id | Eliminar usuario. | Admin |

Para crear usuarios se requieren `nombre`, `email` y `password`. La contraseña debe tener al menos 12 caracteres, no superar los 72 bytes en UTF-8 y se almacena como un hash con bcrypt.

Las cuentas nuevas reciben automáticamente el rol `admin` y quedan activas.

Para actualizar usuarios se requieren `nombre`, `email` y `activo`. PUT conserva la contraseña y el rol.

El backend impide que una cuenta administradora se elimine o desactive a sí misma. También rechaza emails duplicados y campos desconocidos.

Las respuestas no incluyen la contraseña ni su hash.

Las cinco operaciones del CRUD fueron probadas manualmente por Yami, junto con las principales validaciones de seguridad. Queda verificar y completar su cobertura en Postman.

La documentación completa está en [USUARIOS.md](./USUARIOS.md).

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
| POST | /api/pedidos | Crear una consulta vinculada a la cuenta. | Cliente, con límite |
| GET | /api/pedidos/mis-pedidos | Listar los pedidos propios. | Cliente |
| GET | /api/pedidos | Listar todos los pedidos. | Admin |
| GET | /api/pedidos/:id | Obtener por ID. | Admin |
| PUT | /api/pedidos/:id | Actualizar los datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar. | Admin |

Crear una consulta no confirma una reserva. Entra con estado `nuevo`.

POST devuelve únicamente el ID y el estado del pedido, además del mensaje de recepción.

Los siete campos del formulario son:

- nombre
- whatsapp
- fecha
- tipoEvento
- pedido
- cantidadPersonas
- detalles

PUT exige los siete campos y conserva el vínculo con el cliente, el estado, el ID y la fecha de creación. La conservación de estos datos se verificó manualmente después de integrar clientes. El cliente también pudo consultar los datos actualizados desde `mis-pedidos`.

Los estados admitidos son `nuevo`, `pendiente`, `confirmado`, `entregado` y `cancelado`.

DELETE elimina el registro; usar el estado `cancelado` cuando se quiera conservar el historial.

Después de eliminar el pedido de prueba, se verificó que la consulta administrativa por ID respondiera 404 y que el pedido dejara de aparecer en `mis-pedidos`.

Las tortas y medialunas requieren al menos cinco días de anticipación. Los demás pedidos admiten fechas desde hoy. La validación utiliza la fecha de Buenos Aires y el formato `YYYY-MM-DD`.

La creación requiere un token de cliente y está limitada a 10 solicitudes por IP en 15 minutos, después de autenticar.

El backend toma el ID del cliente desde la sesión, no desde el cuerpo enviado.

`mis-pedidos` filtra por la cuenta autenticada. La consulta individual por ID y las operaciones administrativas siguen reservadas a administradores.

Los pedidos antiguos pueden no tener un cliente vinculado.

La documentación adicional está en [PEDIDOS.md](./PEDIDOS.md). Ese documento debe revisarse para actualizar las referencias al antiguo acceso público de creación.

## Pruebas manuales con scripts

Los scripts existentes se enumeran como referencia. Los que crean pedidos deben revisarse y adaptarse al nuevo requisito de autenticación de cliente antes de reutilizarlos; no se verificaron nuevamente tras ese cambio.

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

La colección contiene 40 solicitudes:

- 13 de autenticación administrativa y productos.
- 15 en la carpeta Pedidos.
- 7 de registro/login de clientes y consulta de pedidos propios.
- 5 en la carpeta Usuarios, conservadas de Yami.

Los CRUD de productos y pedidos se probaron manualmente antes de integrar clientes. Después de esa integración se verificaron los casos detallados más abajo, incluidos PUT y DELETE de pedidos; esto no implica que las 40 solicitudes se hayan ejecutado nuevamente.

Las pruebas manuales del módulo de usuarios están documentadas en [USUARIOS.md](./USUARIOS.md). Queda completar su verificación en Postman y los casos adicionales de autenticación y límites de solicitudes.

La colección no contiene pruebas automatizadas con aserciones. Guardar solicitudes no implica que los resultados se verifiquen automáticamente.

### Configuración

1. Iniciar el backend con `pnpm dev`.
2. En Postman, usar Import y seleccionar el archivo de la colección completa.
3. Crear un entorno local llamado `Lara Local`.
4. Agregar las siguientes variables y seleccionar ese entorno.

| Variable | Valor |
|---|---|
| adminEmail | Email de una administradora activa de prueba. |
| adminPassword | Contraseña de esa administradora. |
| token | Token del login administrativo, sin comillas ni prefijo Bearer. |
| productoID | `_id` del producto creado para las pruebas. |
| pedidoID | `id` devuelto al crear el pedido de prueba. |
| usuarioId | ID del usuario creado para las pruebas. |
| passwordUsuarioPrueba | Contraseña local para crear un usuario de prueba; mínimo 12 caracteres y máximo 72 bytes UTF-8. |
| clienteEmail | Email del primer cliente de prueba. |
| clientePassword | Contraseña local del primer cliente. |
| clienteToken | Token del login del primer cliente, sin comillas ni prefijo Bearer. |
| cliente2Email | Email diferente para el segundo cliente. |
| cliente2Password | Contraseña local del segundo cliente. |
| cliente2Token | Token del login del segundo cliente. |

La colección define `baseUrl` como `http://localhost:4000`. Puede modificarse para apuntar a otra instancia de la API.

Los nombres de las variables distinguen mayúsculas y minúsculas: usar `productoID` y `pedidoID`, con ID en mayúsculas, y `usuarioId`, con Id.

Guardar credenciales y tokens únicamente como valores locales. No compartirlos ni exportar el entorno con datos reales. La colección utiliza referencias a variables y no incluye credenciales reales.

### Ejecución manual de productos

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

La solicitud `Consultar producto inexistente` conserva el ID de un producto de prueba eliminado. En otra base, comprobar primero que ese ID no exista.

### Ejecución manual de clientes y pedidos

1. Completar las variables locales de ambos clientes. Las contraseñas requieren al menos 12 caracteres y como máximo 72 bytes UTF-8.
2. Ejecutar `Registrar cliente`: esperar 201. Si la cuenta ya existe, usar su login; repetir el registro con el mismo email devuelve 409.
3. Ejecutar `Login cliente`: esperar 200 y copiar el token a `clienteToken`.
4. Ajustar las fechas antes de crear o actualizar pedidos. Para tortas y medialunas usar una fecha con al menos cinco días de anticipación según Buenos Aires. Los ejemplos tienen fechas fijas.
5. Ejecutar `Crear pedido como cliente` con Bearer `{{clienteToken}}`: esperar 201, `pedido.id` y estado `nuevo`. Copiar el ID a `pedidoID`.
6. Ejecutar `Consultar mis pedidos`: esperar 200 y comprobar el ID y el vínculo con el cliente.
7. Ejecutar los rechazos de consulta de pedidos propios y creación sin token: esperar 401. La creación rechazada no debe generar otro pedido.
8. Ejecutar el rechazo del listado administrativo con token de cliente: esperar 401. Esta respuesta rechaza el token de cliente en el acceso administrativo; no representa una prueba de expiración.
9. Ejecutar `Login admin` y copiar el token a `token`. Consultar el pedido por ID y listar pedidos con Bearer `{{token}}`: esperar 200.
10. Ejecutar `Cambiar estado del pedido` como admin: esperar 200 y estado `pendiente`. Consultar los pedidos propios como cliente y verificar que vea el cambio.
11. Ejecutar el rechazo del cambio de estado con token de cliente: esperar 401. Consultar otra vez los pedidos propios y confirmar que conserva `pendiente` y sus datos.
12. Ejecutar `Registrar segundo cliente` y `Login segundo cliente`; guardar su token en `cliente2Token`.
13. Consultar los pedidos propios del segundo cliente: esperar 200 y `pedidos: []` si no creó pedidos. No debe incluir el pedido del primer cliente.
14. Consultar el pedido del primero por ID con el token del segundo: esperar 401, porque la ruta por ID es administrativa.
15. En `Rechazar torta sin anticipacion`, usar Bearer `{{clienteToken}}` y fecha de hoy en Buenos Aires: esperar 400 con el mensaje de los cinco días de anticipación.
16. Ejecutar `Actualizar pedido` como admin con los siete campos: esperar 200 y comprobar que conserva cliente, estado, ID y `createdAt`. Consultar `mis-pedidos` con el token del cliente y verificar que muestra los datos actualizados.
17. Probar estado inválido y PUT incompleto: esperar 400. Probar listado sin token: esperar 401. Probar ID inválido con token admin válido: esperar 400. Consultar nuevamente para verificar que los rechazos no modificaron datos.
18. Al terminar las comprobaciones, ejecutar `Eliminar pedido` como admin: esperar 200; consultar nuevamente por ID: esperar 404. Consultar los pedidos propios del cliente: esperar 200 y comprobar que el pedido eliminado ya no figure.

### Resultados verificados tras integrar clientes

- Registro de dos clientes: 201, rol cliente, sin contraseña ni hash en la respuesta.
- Login de ambos clientes y del administrador: 200.
- Creación autenticada de pedido: 201, estado nuevo y vínculo con el primer cliente.
- Consulta de pedidos propios: 200.
- Consulta de pedidos propios y creación sin token: 401; sin pedido adicional.
- Listado administrativo y cambio de estado con token cliente: 401.
- Consulta por ID como administrador y cambio a pendiente: 200.
- El primer cliente ve el estado pendiente.
- El intento rechazado de cambiar el estado no altera estado ni fecha de actualización.
- El segundo cliente recibe una lista vacía y su consulta directa del pedido por ID responde 401.
- Torta sin anticipación con token cliente: 400 por la fecha.
- PUT administrativo: 200 con el mensaje `Datos del pedido actualizados correctamente`. Actualizó los siete campos del formulario y conservó cliente, ID, estado `pendiente` y `createdAt`.
- Después del PUT, el cliente consultó sus pedidos y vio los datos actualizados: nombre `Cliente editado Postman`, fecha `2026-10-31` y 15 personas.
- DELETE administrativo: respuesta con el mensaje `Pedido eliminado correctamente`.
- Consulta administrativa por ID después del DELETE: 404 con el mensaje `Pedido no encontrado`.
- Consulta de pedidos propios después del DELETE: 200 con `pedidos: []`.

El pedido de prueba utilizado en esta integración ya fue eliminado. Para repetir el flujo, crear un pedido nuevo y actualizar la variable `pedidoID`.

Las comprobaciones de estado inválido, PUT incompleto, listado sin token e ID inválido no se repitieron en esta última ronda. Los pasos de ejecución describen cómo probarlas; no deben interpretarse como resultados nuevos.

### Ejecución manual de usuarios

La carpeta `Usuarios` conserva las cinco solicitudes aportadas por Yami.

1. Iniciar sesión con una administradora activa y actualizar `token`.
2. Completar `passwordUsuarioPrueba` únicamente como valor local.
3. Ejecutar `Crear usuario`: debe responder 201. Copiar el ID recibido a `usuarioId`.
4. Ejecutar `Listar usuarios` y `Consultar usuario por ID`: deben responder 200.
5. Ejecutar `Actualizar usuario`: debe responder 200 y conservar la contraseña y el rol.
6. Ejecutar `Eliminar usuario`: debe responder 200.
7. Consultar nuevamente el usuario eliminado: debe responder 404.

Usar una cuenta administradora distinta de la cuenta de prueba para realizar estas operaciones. El backend impide eliminar o desactivar la cuenta que está realizando la solicitud.

Seguir también las validaciones y los resultados esperados de [USUARIOS.md](./USUARIOS.md). Eliminar la cuenta de prueba al terminar.

### Consideraciones para las pruebas

El orden de la lista lateral no representa el orden de ejecución: seguir los pasos de esta documentación.

Los tokens vencen en una hora. Si una operación protegida devuelve 401 por vencimiento, repetir el login y actualizar la variable local correspondiente: `token`, `clienteToken` o `cliente2Token`, según la sesión.

Las operaciones crean, modifican y eliminan datos reales en la base configurada. Usar registros de prueba.

La colección completa debe mantenerse sincronizada en Postman para conservar también la carpeta Usuarios al volver a exportarla.

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

- Completar la verificación de usuarios en Postman y los casos adicionales de autenticación y rate limiting.
- Revisar los scripts de pedidos y PEDIDOS.md para adaptarlos al acceso de clientes.
- Mantener sincronizada la colección completa en Postman, incluida la carpeta Usuarios.
- Actualizar la documentación con los casos que se incorporen.
- Integrar la landing y el panel de administración, a cargo de Yami.
- Desplegar la API en Render y revisar variables de entorno, acceso a Atlas, CORS y configuración de proxy para rate limiting.
- Probar la integración desde la web publicada.
- Documentar las URLs publicadas.
- Entregar por Discord con nombres y emails de ambas integrantes.