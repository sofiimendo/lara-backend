# Usuarios — Lara Pastelería

## Descripción

El módulo de usuarios permite administrar las cuentas autorizadas para acceder al panel de administración de Lara Pastelería.

Está desarrollado con Node.js, Express, MongoDB Atlas, Mongoose y Zod.

No existe registro público de usuarios. Solo una cuenta administradora autenticada puede crear, consultar, actualizar o eliminar otras cuentas.

## Autenticación y autorización

Todas las rutas `/api/usuarios` requieren un token JWT válido y una cuenta activa con rol `admin`.

El token se obtiene mediante `POST /api/auth/login` y debe enviarse en el encabezado:

`Authorization: Bearer TOKEN`

Los tokens vencen después de una hora.

## Endpoints

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuarios | Admin |
| GET | `/api/usuarios/:id` | Consultar usuario por ID | Admin |
| POST | `/api/usuarios` | Crear usuario | Admin |
| PUT | `/api/usuarios/:id` | Actualizar usuario | Admin |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | Admin |

## Crear usuario

**POST `/api/usuarios`**

Ejemplo de solicitud:

```json
{
  "nombre": "Usuario de prueba",
  "email": "prueba@example.com",
  "password": "ContrasenaSegura123!"
}
```

Validaciones:

- `nombre`: obligatorio, entre 1 y 100 caracteres después de quitar espacios exteriores.
- `email`: obligatorio, formato válido, máximo 254 caracteres; se normaliza a minúsculas.
- `password`: obligatoria, mínimo 12 caracteres y máximo 72 bytes en UTF-8.
- No se permiten campos adicionales.

El backend cifra la contraseña mediante bcrypt con un costo de 12 y asigna automáticamente `rol: "admin"` y `activo: true`.

Respuesta exitosa: **201 Created**.

## Listar usuarios

**GET `/api/usuarios`**

Devuelve un objeto con la propiedad `usuarios`, que contiene un arreglo de cuentas registradas, ordenadas por fecha de creación descendente.

Respuesta exitosa: **200 OK**.

## Consultar usuario por ID

**GET `/api/usuarios/:id`**

Permite consultar una cuenta mediante su identificador de MongoDB.

Respuesta exitosa: **200 OK**.

## Actualizar usuario

**PUT `/api/usuarios/:id`**

Ejemplo de solicitud:

```json
{
  "nombre": "Usuario actualizado",
  "email": "actualizado@example.com",
  "activo": true
}
```

Los tres campos son obligatorios. No se permite modificar el rol, la contraseña cifrada, el identificador ni las fechas mediante esta ruta.

Se conserva el ID del usuario y se aplican las validaciones del modelo.

Respuesta exitosa: **200 OK**.

## Eliminar usuario

**DELETE `/api/usuarios/:id`**

Elimina la cuenta identificada por su ID.

Como medida de seguridad, una cuenta administradora no puede eliminarse a sí misma.

Respuesta exitosa: **200 OK**.

## Seguridad

- Todas las operaciones requieren autenticación JWT y permisos de administrador.
- No existe registro público.
- Las contraseñas se almacenan cifradas con bcrypt.
- Las respuestas del módulo no incluyen `passwordHash`.
- Se utiliza `Cache-Control: no-store` en las respuestas de los controladores y del manejador de errores del módulo.
- No se permite eliminar ni desactivar la propia cuenta administradora.
- Zod rechaza campos desconocidos y solicitudes incompletas.
- Los emails duplicados se rechazan.

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Usuario creado |
| 400 | Datos o ID inválidos |
| 401 | Autenticación ausente o inválida |
| 403 | Permisos insuficientes |
| 404 | Usuario no encontrado |
| 409 | Email duplicado u operación bloqueada para proteger la propia cuenta |
| 500 | Error interno inesperado |

## Pruebas manuales realizadas

Se comprobó el funcionamiento del módulo mediante solicitudes HTTP desde PowerShell contra la API local conectada a MongoDB Atlas.

Pruebas exitosas:

- Inicio de sesión y recepción del token JWT.
- Listado de usuarios.
- Creación de un usuario temporal.
- Consulta del usuario por ID.
- Verificación de que `passwordHash` no aparece en la respuesta.
- Actualización del nombre del usuario conservando su ID.
- Eliminación del usuario temporal.
- Confirmación de respuesta 404 después de eliminarlo.
- Rechazo de consultas sin token (401).
- Rechazo de contraseñas demasiado cortas (400).
- Bloqueo de eliminación de la propia cuenta (409).
- Bloqueo de desactivación de la propia cuenta (409).
- Rechazo de emails duplicados (409).
- Rechazo de campos adicionales (400).
- Rechazo de IDs inválidos (400).
- Comprobación de que GET `/api/productos` y GET `/api/pedidos` continúan respondiendo 200.

Las pruebas utilizaron una cuenta temporal que fue eliminada al finalizar.

## Archivos del módulo

- `src/models/Usuario.js`: modelo de MongoDB.
- `src/schemas/usuario.schema.js`: validaciones con Zod.
- `src/services/usuario.service.js`: lógica de negocio y operaciones de base de datos.
- `src/controllers/usuario.controller.js`: controladores HTTP.
- `src/routes/usuario.routes.js`: rutas protegidas.
- `src/middlewares/autenticar.js`: autenticación y autorización.
- `src/middlewares/manejarErrores.js`: manejo de errores.

## Integración con el frontend

El panel de administración podrá utilizar estas rutas para gestionar las cuentas autorizadas.

El frontend deberá iniciar sesión mediante `/api/auth/login`, guardar el token de manera apropiada y enviarlo en las solicitudes protegidas.

La integración con la landing y el panel de administración se realizará por separado.