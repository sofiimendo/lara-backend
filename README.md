# Lara Backend

API de Lara Pastelería, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar, con revisión del backend a cargo de Veronica Teresa Lopez Fernandez.

Incluye administración de productos, pedidos y usuarios, autenticación de administradores y clientes, validaciones y carga de imágenes con Cloudinary.

Admite consultas web de clientes registrados y pedidos presenciales cargados por administradores. No incluye carrito ni pagos.

## Proyectos publicados

| Proyecto | URL |
|---|---|
| Backend en Render | https://lara-backend-5tq4.onrender.com |
| Health del backend | https://lara-backend-5tq4.onrender.com/api/health |
| Frontend en Vercel | https://lara-pasteleria.vercel.app |
| Login compartido | https://lara-pasteleria.vercel.app/login |
| Registro de clientes | https://lara-pasteleria.vercel.app/registro |
| Mis pedidos, requiere sesión cliente | https://lara-pasteleria.vercel.app/mis-pedidos |
| Login exclusivo de administradores | https://lara-pasteleria.vercel.app/admin/login |

Se comprobó la comunicación entre el frontend publicado y la API mediante autenticación, gestión de productos con imágenes, pedidos, usuarios y consulta de pedidos propios.

Las pruebas realizadas se detallan más adelante. No equivalen a una prueba exhaustiva de todos los escenarios posibles.

## Repositorios y documentación

| Recurso | Enlace |
|---|---|
| Backend | https://github.com/sofiimendo/lara-backend |
| Frontend | https://github.com/sofiimendo/lara-pasteleria |
| Documentación de pedidos | [PEDIDOS.md](./PEDIDOS.md) |
| Documentación de usuarios | [USUARIOS.md](./USUARIOS.md) |
| Colección de Postman | [Lara Pastelería API](./postman/Lara-Pasteleria-API.postman_collection.json) |

El repositorio anterior `lara-stock` no forma parte de esta integración.

## Tecnologías

- Node.js y pnpm.
- Express.
- MongoDB Atlas y Mongoose.
- Zod 4.
- bcryptjs y jsonwebtoken.
- express-rate-limit.
- cors y dotenv.
- Multer.
- Cloudinary.
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

Entorno local observado durante las pruebas:

| Herramienta | Versión |
|---|---|
| Node.js | 26.3.0 |
| pnpm | 11.17.0 |

Si pnpm se administra mediante Corepack, se puede utilizar `corepack pnpm` en los comandos. Si pnpm está instalado directamente, se utiliza `pnpm`.

### Configurar el entorno

Crear el archivo `.env` local tomando `.env.example` como referencia.

| Variable | Uso |
|---|---|
| PORT | Puerto HTTP; localmente 4000. |
| MONGODB_URI | Conexión privada a MongoDB Atlas. |
| FRONTEND_URL | Origen permitido del frontend, sin rutas. |
| JWT_SECRET | Secreto para JWT de al menos 32 caracteres. |
| CLOUDINARY_CLOUD_NAME | Nombre de la cuenta de Cloudinary utilizada. |
| CLOUDINARY_API_KEY | Clave de API de Cloudinary. |
| CLOUDINARY_API_SECRET | Secreto de API de Cloudinary. |

Las tres variables de Cloudinary son necesarias para subir imágenes.

Cada integrante configura su propio entorno. Las variables configuradas en Render no se copian automáticamente al entorno local.

No subir `.env`, credenciales, secretos ni tokens al repositorio. Reiniciar el servidor después de modificar variables.

En MongoDB Atlas deben estar configurados el usuario de base de datos y el acceso de red correspondiente.

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

El frontend y el backend se ejecutan en terminales separadas.

Si el frontend local apunta a `http://localhost:4000`, la API local debe permanecer encendida. Iniciar Vite no inicia el backend.

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

La raíz de la API no tiene una ruta definida y responde 404.

Health comprueba que el servidor HTTP responde. No ejecuta una consulta a MongoDB en cada solicitud ni verifica todos los flujos de la aplicación.

Se configuró UptimeRobot para consultar este endpoint.

## Despliegue en Render

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
| CLOUDINARY_CLOUD_NAME | Valor configurado en Render. |
| CLOUDINARY_API_KEY | Valor privado configurado en Render. |
| CLOUDINARY_API_SECRET | Valor privado configurado en Render. |
| PORT | Puerto proporcionado por Render. |
| RENDER | Variable de la plataforma utilizada para activar la configuración del proxy. |

No se incluyen credenciales ni secretos en esta documentación.

