# Lara Backend

API de Lara Pastelería y Lara Stock, desarrollada por Sofía Mendoza y Yamila Valdez Aguilar.

Se conectará con la landing existente en React. Actualmente incluye conexión a MongoDB Atlas y operaciones de productos con validaciones.

## Tecnologías

- Node.js
- pnpm
- Express
- MongoDB Atlas y Mongoose
- Zod

## Instalación

Necesitás Node.js y pnpm instalados, acceso al repositorio y una conexión de MongoDB Atlas.

### 1. Clonar el repositorio

```bash
git clone https://github.com/sofiimendo/lara-backend.git
```

```bash
cd lara-backend
```

### 2. Instalar las dependencias

```bash
pnpm install --frozen-lockfile
```

### 3. Configurar las variables de entorno

Copiá `.env.example` y nombrá la copia `.env`.

Completá estas variables en `.env`:

- `PORT`: puerto del servidor. Por defecto usamos `4000`.
- `MONGODB_URI`: dirección de conexión a MongoDB Atlas con credenciales válidas y el nombre de la base acordada por el equipo.
- `FRONTEND_URL`: dirección del frontend. Para desarrollo local usamos `http://localhost:5173`.

La dirección de `.env.example` es una plantilla; no funciona sin completar.

En Atlas, la IP de la computadora debe estar habilitada y el usuario de base de datos debe tener permisos sobre la base utilizada.

No subir `.env`, contraseñas ni tokens a GitHub.

### 4. Iniciar el servidor

```bash
pnpm dev
```

La terminal debería mostrar:

```text
Conectado a MongoDB
API de Lara disponible en http://localhost:4000
```

Dejá esa terminal abierta mientras usás la API.

## Comprobar el funcionamiento

Abrí en el navegador:

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

## Rutas de productos

| Método | Ruta | Acción |
|---|---|---|
| GET | /api/productos | Listar productos |
| GET | /api/productos/:id | Obtener un producto |
| POST | /api/productos | Crear un producto |
| PATCH | /api/productos/:id | Actualizar campos |
| DELETE | /api/productos/:id | Eliminar un producto |

Para crear o actualizar productos, enviar JSON con el encabezado `Content-Type: application/json`.

Al crear un producto, `nombre` y `precio` son obligatorios. Los campos opcionales son `descripcion`, `categoria`, `imagen` y `disponible`.

El precio debe ser un número mayor o igual a cero. Los campos desconocidos se rechazan.

Las rutas de escritura todavía no tienen autenticación. La protección de administración está pendiente antes de publicar la API.

## Organización

```text
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

- `config`: conexión a la base de datos.
- `controllers`: respuestas de la API.
- `middlewares`: validación y manejo de errores.
- `models`: estructura de los documentos en MongoDB.
- `routes`: direcciones y métodos de la API.
- `schemas`: validación de datos con Zod.
- `services`: operaciones sobre la base de datos.
- `utils`: utilidades compartidas.

## Trabajo en equipo

Antes de empezar, desde una copia sin cambios pendientes:

```bash
git switch main
```

```bash
git pull --ff-only
```

Creá una rama para tu tarea, usando un nombre descriptivo:

```bash
git switch -c feat/nombre-de-la-tarea
```

Al terminar, revisá los cambios, agregá los archivos correspondientes y creá un commit. Subí tu rama y abrí un Pull Request hacia `main` para revisión.

Cada integrante configura su propio archivo `.env`.

## Próximos pasos

- Autenticación de administración.
- Protección de las operaciones de productos.
- Gestión de pedidos.
- Conexión con la landing en React.
- Panel de administración.