# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye CRUD de productos, pedidos y usuarios, validación de datos y autenticación de administradores y clientes.

Admite consultas web de clientes y pedidos presenciales cargados por administradores.

La integración del formulario y del panel está a cargo de Yami en `lara-pasteleria`, rama `feat/panel-administrativo`. La finalización del frontend no se verificó en esta ronda de backend.

## Repositorios

| Proyecto | Uso |
|---|---|
| [lara-backend](https://github.com/sofiimendo/lara-backend) | API actual. |
| [lara-pasteleria](https://github.com/sofiimendo/lara-pasteleria) | Landing y panel en React. |
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

### Clonar

```bash
git clone https://github.com/sofiimendo/lara-backend.git
cd lara-backend
```

### Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

Se necesita una versión de Node.js compatible con las dependencias y con fetch.

Entorno local observado el 19/10/2026:

| Herramienta | Versión |
|---|---|
| Node.js | 26.3.0 |
| pnpm | 11.17.0 |

La disponibilidad de estas versiones en el hosting todavía debe confirmarse.

### Configurar el entorno

Copiar `.env.example` como `.env` y completar los valores localmente.

| Variable | Uso |
|---|---|
| PORT | Puerto HTTP; localmente 4000. |
| MONGODB_URI | Conexión a MongoDB Atlas. |
| FRONTEND_URL | Origen del frontend. |
| JWT_SECRET | Secreto para JWT; al menos 32 caracteres. |

Cada integrante configura su propio entorno.

No subir credenciales, secretos ni tokens al repositorio. Reiniciar el servidor después de modificar variables.

En Atlas, verificar los permisos del usuario y habilitar el acceso de red correspondiente.

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

Start ejecuta node server.js. Los cambios requieren reinicio manual cuando se usa este comando.

Mensajes esperados:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

## Health

```text
GET http://localhost:4000/api/health
```

Respuesta: HTTP 200.

```json
{
  "ok": true,
  "message": "API de Lara Pastelería funcionando"
}
```

La raíz no tiene ruta definida y responde 404.

## CORS y comprobaciones locales para deploy

La configuración actual permite:

- http://localhost:5173.
- El valor de FRONTEND_URL.
- Si FRONTEND_URL no está definido, utiliza https://lara-pasteleria.vercel.app como alternativa.

La URL alternativa en el código no demuestra que sea la dirección definitiva del frontend.

### Resultados verificados el 19/10/2026

| Comprobación | Resultado |
|---|---|
| Inicio con pnpm start | MongoDB conectado e inicio HTTP correcto. |
| Health después de iniciar con start | 200 y ok true. |
| Preflight desde localhost:5173 | 204 con Access-Control-Allow-Origin correspondiente. |
| Método POST | Permitido en el preflight. |
| Encabezados authorization y content-type | Permitidos en el preflight. |
| Preflight desde origen ajeno | 204 sin Access-Control-Allow-Origin. |
| JSON mal formado en login cliente | 400 con mensaje específico. |
| JSON superior al límite de 100kb | 413 con mensaje específico. |

Son comprobaciones locales. No prueban todavía la integración en navegador ni el hosting publicado.

CORS no sustituye la autenticación ni bloquea por sí solo solicitudes con curl u otros clientes.

### Preflight permitido

```bash
curl --max-time 10 -i -X OPTIONS http://localhost:4000/api/pedidos \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

### Preflight de origen no permitido

```bash
curl --max-time 10 -i -X OPTIONS http://localhost:4000/api/pedidos \
  -H "Origin: https://origen-no-permitido.example" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Se observó 204 sin Access-Control-Allow-Origin. El código 204 por sí solo no indica permiso de origen.

### JSON mal formado

```bash
curl --max-time 10 -i http://localhost:4000/api/clientes/login \
  -H "Content-Type: application/json" \
  --data-binary '{"email":'
```

Respuesta verificada: HTTP 400.

```json
{
  "message": "El JSON enviado no tiene un formato válido"
}
```

### Cuerpo demasiado grande

```bash
python3 -c 'import json; print(json.dumps({"email": "a" * 110000}))' \
  | curl --max-time 10 -i http://localhost:4000/api/clientes/login \
      -H "Content-Type: application/json" \
      --data-binary @-
```

Respuesta verificada: HTTP 413.

```json
{
  "message": "Los datos enviados superan el tamaño permitido"
}
```

Estas pruebas no crearon cuentas ni pedidos.

Las comprobaciones se documentaron mediante el PR #17, integrado en main con commit 56db427. No se modificó la configuración para publicarla en esa ronda.

Falta confirmar hosting, URLs, variables y proxy.

## Administrador inicial

No existe registro público de administradores.

```bash
node scripts/crearAdmin.js
```

El script utiliza ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD configurados localmente.

La contraseña requiere al menos 12 caracteres y como máximo 72 bytes UTF-8.

Se guarda un hash bcrypt. Si el email existe, no se reemplaza la cuenta.

Después de crearla, retirar las variables temporales ADMIN_* del entorno.

Las cuentas adicionales se gestionan con el módulo Usuarios.

No existe recuperación de contraseña ni envío automático de correos.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/auth/login | Login administrativo. |
| POST | /api/clientes/registro | Registro cliente. |
| POST | /api/clientes/login | Login cliente. |

El registro exige nombre, email y password. Asigna rol cliente y activo true.

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

Un token cliente en una ruta administrativa responde 401 por audiencia. No constituye una prueba de token vencido.

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

POST exige nombre y precio. PUT exige los seis campos y conserva ID y fecha de creación. PATCH exige al menos un campo editable.

El precio debe ser mayor o igual a cero. Se rechazan campos desconocidos.

Crear responde 201. Las otras operaciones exitosas responden 200.

ID inválido: 400. Producto inexistente: 404.

El listado público incluye productos no disponibles. El filtrado del catálogo sigue pendiente y debe coordinarse con el listado administrativo.

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

El backend toma cliente de la sesión y asigna origen web y estado nuevo.

Email se normaliza quitando espacios exteriores y convirtiendo a minúsculas.

POST devuelve 201, mensaje y pedido con id y estado.

La ruta web no admite telefono ni confirmarAnticipacion.

### Pedidos presenciales

POST /api/pedidos/admin exige sesión admin.

No requiere cuenta cliente ni crea una cuenta ficticia.

Exige nombre, fecha, pedido y al menos un contacto válido: email o telefono.

TipoEvento, cantidadPersonas y detalles son opcionales al crear.

Email o telefono pueden omitirse individualmente; se normalizan a texto vacío. Si se completan ambos, ambos deben ser válidos.

El teléfono admite entre 8 y 15 dígitos, un máximo de 25 caracteres, espacios, guiones, paréntesis y + inicial. No verifica existencia ni disponibilidad de WhatsApp.

El backend asigna:

- origen presencial.
- creadoPor con el ID del administrador.
- estado nuevo.
- Sin cliente vinculado.

Responde 201 con el mensaje Pedido presencial creado correctamente y el documento completo. Su ID se obtiene de pedido._id.

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

En presenciales, un admin puede aceptar menos de cinco días enviando confirmarAnticipacion true después de una confirmación explícita en el panel.

Las fechas pasadas se rechazan incluso con esa confirmación.

La excepción se aplica a creación y edición presencial. El indicador no se guarda ni genera historial de excepciones.

### Edición

PUT selecciona el esquema según el origen guardado.

| Origen | Cuerpo completo de PUT |
|---|---|
| Web | nombre, email, fecha, tipoEvento, pedido, cantidadPersonas y detalles. |
| Presencial | Los siete campos anteriores más telefono. |

En presencial, email y telefono deben estar presentes; uno puede estar vacío si el otro es válido.

ConfirmarAnticipacion es adicional y opcional, escrito exactamente como `confirmarAnticipacion`.

PUT conserva cliente, ID, origen, creadoPor, estado y createdAt, cuando esos datos existen.

No se deben enviar campos protegidos en el cuerpo.

La actualización valida el documento completo antes de guardarlo.

### Estados y eliminación

Estados: nuevo, pendiente, confirmado, entregado y cancelado.

Se permite cambiar entre cualquiera de ellos mediante PATCH.

DELETE elimina el documento. Usar cancelado si se necesita conservar el historial.

Mis-pedidos filtra por la cuenta cliente autenticada. Los presenciales sin cuenta no aparecen allí.

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

Crear exige nombre, email y password. Se asignan rol admin y activo true.

Actualizar exige nombre, email y activo. Conserva contraseña y rol.

El backend impide que el administrador se elimine o desactive a sí mismo. Rechaza emails duplicados y campos desconocidos.

Las respuestas no incluyen contraseñas ni hashes.

Yami documentó pruebas manuales. La verificación de Usuarios en Postman sigue pendiente.

Más información en [USUARIOS.md](./USUARIOS.md).

## Scripts

Ejecutar con la API funcionando, usando cuentas y registros de prueba.

| Comando | Alcance |
|---|---|
| node scripts/probarLogin.js | Login y token. |
| node scripts/probarAccesoAdmin.js | Crear y eliminar producto como admin. |
| node scripts/probarPutProducto.js | PUT de productos. |
| node scripts/probarPedidoAdmin.js | Estado inválido en pedido existente. |
| node scripts/probarCrudPedido.js | CRUD web con email. |
| node scripts/probarAccesoPedidosEmail.js | Separación de clientes y restricciones admin. |
| node scripts/probarPedidosPresenciales.js | Creación, edición y permisos presenciales. |

Los scripts de CRUD web, acceso con email y presenciales ocultan las contraseñas.

El script independiente probarPedidoAdmin.js conserva la entrada visible de contraseña.

No compartir credenciales ni tokens.

### Presenciales: verificados el 19/10/2026

Se ejecutaron comprobaciones aisladas de esquemas y modelo:

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

Después se ejecutó:

```bash
node scripts/probarPedidosPresenciales.js
```

| Comprobación por API | Resultado |
|---|---|
| Sin sesión o con token cliente en creación admin | 401 |
| Sin contacto | 400 |
| Creador enviado en el cuerpo | 400 |
| Crear con teléfono y sin cuenta cliente | 201 |
| Origen y administrador creador | Correctos |
| Listado admin | Incluye el pedido |
| Mis-pedidos del cliente de prueba | No incluye el presencial |
| PUT incompleto o sin contacto | 400 sin cambios |
| PUT cambia teléfono por email | 200, email normalizado |
| Datos protegidos | ID, origen, creadoPor, estado y createdAt conservados |
| Torta para hoy sin confirmación | 400 |
| Torta para hoy confirmada | 201 |
| Fecha pasada confirmada | 400 |
| Limpieza | Ambos pedidos eliminados y GET posterior 404 |

Resultado:

```text
Prueba de pedidos presenciales correcta: true
```

El script intenta limpiar los registros creados incluso si falla. Si la limpieza no se completa, informa los IDs.

### Regresión web después de presenciales

Se volvió a ejecutar:

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

### Separación entre clientes: ronda previa

Antes de agregar presenciales, probarAccesoPedidosEmail.js comprobó:

- Dos clientes con pedidos usando el mismo email.
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

### Validación aislada de email web

Se comprobaron seis casos para POST y seis para PUT.

Se aceptaron y normalizaron correos válidos, mayúsculas y espacios exteriores. Se rechazaron correos inválidos, espacios internos y texto vacío.

Resultado:

```text
Validación de email correcta: true
```

### Antecedentes

Antes del cambio a email se verificaron CRUD de productos, autenticación de clientes, pedidos propios, separación de clientes, permisos, PUT conservando datos y DELETE seguido de 404.

El script independiente probarPedidoAdmin.js obtuvo:

```text
Validación correcta: true
```

No se volvió a ejecutar ese script independiente en estas rondas.

Los antecedentes no prueban por sí solos cambios posteriores.

## Postman

Colección:

[Descargar colección](./postman/Lara-Pasteleria-API.postman_collection.json)

| Grupo | Cantidad |
|---|---:|
| Autenticación administrativa y productos | 16 |
| Pedidos | 15 |
| Clientes y pedidos propios | 15 |
| Usuarios | 5 |
| Pedidos presenciales | 10 |
| Total | 61 |

Se conservaron las 51 solicitudes originales, incluida Usuarios.

Las diez solicitudes presenciales fueron agregadas. Su importación y ejecución manual todavía deben comprobarse.

No contiene aserciones automatizadas. El script previo calcula fechas, no verifica resultados.

### Variables

| Variable | Uso |
|---|---|
| baseUrl | http://localhost:4000 |
| adminEmail | Email admin de prueba. |
| adminPassword | Contraseña admin local. |
| token | Token admin. |
| clienteEmail | Email del primer cliente. |
| clientePassword | Contraseña local del cliente. |
| clienteToken | Token del primer cliente. |
| cliente2Email | Email del segundo cliente. |
| cliente2Password | Contraseña local del segundo cliente. |
| cliente2Token | Token del segundo cliente. |
| productoID | Producto de prueba. |
| pedidoID | Pedido web de prueba. |
| pedidoPresencialID | Pedido presencial de prueba. |
| usuarioId | Usuario admin de prueba. |
| passwordUsuarioPrueba | Contraseña local para ese usuario. |

Respetar mayúsculas y minúsculas.

Guardar tokens sin comillas ni prefijo Bearer. Las solicitudes agregan el prefijo.

No exportar el entorno con credenciales ni tokens reales.

### Fechas automáticas

Se calculan según Buenos Aires:

| Variable | Valor |
|---|---|
| fechaPedido | Hoy más 30 días. |
| fechaSinAnticipacion | Hoy. |

No hace falta definirlas manualmente.

### Flujo presencial propuesto

1. Login admin y actualizar token.
2. Crear presencial con teléfono.
3. Guardar pedido._id en pedidoPresencialID.
4. Consultar y verificar el documento.
5. Ejecutar rechazos y comprobar que no cambió.
6. Actualizar con email y teléfono vacío.
7. Verificar normalización y datos conservados.
8. Eliminar y consultar nuevamente: 404.
9. Probar por separado el pedido para hoy confirmado.
10. Actualizar pedidoPresencialID con el nuevo ID.
11. Eliminar también ese pedido y comprobar el 404.

No ejecutar toda la colección sin revisar el orden y los registros afectados.

### Resultados web anteriores en Postman

El 19/10/2026, antes de incorporar presenciales, se verificaron:

| Caso | Resultado |
|---|---|
| Login cliente y admin | 200 |
| Crear pedido con email | 201 y estado nuevo |
| Mis-pedidos | 200, email y vínculo correctos |
| Fecha automática válida | 2026-11-18 |
| PUT administrativo | 200 |
| Conservación | ID, cliente, estado nuevo y createdAt |
| Torta sin anticipación | 400 |
| Cambiar estado | 200, pendiente |
| DELETE | 200 |
| Consulta posterior por ID | 404 |
| Mis-pedidos final | 200, listado vacío |

El PUT manual mantuvo el mismo email; su modificación y normalización se comprobaron por script.

El pedido fue eliminado.

No implica una nueva ejecución de las 61 solicitudes.

### Usuarios en Postman

Las cinco solicitudes de Yami se conservan. Su verificación sigue pendiente.

Flujo propuesto:

1. Login admin y actualizar token.
2. Configurar passwordUsuarioPrueba.
3. Crear usuario y guardar usuarioId.
4. Listar y consultar por ID.
5. Actualizar y verificar los datos conservados.
6. Eliminar usando otra cuenta admin.
7. Consultar nuevamente: 404.

Seguir las validaciones de USUARIOS.md.

## Autenticación y límites: resultados previos

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
| Límite de registro | 429 |
| Límite de login cliente | 429 |
| Límite de login admin | 429 |

Son comprobaciones anteriores a la ronda de pedidos presenciales.

### Configuración

| Operación | Límite |
|---|---|
| Login admin | 10 intentos fallidos por IP en 15 minutos. |
| Registro cliente | 5 solicitudes por IP en 15 minutos. |
| Login cliente | 10 solicitudes por IP en 15 minutos, incluidos éxitos. |
| Crear pedido web | 10 solicitudes por IP en 15 minutos después de autenticar. |

La creación administrativa no utiliza el limitador de pedidos web.

Se observaron respuestas 429 en registro y login, pero no se midió el umbral exacto desde una ventana vacía.

Siguen pendientes el límite de creación web, la recuperación después de bloqueos y otros escenarios concretos de autenticación.

Ejecutar pruebas de límites al final para evitar bloqueos durante las pruebas funcionales.

## Coordinación con el frontend

Yami trabaja en lara-pasteleria.

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

La conexión y edición desde el panel todavía deben probarse.

El flujo web conserva sus campos y autenticación actuales.

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
| config | MongoDB. |
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

- PR #16: pedidos con email, commit de merge 804fb8f.
- PR #17: documentación de pruebas locales para deploy, commit 56db427.

Pedidos presenciales se está preparando en feat/pedidos-presenciales. No se presenta como integrado hasta completar su PR.

## Pendientes

- Importar y comprobar la colección actualizada de 61 solicitudes.
- Revisar e integrar pedidos presenciales mediante PR.
- Conectar y probar el formulario presencial del panel.
- Verificar Usuarios en Postman.
- Completar escenarios pendientes de autenticación.
- Verificar límite de creación web y recuperación después de bloqueos.
- Resolver filtrado de productos no disponibles coordinando el panel.
- Conservar Usuarios y la colección completa al exportar.
- Completar las pantallas del frontend con Yami.
- Confirmar hosting y URLs definitivas.
- Confirmar versiones de Node.js y pnpm en hosting.
- Configurar variables, CORS definitivo, Atlas y proxy.
- Desplegar y probar la integración publicada.
- Documentar URLs y resultados finales.