MongoDB Atlas tiene habilitado el acceso de red correspondiente al servicio. Se comprobó que el despliegue conecta a MongoDB e inicia la API.

### Proxy

Cuando `RENDER` es `true`, Express configura:

```text
trust proxy = 1
```

La comprobación específica del rate limiting detrás del proxy de Render sigue pendiente. Las pruebas locales de límites no prueban su comportamiento en producción.

### Conexión con el frontend

En Render:

```text
FRONTEND_URL=https://lara-pasteleria.vercel.app
```

En Vercel:

```text
VITE_API_URL=https://lara-backend-5tq4.onrender.com
```

`VITE_API_URL` no lleva `/api` al final porque el frontend agrega ese segmento al construir las solicitudes.

Modificar una variable de Vite requiere volver a compilar y desplegar el frontend.

En desarrollo, el frontend utiliza `http://localhost:4000` cuando no tiene configurada `VITE_API_URL`.

El frontend dispone de una configuración de reescritura en Vercel para abrir directamente y recargar las rutas de React.

### Funcionamiento independiente de la computadora de desarrollo

La versión publicada utiliza Vercel, Render, MongoDB Atlas y Cloudinary.

El backend publicado se ejecuta en Render y establece su propia conexión a MongoDB Atlas. No utiliza el proceso de Node.js iniciado en la computadora de desarrollo.

Se comprobó el funcionamiento de la web publicada con los servidores locales apagados.

Las direcciones `localhost` corresponden únicamente al desarrollo local.

La disponibilidad sostenida del servicio y la elección del alojamiento para el uso cotidiano de Lara deben evaluarse por separado.

## CORS

La configuración permite:

- `http://localhost:5173`.
- El origen configurado en `FRONTEND_URL`, si existe.

Se quitan espacios exteriores y barras finales de `FRONTEND_URL`.

No se utiliza una URL pública alternativa cuando la variable está ausente.

CORS no sustituye la autenticación ni impide por sí solo solicitudes realizadas con curl o Postman.

### Pruebas de preflight

| Comprobación | Resultado |
|---|---|
| Origen local permitido | 204 con Access-Control-Allow-Origin correspondiente. |
| Origen de Vercel permitido en Render | 204 con Access-Control-Allow-Origin correspondiente. |
| Método POST | Permitido en el preflight. |
| Encabezados authorization y content-type | Permitidos en el preflight. |
| Origen ajeno | 204 sin Access-Control-Allow-Origin. |

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

Además del preflight, se realizaron pruebas funcionales desde el frontend publicado.

## Administrador inicial

No existe registro público de administradores.

```bash
node scripts/crearAdmin.js
```

El script utiliza `ADMIN_NOMBRE`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados localmente.

La contraseña requiere al menos 8 caracteres y como máximo 72 bytes UTF-8.

Se guarda un hash bcrypt con costo 12. Si el email existe, no se reemplaza la cuenta.

Después de crearla, retirar las variables temporales `ADMIN_*` del entorno.

Las cuentas administrativas adicionales se gestionan mediante Usuarios.

No existe recuperación de contraseña ni envío automático de correos.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/auth/login | Login exclusivo de administradores. |
| POST | /api/auth/login-unificado | Login de clientes y administradores. |
| POST | /api/clientes/registro | Registro de cliente. |
| POST | /api/clientes/login | Login exclusivo de clientes. |

El registro de clientes exige nombre, email y password. Asigna `rol: cliente` y `activo: true`.

Las contraseñas de creación se guardan como hashes bcrypt y requieren al menos 8 caracteres y un máximo de 72 bytes UTF-8.

Los emails se normalizan a minúsculas y sin espacios exteriores.

### Login compartido

```text
POST /api/auth/login-unificado
```

Cuerpo:

```json
{
  "email": "cuenta@example.com",
  "password": "CONTRASEÑA_DE_LA_CUENTA"
}
```

El servicio busca la cuenta, comprueba que esté activa, valida la contraseña y genera el token según su rol.

No se acepta un rol enviado por el cliente para decidir los permisos.

Respuesta exitosa: HTTP 200.

```json
{
  "message": "Sesión iniciada correctamente",
  "token": "TOKEN_JWT",
  "usuario": {
    "id": "ID_DE_LA_CUENTA",
    "nombre": "Nombre de la cuenta",
    "email": "cuenta@example.com",
    "rol": "cliente"
  }
}
```

Para una cuenta administrativa, `usuario.rol` es `admin` y el token tiene audiencia administrativa.

Credenciales incorrectas, cuenta inexistente o inactiva: HTTP 401 con el mensaje:

