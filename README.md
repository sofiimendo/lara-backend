# Lara Backend

API de Lara Pastelería y Lara Stock, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Incluye conexión a MongoDB Atlas, operaciones de productos con validaciones y autenticación de administración. La conexión con la landing existente en React está pendiente.

## Tecnologías

- Node.js y pnpm
- Express
- MongoDB Atlas y Mongoose
- Zod
- bcryptjs
- jsonwebtoken
- express-rate-limit
- cors y dotenv
- nodemon para desarrollo

## Instalación

Necesitás Node.js con soporte para `fetch`, pnpm, acceso al repositorio y una conexión de MongoDB Atlas.

### 1. Clonar el repositorio

```bash
git clone https://github.com/sofiimendo/lara-backend.git
```

```bash
cd lara-backend
```

### 2. Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### 3. Configurar el entorno

Copiá `.env.example` y nombrá la copia `.env`.

Completá:

| Variable | Uso |
|---|---|
| PORT | Puerto de la API. Usamos 4000. |
| MONGODB_URI | Conexión a Atlas con credenciales y nombre de la base acordada. |
| FRONTEND_URL | Dirección del frontend. En desarrollo: http://localhost:5173. |
| JWT_SECRET | Secreto para firmar y verificar tokens. |

Generá el secreto con:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copiá el resultado como valor de `JWT_SECRET` en `.env`.

La dirección de MongoDB en `.env.example` es una plantilla y debe completarse. En Atlas, habilitá la IP actual de tu computadora y verificá los permisos del usuario de base de datos.

Cada integrante configura su propio `.env`. No subir contraseñas, secretos ni tokens a GitHub.

Reiniciá el servidor después de cambiar `.env`.

### 4. Iniciar el servidor

```bash
pnpm dev
```

Respuesta esperada en la terminal:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

Dejá esa terminal abierta y usá otra para ejecutar las pruebas.

## Comprobar la API

Abrí:

```text
http://localhost:4000/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API de Lara Pastelería funcionando"
}
```

La dirección raíz `http://localhost:4000` no tiene una ruta definida y responde 404.

## Crear una cuenta administradora

No existe un registro público de administradores.

Para crear una cuenta, completá temporalmente en `.env`:

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

El script guarda un hash generado con bcrypt. Si el email ya existe, no reemplaza la cuenta.

Después de crearla, guardá las credenciales en un gestor de contraseñas y eliminá las tres variables `ADMIN_*` de `.env`.

El email de ejemplo sirve para pruebas. Para la cuenta definitiva, usá un correo al que Lara tenga acceso. Actualmente no se envían correos ni existe recuperación de contraseña.

## Login

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/login | Público, con límite de intentos |

Enviar JSON con `email` y `password`.

Un login correcto responde 200 con:

- `message`
- `token`
- `usuario`: id, nombre, email y rol

El token vence en una hora. Para acceder a operaciones protegidas, enviarlo en este encabezado:

```text
Authorization: Bearer TOKEN
```

Las credenciales incorrectas responden 401. El login limita a 10 intentos fallidos por IP en una ventana de 15 minutos; al superar el límite responde 429.

## Rutas de productos

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| GET | /api/productos | Listar productos | Público |
| GET | /api/productos/:id | Obtener un producto | Público |
| POST | /api/productos | Crear un producto | Admin |
| PATCH | /api/productos/:id | Actualizar campos | Admin |
| DELETE | /api/productos/:id | Eliminar un producto | Admin |

Para crear o actualizar, enviar JSON con `Content-Type: application/json`.

Al crear, `nombre` y `precio` son obligatorios. Son opcionales:

- descripcion
- categoria
- imagen
- disponible

El precio debe ser un número mayor o igual a cero. Se rechazan campos desconocidos y actualizaciones vacías.

Las consultas públicas actuales devuelven todos los productos, incluidos los no disponibles. El filtrado del catálogo queda pendiente.

Las operaciones protegidas verifican el token y que la cuenta siga activa y tenga rol admin.

## Pruebas manuales

Con el servidor funcionando, ejecutá en otra terminal:

### Probar login

```bash
node scripts/probarLogin.js
```

Ingresá el email y la contraseña cuando se soliciten.

El script muestra el estado HTTP y confirma si recibió un token, sin imprimirlo.

### Probar acceso de administración

```bash
node scripts/probarAccesoAdmin.js
```

El script inicia sesión, crea un producto de prueba y lo elimina usando el token.

Resultado esperado:

```text
Login HTTP: 200
Crear HTTP: 201
Mensaje: Producto creado correctamente
Eliminar HTTP: 200
Mensaje: Producto eliminado correctamente
```

Las contraseñas se ven mientras se escriben en estos scripts. No compartir capturas ni salidas que incluyan credenciales.

Estas pruebas usan la base configurada en `.env`. Si la eliminación falla, revisá y retir á el producto de prueba pendiente.

## Organización

```text
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

- `scripts`: creación de cuentas y pruebas manuales.
- `config`: conexión a MongoDB.
- `controllers`: respuestas de la API.
- `middlewares`: validación, autenticación y manejo de errores.
- `models`: estructura de los documentos.
- `routes`: direcciones y métodos.
- `schemas`: validaciones con Zod.
- `services`: operaciones y lógica del backend.
- `utils`: utilidades compartidas.

## Trabajo en equipo

Desde una copia sin cambios pendientes:

```bash
git switch main
```

```bash
git pull --ff-only
```

Creá una rama para tu tarea:

```bash
git switch -c feat/nombre-de-la-tarea
```

Al terminar, revisá los cambios, agregá los archivos correspondientes y creá un commit. Subí la rama y abrí un Pull Request hacia `main`.

Coordiná los archivos que vas a modificar para evitar trabajar simultáneamente sobre los mismos.

## Próximos pasos

- Gestión de pedidos.
- Administración de cuentas autorizadas.
- Conexión con la landing en React.
- Panel de administración.
- Configuración y publicación del backend.