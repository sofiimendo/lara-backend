# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye CRUD de productos, pedidos y usuarios, validación de datos y autenticación de administradores y clientes.

La conexión del formulario y del panel administrativo está a cargo de Yami en `lara-pasteleria`, rama `feat/panel-administrativo`. Su finalización no se verificó en esta ronda de backend.

## Repositorios

| Proyecto | Uso |
|---|---|
| [lara-backend](https://github.com/sofiimendo/lara-backend) | API actual. |
| [lara-pasteleria](https://github.com/sofiimendo/lara-pasteleria) | Landing y panel administrativo en React. |
| lara-stock | Trabajo anterior de backend. |

## Tecnologías

- Node.js y pnpm.
- Express.
- MongoDB Atlas y Mongoose.
- Zod 4.
- bcryptjs y jsonwebtoken.
- express-rate-limit.
- cors y dotenv.
- nodemon para desarrollo.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/sofiimendo/lara-backend.git
cd lara-backend
```

### 2. Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

Se necesita una versión de Node.js compatible con las dependencias del proyecto y con `fetch`.

### 3. Configurar el entorno

Copiar `.env.example` como `.env` y completar los valores localmente.

| Variable | Uso |
|---|---|
| PORT | Puerto de la API. Localmente se utiliza 4000. |
| MONGODB_URI | Conexión a MongoDB Atlas. |
| FRONTEND_URL | Origen del frontend. En desarrollo: http://localhost:5173. |
| JWT_SECRET | Secreto para firmar y verificar tokens; al menos 32 caracteres. |

Cada integrante configura su propio `.env`.

No subir credenciales, secretos ni tokens al repositorio. Reiniciar el servidor después de modificar las variables.

En Atlas, verificar los permisos del usuario de base de datos y habilitar la IP correspondiente.

### 4. Iniciar el servidor

```bash
pnpm dev
```

Mensajes esperados:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

Mantener esa terminal abierta y usar otra para ejecutar pruebas.

## Comprobar la API

```text
GET http://localhost:4000/api/health
```

Respuesta esperada: HTTP 200.

```json
{
  "ok": true,
  "message": "API de Lara Pastelería funcionando"
}
```

La dirección raíz no tiene una ruta definida y responde 404.

## Cuenta administradora inicial

No existe registro público de administradores.

El script disponible para crear la primera cuenta es:

```bash
node scripts/crearAdmin.js
```

Utiliza las variables locales `ADMIN_NOMBRE`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. La contraseña debe tener al menos 12 caracteres y no superar los 72 bytes en UTF-8.

El script guarda un hash con bcrypt y no reemplaza una cuenta cuyo email ya exista.

Después de crearla, retirar las variables temporales `ADMIN_*` del `.env`.

Las cuentas administrativas adicionales pueden gestionarse mediante el módulo de usuarios.

Actualmente no existe recuperación de contraseña ni envío automático de correos.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/auth/login | Login administrativo. |
| POST | /api/clientes/registro | Registro de clientes. |
| POST | /api/clientes/login | Login de clientes. |

El registro de clientes exige `nombre`, `email` y `password`. Asigna el rol `cliente` y `activo: true`.

Las contraseñas requieren entre 12 caracteres y 72 bytes UTF-8 y se guardan como hashes bcrypt.

El login administrativo solo admite cuentas admin activas.

Un login correcto responde 200 con un token y los datos de la cuenta. Los tokens duran una hora.

Las rutas protegidas reciben:

```text
Authorization: Bearer TOKEN
```

Los tokens utilizan audiencias separadas:

| Sesión | Audiencia |
|---|---|
| Administrador | lara-admin |
| Cliente | lara-cliente |

Las rutas verifican el token y que la cuenta continúe activa y tenga el rol requerido.

Un token cliente en una ruta administrativa responde 401 por la separación de audiencias. Ese resultado no constituye una prueba de token vencido.

## Productos

| Método | Ruta | Acceso |
|---|---|---|
| GET | /api/productos | Público |
| GET | /api/productos/:id | Público |
| POST | /api/productos | Admin |
| PUT | /api/productos/:id | Admin |
| PATCH | /api/productos/:id | Admin |
| DELETE | /api/productos/:id | Admin |

Campos editables:

- nombre
- descripcion
- precio
- categoria
- imagen
- disponible

POST exige nombre y precio. PUT exige los seis campos y conserva el ID y la fecha de creación. PATCH exige al menos un campo editable.

El precio debe ser mayor o igual a cero. Se rechazan campos desconocidos.

La creación responde 201; las demás operaciones exitosas, 200. Un ID inválido responde 400 y un producto inexistente, 404.

El listado público actual incluye productos no disponibles. El filtrado del catálogo continúa pendiente.

## Pedidos

La API recibe consultas por encargo. Recibir una consulta no confirma una reserva: Lara debe confirmar disponibilidad y presupuesto.

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/pedidos | Crear pedido. | Cliente |
| GET | /api/pedidos/mis-pedidos | Consultar pedidos propios. | Cliente |
| GET | /api/pedidos | Listar todos los pedidos. | Admin |
| GET | /api/pedidos/:id | Consultar por ID. | Admin |
| PUT | /api/pedidos/:id | Reemplazar datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar pedido. | Admin |

### Campos del formulario

| Campo | Regla |
|---|---|
| nombre | Obligatorio; entre 2 y 80 caracteres. |
| email | Obligatorio; correo válido, máximo 254 caracteres. |
| fecha | Obligatoria; fecha real en formato YYYY-MM-DD. |
| pedido | Obligatorio; opción admitida por el esquema. |
| tipoEvento | Opcional en POST; obligatorio en PUT. |
| cantidadPersonas | Opcional en POST; obligatorio en PUT; entero positivo. |
| detalles | Opcional en POST; obligatorio en PUT; máximo 1000 caracteres. |

El email reemplaza a WhatsApp. Se eliminan sus espacios exteriores y se convierte a minúsculas antes de validar.

El email es un dato de contacto: no determina quién es el propietario del pedido ni genera un envío de correo.

El vínculo con el cliente se obtiene de la sesión autenticada. No se debe enviar `cliente` desde el formulario.

POST asigna el estado `nuevo` y responde 201 con el mensaje de recepción, el ID y el estado.

PUT exige los siete campos y conserva cliente, ID, estado y `createdAt`. `tipoEvento` y `detalles` pueden ser textos vacíos.

Las opciones de pedido son:

- Torta
- Medialunas
- Desayuno
- Panes
- Mesa dulce
- Comida saludable
- Otro pedido

Las tortas y medialunas requieren cinco días de anticipación. Las demás opciones admiten fechas desde hoy. Se utiliza la fecha de Buenos Aires.

Los estados admitidos son `nuevo`, `pendiente`, `confirmado`, `entregado` y `cancelado`.

DELETE elimina el documento. Usar `cancelado` cuando se quiera conservar el historial.

Los documentos anteriores al cambio pueden carecer de email o de cliente vinculado. No se realizó ni verificó una migración de datos en esta ronda.

Más información en [PEDIDOS.md](./PEDIDOS.md).

## Usuarios

Todas las rutas requieren una sesión administrativa activa.

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/usuarios | Crear administrador. |
| GET | /api/usuarios | Listar administradores. |
| GET | /api/usuarios/:id | Consultar administrador. |
| PUT | /api/usuarios/:id | Actualizar administrador. |
| DELETE | /api/usuarios/:id | Eliminar administrador. |

Este CRUD gestiona cuentas admin; las cuentas cliente quedan fuera.

Crear exige `nombre`, `email` y `password`. Las nuevas cuentas reciben rol admin y quedan activas.

Actualizar exige `nombre`, `email` y `activo`; conserva contraseña y rol.

El backend impide que un administrador se elimine o desactive a sí mismo. Rechaza emails duplicados y campos desconocidos. Las respuestas no incluyen contraseñas ni hashes.

Yami documentó pruebas manuales del módulo. Su verificación en Postman sigue pendiente.

Más información en [USUARIOS.md](./USUARIOS.md).

## Scripts de prueba

Ejecutar desde otra terminal con la API funcionando.

| Comando | Alcance |
|---|---|
| `node scripts/probarLogin.js` | Login y recepción de token. |
| `node scripts/probarAccesoAdmin.js` | Creación y eliminación de producto como admin. |
| `node scripts/probarPutProducto.js` | PUT completo e incompleto de productos. |
| `node scripts/probarPedidoAdmin.js` | Estado inválido sobre un pedido existente. |
| `node scripts/probarCrudPedido.js` | CRUD de pedidos con email y conservación de datos. |
| `node scripts/probarAccesoPedidosEmail.js` | Separación de clientes y restricciones administrativas. |

Los scripts de CRUD y acceso con email ocultan las contraseñas al escribirlas. El script independiente `probarPedidoAdmin.js` conserva la entrada visible de contraseña.

Usar cuentas y registros de prueba. No compartir credenciales ni tokens.

### CRUD con email: verificado el 19/10/2026

`probarCrudPedido.js` comprobó:

- Creación como cliente: 201 y estado nuevo.
- Normalización del email en POST y PUT.
- Vínculo con el cliente autenticado.
- Presencia del pedido en mis-pedidos.
- Cambio administrativo a pendiente.
- PUT incompleto: 400 sin modificar el documento.
- PUT completo con un email diferente.
- Conservación de cliente, ID, estado y createdAt.
- Visibilidad de los datos actualizados para el cliente.
- DELETE administrativo y consulta posterior con 404.
- Ausencia del pedido eliminado en mis-pedidos.

Resultado:

```text
Prueba CRUD con email correcta: true
```

El pedido de prueba fue eliminado. Si el script falla, intenta limpiarlo e informa su ID si no puede hacerlo.

### Separación de clientes: verificada el 19/10/2026

`probarAccesoPedidosEmail.js` utilizó dos clientes distintos y un administrador.

Comprobó:

- Un pedido por cliente usando el mismo email de contacto.
- Cada cliente ve su pedido y no ve el del otro.
- El administrador ve ambos pedidos.
- Ambos clientes reciben 401 en las cinco rutas administrativas.
- Los diez intentos rechazados no modifican el pedido comprobado.
- Estado inválido: 400 sin modificar el documento.

Resultado:

```text
Prueba de acceso a pedidos con email correcta: true
```

Ambos pedidos de prueba fueron eliminados.

### Validación aislada del esquema

El 19/10/2026 se ejecutaron doce aserciones: seis para POST y seis para PUT.

Se aceptaron correos válidos, mayúsculas y espacios exteriores, normalizando el resultado. Se rechazaron correos inválidos, espacios internos y texto vacío.

Resultado:

```text
Validación de email correcta: true
```

Esta comprobación no usa HTTP ni guarda documentos. La normalización también se verificó por API con el script de CRUD.

### Resultados históricos

Antes del cambio a email se habían probado:

- CRUD de productos.
- Registro y login de dos clientes.
- Creación y consulta de pedidos propios.
- Separación entre clientes.
- Rechazo de accesos administrativos con token cliente.
- PUT conservando cliente, ID, estado y createdAt.
- DELETE seguido de 404.
- Estado inválido: 400 conservando el estado anterior.

El resultado anterior de `probarPedidoAdmin.js` fue:

```text
Validación correcta: true
```

Ese script independiente no se volvió a ejecutar en esta ronda. El estado inválido con email se comprobó mediante `probarAccesoPedidosEmail.js`.

Las pruebas históricas no constituyen por sí solas evidencia del cambio a email.

## Postman

Colección versionada:

[Descargar colección](./postman/Lara-Pasteleria-API.postman_collection.json)

| Grupo | Solicitudes |
|---|---:|
| Autenticación administrativa y productos | 16 |
| Pedidos | 15 |
| Clientes y pedidos propios | 15 |
| Usuarios | 5 |
| Total | 51 |

La colección completa fue importada y se confirmó la presencia de Usuarios.

No contiene aserciones automatizadas. El script previo calcula fechas; no verifica resultados.

### Variables

| Variable | Uso |
|---|---|
| baseUrl | http://localhost:4000 |
| adminEmail | Email administrativo de prueba. |
| adminPassword | Contraseña administrativa local. |
| token | Token administrativo. |
| clienteEmail | Email del primer cliente. |
| clientePassword | Contraseña local del primer cliente. |
| clienteToken | Token del primer cliente. |
| cliente2Email | Email del segundo cliente. |
| cliente2Password | Contraseña local del segundo cliente. |
| cliente2Token | Token del segundo cliente. |
| productoID | ID del producto de prueba. |
| pedidoID | ID del pedido de prueba. |
| usuarioId | ID del usuario administrativo de prueba. |
| passwordUsuarioPrueba | Contraseña local para el usuario de prueba. |

Respetar mayúsculas y minúsculas: `productoID`, `pedidoID` y `usuarioId`.

Los tokens se guardan sin comillas ni prefijo Bearer. Las solicitudes agregan ese prefijo.

Guardar credenciales y tokens únicamente como valores locales. No exportar el entorno con datos reales.

### Fechas automáticas

El script previo de la colección calcula según Buenos Aires:

| Variable local de ejecución | Valor |
|---|---|
| fechaPedido | Hoy más 30 días. |
| fechaSinAnticipacion | Hoy. |

No es necesario crearlas manualmente en el entorno.

Los cuatro cuerpos de pedidos que usaban WhatsApp fueron adaptados a `email: "{{clienteEmail}}"`.

La prueba de torta sin anticipación utiliza la fecha de hoy.

### Flujo manual

1. Iniciar sesión como cliente y actualizar clienteToken.
2. Crear pedido como cliente: esperar 201.
3. Guardar el ID en pedidoID.
4. Consultar mis pedidos y comprobar los datos.
5. Iniciar sesión como admin y actualizar token.
6. Consultar y actualizar el pedido con PUT.
7. Verificar ID, cliente, estado y createdAt.
8. Probar torta sin anticipación: esperar 400 en fecha.
9. Cambiar el estado como admin.
10. Eliminar el pedido.
11. Consultar el ID eliminado: esperar 404.
12. Consultar mis pedidos: el pedido eliminado no debe aparecer.

Para repetir el flujo, crear otro pedido y actualizar pedidoID.

No ejecutar toda la colección sin revisar el orden y los registros afectados.

### Resultados con email del 19/10/2026

| Comprobación | Resultado observado |
|---|---|
| Login cliente y admin | 200 |
| Crear pedido con email | 201 y estado nuevo |
| Consultar mis pedidos | 200, email correcto y vínculo con el cliente |
| Fecha automática válida | 2026-11-18 |
| PUT administrativo | 200; actualizó nombre, cantidad y detalles |
| Conservación con PUT | ID, cliente, estado nuevo y createdAt conservados |
| Email en PUT manual | Se conservó el mismo correo |
| Torta sin anticipación | 400 en fecha |
| Cambio de estado | 200, pendiente |
| DELETE | 200 |
| Consulta posterior por ID | 404 |
| Mis pedidos después del DELETE | 200 con pedidos vacío |

El pedido usado en esta ronda fue eliminado.

El cambio a otro email y su normalización se comprobaron con el script de CRUD. El PUT manual mantuvo el mismo correo.

Estos resultados no implican que se hayan vuelto a ejecutar las 51 solicitudes.

### Usuarios en Postman

Se conservan las cinco solicitudes aportadas por Yami. Su ejecución continúa pendiente.

Para verificarlas:

1. Iniciar sesión como admin y actualizar token.
2. Configurar passwordUsuarioPrueba localmente.
3. Crear un usuario de prueba y guardar su ID en usuarioId.
4. Listarlo y consultarlo por ID.
5. Actualizarlo y verificar los datos conservados.
6. Eliminarlo usando una cuenta administrativa diferente.
7. Consultarlo nuevamente: esperar 404.

Seguir también las validaciones documentadas en USUARIOS.md.

## Autenticación y límites: resultados previos

Estas comprobaciones son anteriores a la ronda de pedidos con email.

| Caso | Resultado verificado |
|---|---|
| Login admin con contraseña incorrecta | 401 |
| Login admin con email inexistente | 401 |
| Login cliente con contraseña incorrecta | 401 |
| Login cliente con email inexistente | 401 |
| Registro con email duplicado | 409 |
| Registro enviando rol | 400 |
| Registro enviando activo | 400 |
| Contraseña menor a 12 caracteres | 400 en password |
| Límite de registro cliente | 429 |
| Límite de login cliente | 429 |
| Límite de login admin | 429 |

### Configuración de límites

| Operación | Configuración |
|---|---|
| Login admin | 10 intentos fallidos por IP en 15 minutos. |
| Registro cliente | 5 solicitudes por IP en 15 minutos. |
| Login cliente | 10 solicitudes por IP en 15 minutos, incluidos los éxitos. |
| Creación de pedidos | 10 solicitudes por IP en 15 minutos, después de autenticar. |

Las pruebas negativas observaron respuestas 429 en registro y login. No midieron el umbral exacto desde una ventana vacía.

No se verificó todavía:

- El límite de creación de pedidos.
- La recuperación después de las ventanas de bloqueo.
- Otros escenarios de autenticación que deben definirse y revisarse.

Las pruebas de límites deben ejecutarse al final: pueden bloquear temporalmente operaciones desde la misma IP.

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

| Directorio | Responsabilidad |
|---|---|
| postman | Colección de solicitudes. |
| scripts | Creación de cuentas y pruebas. |
| config | Conexión a MongoDB. |
| controllers | Respuestas HTTP. |
| middlewares | Autenticación, validación y errores. |
| models | Estructura de documentos. |
| routes | Métodos, rutas y permisos. |
| schemas | Validación con Zod. |
| services | Operaciones y lógica del backend. |
| utils | Utilidades compartidas. |

## Trabajo en equipo

Crear una rama para cada tarea y coordinar los archivos con la otra integrante.

Antes de comenzar trabajo nuevo, partir de una copia sin cambios pendientes y actualizar main:

```bash
git switch main
git pull --ff-only
git switch -c feat/nombre-de-la-tarea
```

Revisar cambios, crear un commit, subir la rama y abrir un Pull Request hacia main.

La ronda de pedidos con email se está preparando en `test/pedidos-email`. No se debe presentar como integrada a main hasta completar el PR.

## Pendientes

- Revisar los cambios de pedidos con email e integrarlos mediante PR.
- Verificar Usuarios en Postman.
- Definir y completar otros escenarios concretos de autenticación.
- Verificar el límite de creación de pedidos.
- Comprobar la recuperación después de las ventanas de bloqueo.
- Conservar las 51 solicitudes y la carpeta Usuarios al exportar.
- Completar la integración del formulario y panel con Yami.
- Revisar CORS y variables para deploy.
- Revisar acceso a Atlas y configuración de proxy para rate limiting.
- Desplegar la API.
- Probar la integración desde la web publicada.
- Documentar las URLs definitivas.