```text
Email o contraseña incorrectos
```

La respuesta no informa cuál de esas condiciones produjo el rechazo.

### Compatibilidad con los accesos exclusivos

- `/api/auth/login` continúa admitiendo únicamente cuentas admin activas y devuelve `{ message, token, usuario }`.
- `/api/clientes/login` continúa admitiendo únicamente cuentas cliente activas y devuelve `{ message, token, cliente }`.
- `/api/auth/login-unificado` admite ambos roles y devuelve `{ message, token, usuario }`.

El frontend utiliza el login compartido desde `/login` y conserva el acceso exclusivo administrativo desde `/admin/login`.

### Tokens y permisos

Los tokens duran una hora.

| Sesión | Audiencia |
|---|---|
| Administrador | lara-admin |
| Cliente | lara-cliente |

Se firman con HS256 y emisor `lara-backend`.

Las rutas protegidas reciben:

```text
Authorization: Bearer TOKEN
```

Se verifican firma, vencimiento, audiencia, identificador de cuenta, cuenta activa y rol.

Un token cliente en una ruta administrativa responde 401 por la separación de audiencias.

El mensaje `Token inválido o vencido` también puede aparecer cuando el token pertenece a una audiencia distinta. Por sí solo, el mensaje no demuestra que el token haya vencido.

El frontend guarda la sesión en `sessionStorage`, por pestaña y origen. Esa elección del frontend no reemplaza la validación de permisos del backend.

### Cambio del mínimo de contraseña a 8 caracteres

El 21/10/2026 se actualizaron los esquemas de registro de clientes y creación de usuarios, y la validación de `scripts/crearAdmin.js`.

El mínimo es de 8 caracteres y el máximo continúa siendo de 72 bytes UTF-8.

El costo de bcrypt sigue siendo 12. Las contraseñas existentes no se modifican.

Se ejecutaron pruebas aisladas de ambos esquemas, sin conexión a MongoDB ni creación de cuentas:

| Entrada | Resultado en Clientes y Usuarios |
|---|---|
| 7 caracteres ASCII | Rechazada. |
| 8 caracteres ASCII | Aceptada. |
| 72 bytes ASCII | Aceptada. |
| 73 bytes ASCII | Rechazada. |
| 36 letras á, equivalentes a 72 bytes | Aceptada. |
| 37 letras á, equivalentes a 74 bytes | Rechazada. |

Resultado:

```text
Validación de contraseñas correcta
```

El 23/10/2026 se ajustaron los dos campos y el mensaje del registro de clientes del frontend al mínimo de 8 caracteres.

Se comprobó el registro local con una contraseña de ocho caracteres y el inicio de sesión de esa cuenta. También se comprobó su acceso desde la web publicada.

El formulario de creación de administradores todavía exige 12 caracteres. Su ajuste sigue pendiente.

El script de creación del administrador inicial no se ejecutó durante las pruebas aisladas de esquemas.

## Productos

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| GET | /api/productos | Listar disponibles. | Público |
| GET | /api/productos/admin | Listar todos. | Admin |
| GET | /api/productos/admin/:id | Consultar cualquier producto por ID. | Admin |
| GET | /api/productos/:id | Consultar un producto disponible. | Público |
| POST | /api/productos/imagen | Subir una imagen a Cloudinary. | Admin |
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

Crear responde 201. Las otras operaciones exitosas del CRUD responden 200.

ID inválido: 400. Producto inexistente: 404.

### Disponibilidad

Las consultas públicas solo muestran productos con `disponible: true`.

Un producto no disponible responde 404 en la consulta pública por ID, aunque exista en la base de datos.

El panel utiliza las consultas administrativas para visualizar también los no disponibles.

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

## Imágenes de productos

### Endpoint

```text
POST /api/productos/imagen
```

Requiere un token de administrador activo.

El cuerpo debe enviarse como `multipart/form-data`:

| Campo | Tipo | Requisito |
|---|---|---|
| imagen | Archivo | Una imagen JPG, PNG o WebP de hasta 5 MB. |

En Postman, seleccionar Body → form-data, escribir `imagen` como key y elegir el tipo File.

Al utilizar FormData o Postman, dejar que la herramienta genere el encabezado Content-Type y su boundary.

### Validación y almacenamiento

- Multer recibe el archivo en memoria.
- Se admite un archivo por solicitud.
- El límite es de 5 × 1024 × 1024 bytes.
- Se valida el tipo MIME permitido.
- El servicio comprueba las firmas de JPG, PNG y WebP.
- Cloudinary recibe la imagen en la carpeta `lara-pasteleria/productos`.
- Se solicita limitar sus dimensiones a 1200 × 1200 y aplicar calidad y formato automáticos.

