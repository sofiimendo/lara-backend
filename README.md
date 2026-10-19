# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye CRUD de productos, pedidos y usuarios, validación de datos y autenticación de administradores y clientes.

Admite consultas web de clientes registrados y pedidos presenciales cargados por administradores. No incluye carrito ni pagos.

## Proyectos publicados

| Proyecto | URL |
|---|---|
| Backend en Render | https://lara-backend-5tq4.onrender.com |
| Health del backend | https://lara-backend-5tq4.onrender.com/api/health |
| Landing en Vercel | https://lara-pasteleria.vercel.app |

La configuración de CORS para el origen de Vercel fue comprobada. La integración completa del frontend publicado con la API sigue pendiente de verificación conjunta.

## Repositorios

| Proyecto | Uso |
|---|---|
| [lara-backend](https://github.com/sofiimendo/lara-backend) | API actual. |
| [lara-pasteleria](https://github.com/sofiimendo/lara-pasteleria) | Landing y panel en React. |
| lara-stock | Trabajo anterior de backend. |

Yami trabaja en el frontend. Los cambios del backend se coordinan mediante campos y rutas compartidos.

## Tecnologías

- Node.js y pnpm.
- Express.
- MongoDB Atlas y Mongoose.
- Zod 4.
- bcryptjs y jsonwebtoken.
- express-rate-limit.
- cors y dotenv.
- nodemon para desarrollo.
- Render para alojar la API.
- Vercel para alojar el frontend.

## Instalación local

### Clonar e instalar

```bash
git clone https://github.com/sofiimendo/lara-backend.git
cd lara-backend
pnpm install --frozen-lockfile
```

Entorno local observado el 19/10/2026:

| Herramienta | Versión |
|---|---|
| Node.js | 26.3.0 |
| pnpm | 11.17.0 |

### Configurar el entorno

Copiar `.env.example` como `.env` y completar los valores localmente.

| Variable | Uso |
|---|---|
| PORT | Puerto HTTP; localmente 4000. |
| MONGODB_URI | Conexión a MongoDB Atlas. |
| FRONTEND_URL | Origen permitido del frontend, sin rutas. |
| JWT_SECRET | Secreto para JWT; al menos 32 caracteres. |

Cada integrante configura su propio entorno.

No subir credenciales, secretos ni tokens al repositorio. Reiniciar el servidor después de modificar variables.

En Atlas, configurar los permisos del usuario de base de datos y el acceso de red correspondiente.

El servidor espera la conexión a MongoDB antes de iniciar HTTP.

### Iniciar

Desarrollo con reinicio automático:

```bash
pnpm dev
```

Inicio sin nodemon:

```bash
pnpm start
```

`pnpm start` ejecuta `node server.js`. Los cambios requieren reinicio manual cuando se utiliza este comando.

Mensajes esperados en local:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

## Health

```text
GET /api/health
```

Respuesta: HTTP 200.

```json
{
  "ok": true,
  "message": "API de Lara Pastelería funcionando"
}
```

La raíz no tiene una ruta definida y responde 404.

Health comprueba que el servidor HTTP responde. No ejecuta una consulta a MongoDB en cada solicitud.

## Despliegue en Render

Configuración utilizada:

| Opción | Valor |
|---|---|
| Repositorio | lara-backend |
| Rama | main |
| Directorio raíz | Raíz del repositorio. |
| Build Command | pnpm install --frozen-lockfile |
| Start Command | pnpm start |
| Health Check Path | /api/health |

Variables de producción:

| Variable | Configuración |
|---|---|
| NODE_ENV | production |
| NODE_VERSION | 26.3.0 |
| MONGODB_URI | Valor privado configurado en Render. |
| JWT_SECRET | Valor privado configurado en Render. |
| FRONTEND_URL | https://lara-pasteleria.vercel.app |
| PORT | Puerto proporcionado por Render. |
| RENDER | Variable de la plataforma utilizada para activar la configuración del proxy. |

No se incluyen los valores privados en esta documentación.

MongoDB Atlas tiene habilitadas las direcciones de salida correspondientes al servicio de Render. El despliegue logró conectarse a MongoDB e iniciar la API.

### Proxy

Cuando `RENDER` es `true`, Express configura:

```text
trust proxy = 1
```

La comprobación específica del rate limiting detrás del proxy de Render sigue pendiente. Las pruebas locales de límites no prueban su comportamiento en producción.

### Conexión con el frontend

El backend utiliza `FRONTEND_URL` para permitir el origen del frontend.

El frontend debe configurar `VITE_API_URL` para apuntar al backend publicado. La inclusión de `/api` en esa variable depende de cómo el frontend construya sus rutas.

Modificar una variable del frontend requiere volver a desplegarlo para incorporarla a la compilación.

## CORS

La configuración permite:

- `http://localhost:5173`.
- El origen configurado en `FRONTEND_URL`, si existe.

Se quitan espacios exteriores y barras finales de `FRONTEND_URL`.

No se utiliza una URL pública alternativa cuando la variable está ausente.

CORS no sustituye la autenticación ni impide por sí solo solicitudes realizadas con curl o Postman.

### Pruebas locales verificadas

| Comprobación | Resultado |
|---|---|
| Preflight desde localhost:5173 | 204 con el origen permitido. |
| Método POST | Permitido en el preflight. |
| Encabezados authorization y content-type | Permitidos en el preflight. |
| Preflight desde origen ajeno | 204 sin Access-Control-Allow-Origin. |

### Pruebas en Render verificadas el 19/10/2026

| Comprobación | Resultado |
|---|---|
| Preflight desde https://lara-pasteleria.vercel.app | 204 con Access-Control-Allow-Origin correspondiente. |
| Método POST | Permitido en el preflight. |
| Encabezados authorization y content-type | Permitidos en el preflight. |
| Preflight desde origen ajeno | 204 sin Access-Control-Allow-Origin. |

Origen permitido:

```bash
curl --max-time 90 -i -X OPTIONS https://lara-backend-5tq4.onrender.com/api/pedidos \
  -H "Origin: https://lara-pasteleria.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Origen no permitido:

```bash
curl --max-time 90 -i -X OPTIONS https://lara-backend-5tq4.onrender.com/api/pedidos \
  -H "Origin: https://origen-no-permitido.example" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

El código 204 por sí solo no indica permiso de origen. Se debe comprobar `Access-Control-Allow-Origin`.

Estas pruebas verifican el preflight. No equivalen a completar los flujos desde el navegador del frontend publicado.

## Administrador inicial

No existe registro público de administradores.

```bash
node scripts/crearAdmin.js
```

El script utiliza `ADMIN_NOMBRE`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados localmente.

La contraseña requiere al menos 12 caracteres y como máximo 72 bytes UTF-8.

Se guarda un hash bcrypt. Si el email existe, no se reemplaza la cuenta.

Después de crearla, retirar las variables temporales `ADMIN_*` del entorno.

Las cuentas administrativas adicionales se gestionan mediante Usuarios.

No existe recuperación de contraseña ni envío automático de correos.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/auth/login | Login administrativo. |
| POST | /api/clientes/registro | Registro de cliente. |
| POST | /api/clientes/login | Login de cliente. |

El registro exige nombre, email y password. Asigna `rol: cliente` y `activo: true`.

Las contraseñas se guardan como hashes bcrypt y requieren al menos 12 caracteres y un máximo de 72 bytes UTF-8.

El login administrativo solo admite cuentas admin activas.

Un login correcto devuelve 200, token y datos de la cuenta.

Los tokens duran una hora.

| Sesión | Audiencia |
|---|---|
| Administrador | lara-admin |
| Cliente | lara-cliente |

Las rutas protegidas reciben:

```text
Authorization: Bearer TOKEN
```

Se verifican token, audiencia, cuenta activa y rol.

Un token cliente en una ruta administrativa responde 401 por la separación de audiencias. Ese resultado no constituye una prueba de token vencido.

## Productos

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| GET | /api/productos | Listar disponibles. | Público |
| GET | /api/productos/admin | Listar todos. | Admin |
| GET | /api/productos/admin/:id | Consultar cualquier producto por ID. | Admin |
| GET | /api/productos/:id | Consultar un producto disponible. | Público |
| POST | /api/productos | Crear. | Admin |
| PUT | /api/productos/:id | Reemplazar datos editables. | Admin |
| PATCH | /api/productos/:id | Actualizar parcialmente. | Admin |
| DELETE | /api/productos/:id | Eliminar. | Admin |

Campos editables:

- nombre
- descripcion
- precio
- categoria
- imagen
- disponible

POST exige nombre y precio.

PUT exige los seis campos. PATCH exige al menos un campo editable.

El precio debe ser mayor o igual a cero. Se rechazan campos desconocidos.

Crear responde 201. Las otras operaciones exitosas responden 200.

ID inválido: 400. Producto inexistente: 404.

### Disponibilidad

Las consultas públicas solo muestran productos con `disponible: true`.

Un producto no disponible responde 404 en la consulta pública por ID, aunque exista en la base de datos.

El panel debe utilizar las consultas administrativas para visualizar también los no disponibles.

Las rutas de creación, edición y eliminación mantienen su ubicación original, sin `/admin`.

### Pruebas locales de disponibilidad

Se verificó con un producto temporal:

- Creación con `disponible: false`: 201.
- Listado público: no incluye el producto.
- Consulta pública por ID: 404.
- Listado y consulta administrativa: incluyen el producto.
- Cambio a `disponible: true`: 200.
- Listado y consulta pública: muestran el producto.
- Consultas administrativas sin sesión o con token cliente: 401.
- Eliminación administrativa: 200.
- Consulta posterior administrativa: 404.

El producto temporal fue eliminado.

## Pedidos

La recepción de una consulta no confirma una reserva.

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/pedidos | Crear consulta web. | Cliente |
| POST | /api/pedidos/admin | Crear presencial. | Admin |
| GET | /api/pedidos/mis-pedidos | Consultar propios. | Cliente |
| GET | /api/pedidos | Listar todos. | Admin |
| GET | /api/pedidos/:id | Consultar por ID. | Admin |
| PUT | /api/pedidos/:id | Reemplazar datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar. | Admin |

### Pedidos web

Campos obligatorios al crear:

- nombre
- email
- fecha
- pedido

Opcionales al crear:

- tipoEvento
- cantidadPersonas
- detalles

El backend toma `cliente` de la sesión y asigna `origen: web` y `estado: nuevo`.

El email se normaliza quitando espacios exteriores y convirtiéndolo a minúsculas antes de validar su formato.

POST devuelve 201, mensaje y un objeto `pedido` con `id` y `estado`.

La ruta web no admite `telefono` ni `confirmarAnticipacion`.

### Pedidos presenciales

`POST /api/pedidos/admin` exige sesión administrativa.

No requiere cuenta cliente ni crea una cuenta ficticia.

Exige nombre, fecha, pedido y al menos un contacto válido: email o telefono.

`tipoEvento`, `cantidadPersonas` y `detalles` son opcionales al crear.

Email o telefono pueden omitirse individualmente; se normalizan a texto vacío. Si se completan ambos, ambos deben ser válidos.

El teléfono admite entre 8 y 15 dígitos, un máximo de 25 caracteres, espacios, guiones, paréntesis y un signo `+` inicial. No verifica existencia ni disponibilidad de WhatsApp.

El backend asigna:

- `origen: presencial`.
- `creadoPor` con el ID del administrador.
- `estado: nuevo`.
- Sin cliente vinculado.

Responde 201 con el mensaje `Pedido presencial creado correctamente` y el documento completo. Su ID se obtiene de `pedido._id`.

Guardar email o teléfono no envía mensajes.

La coincidencia del email no vincula el presencial con una cuenta cliente.

### Validaciones comunes

| Campo | Regla |
|---|---|
| nombre | Entre 2 y 80 caracteres. |
| email | Correo válido de hasta 254 caracteres cuando está completo. |
| fecha | Fecha real YYYY-MM-DD. |
| pedido | Opción admitida. |
| tipoEvento | Vacío, Cumpleaños, Reunión u Otro. |
| cantidadPersonas | Entero positivo; acepta número o texto numérico. |
| detalles | Máximo 1000 caracteres. |

Opciones de pedido:

- Torta
- Medialunas
- Desayuno
- Panes
- Mesa dulce
- Comida saludable
- Otro pedido

### Anticipación

Se utiliza la fecha de Buenos Aires.

En web, tortas y medialunas requieren cinco días. Las demás opciones admiten desde hoy.

En presenciales, un administrador puede aceptar menos de cinco días enviando `confirmarAnticipacion: true` después de una confirmación explícita en el panel.

Las fechas pasadas se rechazan incluso con esa confirmación.

La excepción se aplica a creación y edición presencial. El indicador no se guarda ni genera historial de excepciones.

### Edición

PUT selecciona el esquema según el origen guardado.

| Origen | Cuerpo completo de PUT |
|---|---|
| Web | nombre, email, fecha, tipoEvento, pedido, cantidadPersonas y detalles. |
| Presencial | Los siete campos anteriores más telefono. |

En presencial, email y telefono deben estar presentes; uno puede estar vacío si el otro es válido.

`confirmarAnticipacion` es adicional y opcional.

PUT conserva cliente, ID, origen, creadoPor, estado y createdAt, cuando esos datos existen.

No se deben enviar campos protegidos en el cuerpo.

La actualización valida el documento completo antes de guardarlo.

### Estados y eliminación

Estados admitidos:

- nuevo
- pendiente
- confirmado
- entregado
- cancelado

Se permite cambiar entre cualquiera de ellos mediante PATCH.

DELETE elimina el documento. Utilizar `cancelado` si se necesita conservarlo.

`mis-pedidos` filtra por la cuenta cliente autenticada. Los presenciales sin cuenta no aparecen allí.

### Documentos antiguos

Pueden carecer de email, cliente, origen o creadoPor.

No se realizó una migración.

El controlador trata como web los documentos cuyo origen no sea presencial. No debe suponerse que todo documento sin cliente es presencial.

Más información en [PEDIDOS.md](./PEDIDOS.md).

## Usuarios

Todas las rutas requieren sesión administrativa activa.

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/usuarios | Crear admin. |
| GET | /api/usuarios | Listar admins. |
| GET | /api/usuarios/:id | Consultar admin. |
| PUT | /api/usuarios/:id | Actualizar admin. |
| DELETE | /api/usuarios/:id | Eliminar admin. |

El CRUD gestiona cuentas admin; las cuentas cliente quedan fuera.

Crear exige nombre, email y password. Se asignan `rol: admin` y `activo: true`.

Actualizar exige nombre, email y activo. Conserva contraseña y rol.

El backend impide que el administrador se elimine o desactive a sí mismo. Rechaza emails duplicados y campos desconocidos.

Las respuestas no incluyen contraseñas ni hashes.

### Pruebas

Yami documentó pruebas manuales de CRUD, validaciones, desactivación, reactivación y protección de la propia cuenta en [USUARIOS.md](./USUARIOS.md).

El 19/10/2026 también se comprobó el CRUD local desde Postman:

- Creación de una cuenta temporal.
- Consulta por ID: 200.
- Listado: 200.
- Respuestas sin passwordHash.
- Actualización: 200, conservando ID, rol, activo y createdAt.
- Eliminación: 200.
- Consulta posterior: 404, `Usuario no encontrado`.

La cuenta temporal fue eliminada.

Esta ronda de Postman no equivale a repetir todas las pruebas de seguridad documentadas por Yami ni a probar Usuarios en Render.

## Scripts

Ejecutar con la API funcionando, utilizando cuentas y registros de prueba.

| Comando | Alcance |
|---|---|
| node scripts/probarLogin.js | Login y token. |
| node scripts/probarAccesoAdmin.js | Crear y eliminar producto como admin. |
| node scripts/probarPutProducto.js | PUT de productos. |
| node scripts/probarPedidoAdmin.js | Estado inválido en pedido existente. |
| node scripts/probarCrudPedido.js | CRUD web con email. |
| node scripts/probarAccesoPedidosEmail.js | Separación de clientes y restricciones admin. |
| node scripts/probarPedidosPresenciales.js | Creación, edición y permisos presenciales. |

Revisar la URL configurada en cada script antes de ejecutarlo. Las ejecuciones documentadas de estos scripts se realizaron contra la API local.

Los scripts de CRUD web, acceso con email y presenciales ocultan las contraseñas.

El script independiente `probarPedidoAdmin.js` conserva la entrada visible de contraseña.

No compartir credenciales ni tokens.

## Pruebas locales de pedidos

### Esquemas y modelo presencial

Se comprobaron:

- Solo teléfono, solo email y ambos contactos.
- Contactos ausentes o vacíos rechazados.
- Email o teléfono inválidos rechazados.
- Cliente y origen enviados en el cuerpo rechazados.
- Normalización del email.
- La web continúa exigiendo email y rechazando telefono.
- PUT presencial exige todos sus campos.
- El modelo acepta teléfono sin email y rechaza ausencia de contacto.

Resultado:

```text
Validación presencial correcta: true
```

La prueba aislada no guardó documentos.

### Script de presenciales

```bash
node scripts/probarPedidosPresenciales.js
```

| Comprobación | Resultado |
|---|---|
| Sin sesión o con token cliente en creación admin | 401 |
| Sin contacto | 400 |
| Creador enviado en el cuerpo | 400 |
| Crear con teléfono y sin cuenta cliente | 201 |
| Origen y administrador creador | Correctos |
| Listado admin | Incluye el pedido |
| Mis-pedidos del cliente | No incluye el presencial |
| PUT incompleto o sin contacto | 400 sin cambios |
| PUT cambia teléfono por email | 200, email normalizado |
| Datos protegidos | Conservados |
| Torta para hoy sin confirmación | 400 |
| Torta para hoy confirmada | 201 |
| Fecha pasada confirmada | 400 |
| Limpieza | Pedidos eliminados y GET posterior 404 |

Resultado:

```text
Prueba de pedidos presenciales correcta: true
```

El script intenta limpiar los registros creados incluso si falla. Si la limpieza no se completa, informa los IDs.

### Regresión web después de presenciales

```bash
node scripts/probarCrudPedido.js
```

Comprobó:

- Creación como cliente: 201 y estado nuevo.
- Normalización de email en POST y PUT.
- Vínculo con cliente y consulta propia.
- Cambio de estado a pendiente.
- PUT incompleto: 400 sin cambios.
- PUT completo con email diferente.
- Conservación de cliente, ID, estado y createdAt.
- Cliente ve los datos actualizados.
- DELETE y consulta posterior 404.
- Pedido eliminado ausente en mis-pedidos.

Resultado:

```text
Prueba CRUD con email correcta: true
```

El pedido de prueba fue eliminado.

### Separación entre clientes

Antes de agregar presenciales, `probarAccesoPedidosEmail.js` comprobó:

- Dos clientes con pedidos utilizando el mismo email.
- Cada uno ve su pedido y no ve el ajeno.
- Admin ve ambos.
- Ambos clientes reciben 401 en las cinco rutas administrativas.
- Diez rechazos sin modificar el pedido comprobado.
- Estado inválido: 400 sin cambios.
- Limpieza de ambos pedidos.

Resultado:

```text
Prueba de acceso a pedidos con email correcta: true
```

Este script completo no se volvió a ejecutar después del cambio presencial.

### Email web

Se comprobaron seis casos para POST y seis para PUT.

Se aceptaron y normalizaron correos válidos, mayúsculas y espacios exteriores. Se rechazaron correos inválidos, espacios internos y texto vacío.

Resultado:

```text
Validación de email correcta: true
```

### Postman local

Se verificaron pedidos web con email:

- Creación autenticada: 201.
- Consulta propia y administrativa.
- PUT completo conservando los datos protegidos.
- Torta sin anticipación: 400.
- Cambio de estado: 200.
- DELETE: 200.
- Consulta posterior: 404.
- Mis-pedidos final: 200 con listado vacío.

También se verificaron presenciales:

- Creación con teléfono: 201.
- Consulta: 200.
- PUT cambia teléfono por email: 200.
- PUT sin contacto: 400.
- Consulta posterior al rechazo sin cambios.
- Torta para hoy sin confirmación: 400.
- Torta para hoy con confirmación: 201.
- Creación administrativa sin sesión o con token cliente: 401.
- Eliminación de los pedidos temporales: 200.
- Consultas posteriores: 404.

No se afirma una ejecución completa de todas las solicitudes de la colección.

## Pruebas en Render del 19/10/2026

Se realizaron solicitudes manuales contra:

```text
https://lara-backend-5tq4.onrender.com
```

### Acceso y consultas

| Caso | Resultado |
|---|---|
| Health | 200 y ok true. |
| Productos públicos | 200. |
| Login administrativo | 200. |
| Productos administrativos con sesión admin | 200. |
| Productos administrativos sin sesión | 401. |
| Login cliente | 200. |
| Mis-pedidos con sesión cliente | 200. |
| Productos administrativos con token cliente | 401. |

### Pedido web temporal

| Caso | Resultado |
|---|---|
| Creación autenticada | 201 y estado nuevo. |
| Mis-pedidos | Incluye el pedido y el vínculo con el cliente. |
| Consulta administrativa por ID | Documento correcto. |
| PATCH de estado | 200, estado pendiente. |
| PUT completo | 200, datos actualizados. |
| Conservación con PUT | Cliente, ID, origen, estado y createdAt. |
| DELETE | 200. |
| Consulta posterior por ID | 404. |
| Mis-pedidos final | 200 con listado vacío. |

El pedido temporal fue eliminado.

### Pedido presencial temporal

Se recibió una respuesta de creación correcta y se comprobó:

| Caso | Resultado |
|---|---|
| Creación con teléfono y sin email | Documento con origen presencial y creadoPor del admin. |
| Vínculo cliente | Sin cuenta cliente asociada. |
| Consulta administrativa | 200. |
| PUT cambia teléfono por email | 200. |
| Datos protegidos | ID, origen, creadoPor, estado y createdAt conservados. |
| DELETE | 200. |
| Consulta posterior | 404. |

El pedido temporal fue eliminado.

### Tiempos observados

Se observaron demoras de aproximadamente 42 y 52 segundos en solicitudes anteriores, además de un error de protocolo HTTP/2 en Postman. No se confirmó su causa.

En comprobaciones posteriores:

| Solicitud | Tiempo observado |
|---|---|
| Health | 189 ms. |
| Health repetido | 495 ms. |
| Productos públicos, con consulta a MongoDB | 335 ms. |

Son mediciones puntuales. No representan una prueba de carga ni garantizan esos tiempos para todas las solicitudes.

## Manejo de errores

Comprobaciones locales:

| Caso | Resultado |
|---|---|
| JSON mal formado | 400 con mensaje específico. |
| Cuerpo superior al límite de 100kb | 413 con mensaje específico. |
| Ruta inexistente | 404. |

Ejemplo de JSON mal formado:

```bash
curl --max-time 10 -i http://localhost:4000/api/clientes/login \
  -H "Content-Type: application/json" \
  --data-binary '{"email":'
```

Respuesta:

```json
{
  "message": "El JSON enviado no tiene un formato válido"
}
```

Ejemplo de cuerpo demasiado grande:

```bash
python3 -c 'import json; print(json.dumps({"email": "a" * 110000}))' \
  | curl --max-time 10 -i http://localhost:4000/api/clientes/login \
      -H "Content-Type: application/json" \
      --data-binary @-
```

Respuesta:

```json
{
  "message": "Los datos enviados superan el tamaño permitido"
}
```

Estas comprobaciones no crearon cuentas ni pedidos.

## Autenticación y límites

### Resultados locales verificados

| Caso | Resultado |
|---|---|
| Login admin con contraseña incorrecta | 401 |
| Login admin con email inexistente | 401 |
| Login cliente con contraseña incorrecta | 401 |
| Login cliente con email inexistente | 401 |
| Registro con email duplicado | 409 |
| Registro enviando rol | 400 |
| Registro enviando activo | 400 |
| Contraseña menor a 12 caracteres | 400 en password |
| Límite de registro | 429 |
| Límite de login cliente | 429 |
| Límite de login admin | 429 |
| Límite de creación web | 429 |
| Creación web después de terminar el bloqueo | Vuelve a responder 400 por el cuerpo vacío utilizado en la prueba. |

### Configuración

| Operación | Límite |
|---|---|
| Login admin | 10 intentos fallidos por IP en 15 minutos. |
| Registro cliente | 5 solicitudes por IP en 15 minutos. |
| Login cliente | 10 solicitudes por IP en 15 minutos, incluidos éxitos. |
| Crear pedido web | 10 solicitudes por IP en 15 minutos después de autenticar. |

La creación administrativa no utiliza el limitador de pedidos web.

En la prueba de creación web se enviaron cuerpos vacíos con sesión cliente válida. Las solicitudes fueron rechazadas por validación con 400 hasta observar el bloqueo con 429.

Después de la ventana de bloqueo, sin reiniciar el servidor durante la espera, la misma solicitud volvió a responder 400 por validación. No creó pedidos.

No se midieron todos los umbrales desde ventanas vacías.

Siguen pendientes:

- Recuperación después del bloqueo de registro y ambos logins.
- Verificación del rate limiting detrás del proxy de Render.
- Otros escenarios de autenticación que se definan expresamente.

Ejecutar pruebas de límites al final para evitar bloqueos durante las pruebas funcionales.

## Postman

Colección versionada:

[Descargar colección](./postman/Lara-Pasteleria-API.postman_collection.json)

La última versión contabilizada contiene:

| Grupo | Cantidad |
|---|---:|
| Autenticación administrativa y productos | 16 |
| Pedidos | 15 |
| Clientes y pedidos propios | 15 |
| Usuarios | 5 |
| Pedidos presenciales | 10 |
| Total | 61 |

Se conservaron las 51 solicitudes originales, incluida la carpeta Usuarios, y se agregaron diez solicitudes presenciales.

Durante las pruebas se utilizaron también solicitudes modificadas manualmente en Postman. Antes de la entrega debe revisarse la exportación final, incorporar las consultas administrativas de productos y volver a contar las solicitudes.

No contiene aserciones automatizadas. El script previo calcula fechas; no verifica resultados.

### Entornos

Se utilizaron entornos separados:

| Entorno | baseUrl |
|---|---|
| Lara Local | http://localhost:4000 |
| Lara Render | https://lara-backend-5tq4.onrender.com |

`baseUrl` no lleva `/api` al final porque las solicitudes agregan ese segmento.

### Variables

| Variable | Uso |
|---|---|
| baseUrl | Dirección de la API según el entorno. |
| adminEmail | Email admin de prueba. |
| adminPassword | Contraseña privada del admin. |
| token | Token admin. |
| clienteEmail | Email del primer cliente. |
| clientePassword | Contraseña privada del cliente. |
| clienteToken | Token del primer cliente. |
| cliente2Email | Email del segundo cliente. |
| cliente2Password | Contraseña privada del segundo cliente. |
| cliente2Token | Token del segundo cliente. |
| productoID | Producto de prueba. |
| pedidoID | Pedido web de prueba. |
| pedidoPresencialID | Pedido presencial de prueba. |
| usuarioId | Usuario admin de prueba. |
| passwordUsuarioPrueba | Contraseña privada de ese usuario. |

Respetar mayúsculas y minúsculas.

Guardar los tokens sin comillas ni prefijo Bearer. Las solicitudes agregan el prefijo.

No exportar entornos con credenciales ni tokens reales. No guardar respuestas de login con tokens reales dentro de la colección compartida.

### Fechas automáticas

Se calculan según Buenos Aires:

| Variable | Valor |
|---|---|
| fechaPedido | Hoy más 30 días. |
| fechaSinAnticipacion | Hoy. |

Las fechas fijas utilizadas en pruebas anteriores no deben reutilizarse sin revisar la anticipación.

### Orden y limpieza

- Iniciar sesión y actualizar el token correspondiente.
- Crear únicamente registros de prueba identificables.
- Guardar sus IDs en las variables correspondientes.
- Ejecutar consultas, modificaciones y rechazos.
- Comprobar que los rechazos no alteraron los registros.
- Eliminar los registros temporales.
- Verificar 404 y ausencia en los listados correspondientes.

No ejecutar toda la colección sin revisar el orden y los registros afectados.

## Coordinación con el frontend

Para el panel de productos:

- Listado completo: GET /api/productos/admin.
- Consulta por ID: GET /api/productos/admin/:id.
- Ambas consultas requieren token admin.
- Las escrituras conservan /api/productos y /api/productos/:id.
- El catálogo público solo muestra disponibles.

Para pedidos presenciales:

- POST /api/pedidos/admin con token admin.
- Al menos email o telefono.
- Confirmación explícita para aceptar menos anticipación.
- ID de creación en pedido._id.
- PUT con ocho campos completos y confirmación cuando corresponda.
- Mostrar teléfono cuando no haya email.
- No asumir que todos los pedidos tienen cuenta cliente.
- Cambiar estado mediante PATCH.
- No enviar campos protegidos mediante POST o PUT.

El flujo web conserva sus campos y autenticación actuales.

La conexión completa de las pantallas publicadas debe comprobarse junto con Yami.

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
| models | Documentos. |
| routes | Rutas, métodos y permisos. |
| schemas | Validación Zod. |
| services | Operaciones y lógica. |
| utils | Utilidades compartidas. |

## Trabajo en equipo

Trabajar en ramas separadas y coordinar los cambios de campos y rutas.

Desde una copia sin cambios pendientes:

```bash
git switch main
git pull --ff-only
git switch -c feat/nombre-de-la-tarea
```

Revisar cambios, crear commit, subir la rama y abrir PR hacia main.

Integraciones confirmadas:

| PR | Cambio | Commit de merge |
|---|---|---|
| #16 | Pedidos con email y pruebas. | 804fb8f |
| #17 | Pruebas locales de preparación para deploy. | 56db427 |
| #18 | Pedidos presenciales desde administración. | e58d5db |
| #19 | Filtro público de productos y consultas administrativas. | e3a4f25 |
| #20 | Configuración de CORS y proxy para Render. | 92a364c |

## Pendientes

- Confirmar la configuración de VITE_API_URL con Yami.
- Probar los flujos desde el frontend publicado.
- Verificar el rate limiting detrás del proxy de Render.
- Comprobar la recuperación después del bloqueo de registro y ambos logins.
- Revisar y exportar la colección final de Postman.
- Conservar las carpetas Usuarios y Pedidos presenciales al exportar.
- Incorporar las consultas administrativas de productos a la colección.
- Actualizar PEDIDOS.md y registrar la verificación local de Usuarios.
- Completar y comprobar las pantallas del frontend con Yami.
- Revisar la documentación final y los archivos de entrega.

Las pruebas locales, las pruebas manuales en Render y la integración desde el frontend se documentan por separado. Un resultado anterior no prueba automáticamente un cambio posterior.