La comprobación de firma complementa el filtro MIME; no equivale a analizar exhaustivamente todo el contenido del archivo.

### Respuesta exitosa

HTTP 201:

```json
{
  "message": "Imagen subida correctamente",
  "imagen": {
    "url": "URL_HTTPS_DEVUELTA_POR_CLOUDINARY",
    "publicId": "IDENTIFICADOR_DEVUELTO_POR_CLOUDINARY"
  }
}
```

Subir la imagen no crea ni modifica un producto.

El frontend utiliza `imagen.url` como valor del campo `imagen` al crear o editar el producto.

### Errores controlados

| Caso | Código |
|---|---|
| Sin archivo | 400 |
| Formato MIME no permitido | 400 |
| Firma incompatible con el formato declarado | 400 |
| Más de un archivo | 400 |
| Campo de archivo inesperado | 400 |
| Archivo mayor al límite | 413 |
| Sin autenticación | 401 |
| Token de cliente en la ruta administrativa | 401 |
| Error interno inesperado | 500 |

Los errores de configuración o del proveedor se diagnostican desde el servidor. No se deben exponer secretos en las respuestas ni en los registros compartidos.

### Pruebas confirmadas en Render

| Comprobación | Resultado |
|---|---|
| Subida válida con sesión administrativa | 201. |
| Crear producto con URL de Cloudinary | 201. |
| Consulta pública del producto | Incluye la URL guardada. |
| Eliminar el producto temporal | 200. |
| Solicitud sin archivo | 400: Seleccioná una imagen para subir. |
| Imagen superior a 5 MB | 413: La imagen no puede superar los 5 MB. |
| Archivo README.md enviado como imagen | 400: Formato no permitido. |
| Solicitud sin sesión | 401: Debés iniciar sesión para continuar. |
| Solicitud con token vigente de cliente | 401: Token inválido o vencido. |
| Mismo token cliente en mis-pedidos | 200, confirmando que estaba vigente. |

La última comprobación permite distinguir el rechazo por audiencia administrativa de un token realmente vencido.

No se afirma haber probado manualmente en producción todos los errores contemplados por el código.

### Uso desde el frontend publicado

Se comprobó:

- Crear un producto con una fotografía.
- Editar el nombre, el precio y la fotografía.
- Recargar y verificar la persistencia de los cambios.
- Eliminar el producto temporal y comprobar su ausencia.
- Rechazar desde el formulario una imagen superior a 5 MB.

El selector del navegador puede ocultar formatos no admitidos. Ese filtro visual no reemplaza las validaciones del backend.

### Eliminación de imágenes

Eliminar un producto de MongoDB no elimina automáticamente su imagen de Cloudinary.

Reemplazar una fotografía tampoco garantiza la eliminación de la imagen anterior.

La limpieza de imágenes sin uso queda pendiente.

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

El teléfono admite entre 8 y 15 dígitos, un máximo de 25 caracteres, espacios, guiones, paréntesis y un signo `+` inicial.

No se verifica la existencia del teléfono ni su disponibilidad en WhatsApp.

El backend asigna:

- `origen: presencial`.
- `creadoPor` con el ID del administrador.
- `estado: nuevo`.
- Sin cliente vinculado.

Responde 201 con el mensaje `Pedido presencial creado correctamente` y el documento completo.

Su ID se obtiene de `pedido._id`.

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

`confirmarAnticipacion` es adicional y opcional para pedidos presenciales.

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

### Consulta de pedidos propios

```text
GET /api/pedidos/mis-pedidos
```

Requiere token cliente.

Respuesta exitosa:

```json
{
  "pedidos": []
}
```

La lista contiene los pedidos vinculados al ID de la cuenta autenticada, ordenados por fecha de creación descendente.

El filtro no utiliza el email de contacto.

Los pedidos presenciales sin cuenta cliente no aparecen en este listado.

El frontend utiliza esta ruta en `/mis-pedidos`. Consulta al abrir la pantalla o recargarla; no implementa actualización en tiempo real.

Se comprobó en producción que un cambio de estado administrativo aparece al recargar Mis pedidos desde la cuenta cliente.

### Documentos antiguos

Pueden carecer de email, cliente, origen o creadoPor.

No se realizó una migración.

El controlador trata como web los documentos cuyo origen no sea presencial.

No debe suponerse que todo documento sin cliente es presencial.

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

La contraseña exige al menos 8 caracteres y como máximo 72 bytes UTF-8.

Actualizar exige nombre, email y activo. Conserva contraseña y rol.

El backend impide que el administrador se elimine o desactive a sí mismo.

Rechaza emails duplicados y campos desconocidos.

Las respuestas no incluyen contraseñas ni hashes.

### Pruebas locales

En [USUARIOS.md](./USUARIOS.md) se documentan pruebas de CRUD, validaciones, desactivación, reactivación y protección de la propia cuenta.

También se comprobó desde Postman:

- Creación de una cuenta temporal.
- Consulta por ID y listado: 200.
- Respuestas sin passwordHash.
- Actualización: 200, conservando ID, rol y createdAt.
- Eliminación: 200.
- Consulta posterior: 404, `Usuario no encontrado`.

La cuenta temporal fue eliminada.

### Pruebas desde el frontend publicado

Se comprobó:

- Listado de administradores.
- Creación de un administrador temporal.
- Edición de su nombre y desactivación.
- Persistencia de los cambios después de recargar.
- Eliminación y ausencia posterior en el listado.

El administrador temporal fue eliminado.

Esta ronda funcional no equivale a repetir en producción todas las pruebas de seguridad locales.

## Scripts

Ejecutar con la API funcionando y utilizando cuentas y registros de prueba.

| Comando | Alcance |
|---|---|
| node scripts/probarLogin.js | Login y token. |
| node scripts/probarAccesoAdmin.js | Crear y eliminar producto como admin. |
| node scripts/probarPutProducto.js | PUT de productos. |
| node scripts/probarPedidoAdmin.js | Estado inválido en pedido existente. |
| node scripts/probarCrudPedido.js | CRUD web con email. |
| node scripts/probarAccesoPedidosEmail.js | Separación de clientes y restricciones admin. |
| node scripts/probarPedidosPresenciales.js | Creación, edición y permisos presenciales. |

Revisar la URL configurada en cada script antes de ejecutarlo.

Las ejecuciones documentadas de estos scripts se realizaron contra la API local.

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

Se comprobó:

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

- Dos clientes con pedidos utilizando el mismo email de contacto.
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

Este script completo no se volvió a ejecutar después del cambio presencial ni después del login unificado.

### Email web

Se comprobaron seis casos para POST y seis para PUT.

Se aceptaron y normalizaron correos válidos, mayúsculas y espacios exteriores.

Se rechazaron correos inválidos, espacios internos y texto vacío.

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

## Pruebas iniciales en Render

Las pruebas iniciales del 19/10/2026 se realizaron contra:

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

El pedido temporal de esta ronda fue eliminado.

### Pedido presencial temporal

| Caso | Resultado |
|---|---|
| Creación con teléfono y sin email | Origen presencial y creadoPor del admin. |
| Vínculo cliente | Sin cuenta cliente asociada. |
| Consulta administrativa | 200. |
| PUT cambia teléfono por email | 200. |
| Datos protegidos | ID, origen, creadoPor, estado y createdAt conservados. |
| DELETE | 200. |
| Consulta posterior | 404. |

El pedido temporal de esta ronda fue eliminado.

### Tiempos observados

Se observaron demoras de aproximadamente 42 y 52 segundos en solicitudes anteriores, además de un error de protocolo HTTP/2 en Postman.

No se confirmó su causa.

En comprobaciones posteriores:

| Solicitud | Tiempo observado |
|---|---|
| Health | 189 ms. |
| Health repetido | 495 ms. |
| Productos públicos, con consulta a MongoDB | 335 ms. |

Son mediciones puntuales. No representan una prueba de carga ni garantizan esos tiempos para todas las solicitudes.

## Integración con el frontend publicado

### Autenticación y navegación

Se comprobó:

- Inicio de sesión administrativo desde Vercel.
- Acceso al panel.
- Apertura directa de las rutas de React.
- Menú de perfil y cierre de sesión.
- Inicio de sesión de clientes.

Se renovaron tokens durante las pruebas cuando fue necesario. Eso no constituye una prueba controlada del tiempo exacto de vencimiento.

### Productos y catálogo público

Se comprobó:

- CRUD de productos desde el panel.
- Carga y reemplazo de fotografías.
- Persistencia después de recargar.
- Visualización de Productos del local y Catálogo original.

La aparición de un producto temporal de la API, su ocultamiento al desactivarlo y los controles móviles de esa integración se probaron en local.

No se presentan esas comprobaciones locales como una ronda completa de producción.

El frontend conserva dos conjuntos separados:

- Productos del local: obtenidos de esta API.
- Catálogo original: productos estáticos del frontend.

Cambiar la disponibilidad de un producto de MongoDB afecta al conjunto obtenido de la API.

No modifica ni elimina productos del catálogo estático.

Pueden existir productos similares en ambos conjuntos hasta completar la migración del catálogo.

### Pedidos

Se comprobó desde la web:

- Creación de una consulta con sesión de cliente.
- Aparición del pedido web en el panel.
- Creación de un pedido presencial con teléfono y sin email.
- Visualización de sus detalles.
- Cambio de estado y persistencia después de recargar.
- Actualización del resumen de pedidos del Dashboard.

La edición completa de datos y la eliminación de pedidos existen en la API, pero no están incorporadas a la interfaz administrativa.

Los pedidos temporales creados desde la web deben revisarse y limpiarse por separado. No deben confundirse con los pedidos eliminados en las pruebas iniciales de Postman.

### Usuarios

Se comprobó el CRUD desde el panel publicado, incluyendo desactivación y persistencia después de recargar.

El usuario temporal fue eliminado.

### Verificaciones del 23/10/2026

#### Login unificado

Se comprobó en local:

- Solicitud vacía a `/api/auth/login-unificado`: 400 con errores de email y password.
- Login de administrador desde el formulario compartido: acceso al panel.
- Login de cliente desde el mismo formulario: acceso al inicio con saludo.
- Intento de abrir `/admin` con solo sesión cliente: redirección al login administrativo.
- Intento de usar credenciales cliente en `/admin/login`: rechazo.

Se comprobó en producción:

- Ruta `/api/auth/login-unificado` disponible en Render: solicitud vacía respondida con 400 de validación.
- Login compartido de administrador y redirección al panel.
- Login compartido de cliente y redirección al inicio.

La protección visual de una ruta no reemplaza las pruebas de autorización de la API. Queda pendiente repetir las pruebas de permisos utilizando los tokens obtenidos por el login unificado.

#### Mis pedidos

Se comprobó:

- Listado local de pedidos propios.
- Acceso desde el Header en escritorio y menú móvil.
- Pantalla publicada con el diseño aprobado.
- Consulta de Mesa dulce para el 30/10/2026, cinco personas, evento Reunión.
- Cambio de estado de Nuevo a Confirmado desde el panel administrativo publicado.
- Visualización de Confirmado después de recargar Mis pedidos desde la cuenta cliente.

Los estados no se actualizan automáticamente mientras la pantalla permanece abierta.

#### Compilación

Se ejecutó correctamente `pnpm build` en el frontend después de los cambios de login y Mis pedidos.

### Alcance de las pruebas

Estas comprobaciones confirman los flujos indicados.

La revisión exhaustiva de validaciones, permisos, navegación, sesiones vencidas y diseño en todos los tamaños de pantalla continúa pendiente.

## Manejo de errores

| Caso | Resultado o comportamiento |
|---|---|
| JSON mal formado | 400 con mensaje específico. |
| Cuerpo JSON superior al límite de 100kb | 413 con mensaje específico. |
| Ruta inexistente | 404. |
| Archivo mayor a 5 MB | 413. |
| Errores de recepción de Multer | 400, excepto exceso de tamaño. |
| Error interno inesperado | 500 con mensaje genérico. |

El límite de JSON y el límite de archivos son independientes.

Los dos primeros casos se comprobaron localmente. Los resultados confirmados de subida en Render están documentados en Imágenes de productos.

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
| Contraseña demasiado corta con el mínimo anterior de 12 caracteres | 400; prueba histórica anterior al cambio. |
| Límite de registro | 429 |
| Límite de login cliente | 429 |
| Límite de login admin | 429 |
| Límite de creación web | 429 |
| Creación web después del bloqueo | Vuelve a responder 400 por el cuerpo vacío utilizado. |

Las pruebas aisladas del mínimo de 8 caracteres están documentadas en Autenticación.

Las pruebas históricas de límites no implican haber probado el nuevo login unificado.

### Configuración

| Operación | Límite |
|---|---|
| Login admin y login unificado | Comparten un limitador de 10 intentos fallidos por IP en 15 minutos. |
| Registro cliente | 5 solicitudes por IP en 15 minutos. |
| Login cliente exclusivo | 10 solicitudes por IP en 15 minutos, incluidos éxitos. |
| Crear pedido web | 10 solicitudes por IP en 15 minutos después de autenticar. |

El limitador compartido utiliza `skipSuccessfulRequests: true`. Las respuestas exitosas no quedan contabilizadas después de finalizar.

El login exclusivo de clientes conserva su propio limitador.

La creación administrativa no utiliza el limitador de pedidos web.

En la prueba de creación web se enviaron cuerpos vacíos con sesión cliente válida.

Las solicitudes respondieron 400 por validación hasta observar el bloqueo con 429.

Después de la ventana de bloqueo, sin reiniciar el servidor durante la espera, la misma solicitud volvió a responder 400.

No creó pedidos.

No se midieron todos los umbrales desde ventanas vacías.

Siguen pendientes:

- Recuperación después del bloqueo de registro y logins.
- Verificación del limitador compartido de login.
- Verificación del rate limiting detrás del proxy de Render.

Ejecutar pruebas de límites al final para evitar bloqueos durante las pruebas funcionales.

## Postman

Colección versionada:

[Descargar colección](./postman/Lara-Pasteleria-API.postman_collection.json)

La colección revisada el 23/10/2026 contiene 77 solicitudes.

| Grupo | Cantidad |
|---|---:|
| Autenticación administrativa y productos originales | 16 |
| Pedidos web y administración | 15 |
| Clientes y pedidos propios | 15 |
| Usuarios | 5 |
| Pedidos presenciales | 10 |
| Productos administrativos adicionales | 2 |
| Imágenes de productos | 6 |
| Contraseñas mínimo 8 | 8 |
| Total | 77 |

Las solicitudes de imágenes y contraseñas ya están incorporadas.

El login unificado todavía no tiene solicitudes propias en esta colección. Sus pruebas manuales se documentan en este README.

La colección no contiene aserciones automatizadas. El script previo calcula fechas; no verifica resultados.

El conteo de solicitudes no implica que todas se hayan ejecutado juntas ni que todos sus escenarios estén aprobados.

### Entornos

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

Guardar los tokens sin comillas ni prefijo Bearer.

En Authorization → Bearer Token, utilizar `{{token}}` o `{{clienteToken}}` según corresponda.

Si un token recién obtenido funciona al pegarlo directamente pero falla al utilizar la variable, revisar el entorno seleccionado y el valor resuelto.

No exportar entornos con credenciales ni tokens reales.

No guardar respuestas de login con tokens reales dentro de la colección compartida.

### Fechas automáticas

Se calculan según Buenos Aires:

| Variable | Valor |
|---|---|
| fechaPedido | Hoy más 30 días. |
| fechaSinAnticipacion | Hoy. |

Las fechas fijas utilizadas en pruebas anteriores no deben reutilizarse sin revisar la anticipación.

### Orden y limpieza

1. Iniciar sesión y actualizar el token correspondiente.
2. Crear únicamente registros de prueba identificables.
3. Guardar sus IDs en las variables correspondientes.
4. Ejecutar consultas, modificaciones y rechazos.
5. Comprobar que los rechazos no alteraron los registros.
6. Eliminar los registros temporales.
7. Verificar 404 y ausencia en los listados correspondientes.

No ejecutar toda la colección sin revisar el orden y los registros afectados.

Para probar archivos, utilizar archivos pequeños salvo cuando se compruebe específicamente el límite de tamaño.

Los archivos locales de Postman no quedan automáticamente disponibles para otras personas que importen la colección.

## Coordinación con el frontend

### Autenticación

- `/login` utiliza POST /api/auth/login-unificado.
- La respuesta compartida contiene token y usuario.
- El frontend redirige según usuario.rol.
- `/admin/login` conserva POST /api/auth/login.
- Las audiencias y permisos se comprueban en el backend.
- No se implementaron recuperación de contraseña ni correos automáticos.

### Contraseñas

- El backend admite creación desde 8 caracteres y hasta 72 bytes UTF-8.
- El registro público del frontend ya utiliza el mínimo de 8.
- El formulario de creación de administradores todavía exige 12.
- Las cuentas existentes conservan sus contraseñas.

### Productos

- Listado completo: GET /api/productos/admin.
- Consulta administrativa por ID: GET /api/productos/admin/:id.
- Ambas consultas requieren token admin.
- Subida de imagen: POST /api/productos/imagen.
- Guardar la URL devuelta en el campo imagen del producto.
- Las escrituras conservan /api/productos y /api/productos/:id.
- El catálogo público de la API solo muestra disponibles.
- El catálogo estático del frontend continúa separado.

### Pedidos

- POST /api/pedidos requiere token cliente.
- GET /api/pedidos/mis-pedidos filtra por cuenta autenticada.
- POST /api/pedidos/admin requiere token admin.
- Los presenciales requieren al menos email o telefono.
- La excepción de anticipación exige confirmación explícita.
- El ID de creación presencial está en pedido._id.
- PUT presencial requiere ocho campos completos y confirmación cuando corresponda.
- No todos los pedidos tienen cuenta cliente.
- Los estados cambian mediante PATCH.
- Los campos protegidos no se envían en POST ni PUT.
- Mis pedidos consulta los estados al abrirse o recargarse.

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
| config | Configuración de MongoDB y Cloudinary. |
| controllers | Respuestas HTTP. |
| middlewares | Autenticación, recepción de archivos, validación y errores. |
| models | Documentos de MongoDB. |
| routes | Rutas, métodos y permisos. |
| schemas | Validación Zod. |
| services | Operaciones y lógica. |
| utils | Utilidades compartidas. |

## Trabajo en equipo

Se utilizan ramas por tarea, commits descriptivos y Pull Requests hacia main.

Desde una copia sin cambios pendientes:

```bash
git switch main
git pull --ff-only
git switch -c feat/nombre-de-la-tarea
```

Revisar cambios, crear commit, subir la rama y abrir PR hacia main.

### Integraciones registradas

| PR | Cambio | Commit de merge |
|---|---|---|
| #16 | Pedidos con email y pruebas. | 804fb8f |
| #17 | Pruebas locales de preparación para deploy. | 56db427 |
| #18 | Pedidos presenciales desde administración. | e58d5db |
| #19 | Filtro público y consultas administrativas de productos. | e3a4f25 |
| #20 | CORS y proxy para Render. | 92a364c |
| #21 | Documentación del despliegue y pruebas. | 805d0c9 |
| #22 | Consultas administrativas de productos en Postman. | b7617da |
| #23 | Carga de imágenes con Cloudinary y Multer. | ad96950 |
| #24 | Manejo de errores de Multer. | b6e626e |
| #25 | Validación de formato y diagnóstico de Cloudinary. | c82a10e |
| #26 | Documentación de pruebas de imágenes en producción. | 6cc472e |
| #27 | Contraseñas desde 8 caracteres. | b128331 |
| #28 | Solicitudes de imágenes y contraseñas en Postman. | 9abde39 |

El login unificado se integró posteriormente en main, con commit de merge `4894dff`.

### Integrantes del backend

#### Sofía Mendoza

- Desarrollo del backend y pruebas.
- Integración entre frontend, API y despliegues.
- Implementación y verificación de flujos de autenticación y pedidos.

#### Yamila Valdez Aguilar

- Implementación del módulo de Usuarios.
- Implementación de carga de imágenes.
- Integración del panel administrativo con la API.

#### Veronica Teresa Lopez Fernandez

- Revisión del backend.

El frontend se desarrolla en su repositorio independiente y conserva sus propios créditos.

## Pendientes y límites actuales

- Ajustar el formulario de creación de administradores de 12 a 8 caracteres.
- Incorporar solicitudes del login unificado a Postman.
- Repetir pruebas de permisos con tokens obtenidos por el login unificado.
- Comprobar recuperación después del bloqueo de registro y logins.
- Verificar el limitador compartido y el rate limiting detrás del proxy de Render.
- Completar pruebas de sesiones vencidas y presentación de errores.
- Revisar pedidos y cuentas temporales antes de eliminarlos.
- Resolver la limpieza de imágenes sin uso en Cloudinary.
- Completar los escenarios de errores de subida todavía no comprobados.
- Incorporar edición completa y eliminación de pedidos al frontend si se amplía esa interfaz.
- Completar la migración del catálogo estático si se decide administrarlo desde MongoDB.
- Conservar presentaciones y precios múltiples al migrar.
- Completar la revisión responsive en dispositivos reales.
- Evaluar disponibilidad y alojamiento para el uso cotidiano de Lara.

No están implementados:

- Recuperación de contraseña.
- Envío automático de correos o mensajes.
- Actualización de estados en tiempo real.
- Carrito ni pagos online.
- Notificaciones funcionales mediante la campanita del panel.

## Estado de entrega

La API está publicada en Render y conectada a MongoDB Atlas y Cloudinary.

El frontend está publicado en Vercel y conectado a esta API.

Los repositorios, la documentación y la colección de Postman están enlazados al comienzo de este README.

La documentación distingue las pruebas locales, las solicitudes manuales contra Render y los flujos comprobados desde el frontend publicado.

Un resultado anterior no prueba automáticamente un cambio posterior.