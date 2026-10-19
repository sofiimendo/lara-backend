# Usuarios — Lara Pastelería

## Descripción

El módulo de usuarios permite administrar las cuentas autorizadas para acceder al panel de administración de Lara Pastelería.

Está desarrollado con Node.js, Express, MongoDB Atlas, Mongoose y Zod.

No existe registro público de administradores. Solo una cuenta administradora autenticada puede crear, consultar, actualizar o eliminar otras cuentas administrativas.

Este CRUD no administra las cuentas cliente.

## Entornos

| Entorno | URL base |
|---|---|
| Local | http://localhost:4000 |
| Render | https://lara-backend-5tq4.onrender.com |

Las pruebas de Usuarios documentadas aquí se realizaron contra la API local conectada a MongoDB Atlas.

No se presenta el CRUD de Usuarios como probado en Render ni desde el frontend publicado.

## Autenticación y autorización

Todas las rutas `/api/usuarios` requieren un token JWT válido y una cuenta activa con rol `admin`.

El token se obtiene mediante:

```text
POST /api/auth/login
```

Debe enviarse en el encabezado:

```text
Authorization: Bearer TOKEN
```

Los tokens vencen después de una hora.

La autenticación comprueba la firma, el vencimiento, la audiencia administrativa y la cuenta activa con rol admin.

Un token cliente es rechazado por la separación de audiencias. No debe confundirse ese rechazo con una prueba de token vencido.

## Endpoints

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | /api/usuarios | Listar usuarios administrativos. | Admin |
| GET | /api/usuarios/:id | Consultar usuario por ID. | Admin |
| POST | /api/usuarios | Crear usuario administrativo. | Admin |
| PUT | /api/usuarios/:id | Actualizar usuario administrativo. | Admin |
| DELETE | /api/usuarios/:id | Eliminar usuario administrativo. | Admin |

## Crear usuario

```text
POST /api/usuarios
```

Requiere token admin y Content-Type application/json.

Cuerpo utilizado en la solicitud de Postman:

```json
{
  "nombre": "Usuario de prueba",
  "email": "usuario.prueba@example.com",
  "password": "{{passwordUsuarioPrueba}}"
}
```

`{{passwordUsuarioPrueba}}` es una variable de Postman. Debe configurarse de forma privada antes de enviar la solicitud.

Validaciones:

- nombre: obligatorio, entre 1 y 100 caracteres después de quitar espacios exteriores.
- email: obligatorio, formato válido y máximo 254 caracteres.
- password: obligatoria, mínimo 12 caracteres y máximo 72 bytes en UTF-8.
- No se permiten campos adicionales.

El email se normaliza quitando espacios exteriores y convirtiéndolo a minúsculas antes de validar su formato.

El backend genera un hash de la contraseña mediante bcrypt con un costo de 12 y asigna automáticamente:

- `rol: "admin"`.
- `activo: true`.

Respuesta exitosa: HTTP 201.

Las respuestas no incluyen la contraseña ni passwordHash.

## Listar usuarios

```text
GET /api/usuarios
```

Devuelve un objeto con la propiedad usuarios, que contiene un arreglo de cuentas administrativas ordenadas por fecha de creación descendente.

Respuesta exitosa: HTTP 200.

## Consultar usuario por ID

```text
GET /api/usuarios/:id
```

Permite consultar una cuenta administrativa mediante su identificador de MongoDB.

Respuesta exitosa: HTTP 200 con la propiedad usuario.

Después de autenticar:

- ID inválido: 400.
- Usuario inexistente: 404.

## Actualizar usuario

```text
PUT /api/usuarios/:id
```

Ejemplo:

```json
{
  "nombre": "Usuario actualizado",
  "email": "actualizado@example.com",
  "activo": true
}
```

Los tres campos son obligatorios.

No se permite modificar el rol, la contraseña, passwordHash, el identificador ni las fechas mediante esta ruta.

Se conservan el ID, el rol, la contraseña y createdAt. updatedAt se actualiza al guardar los cambios.

El backend impide desactivar la propia cuenta administradora.

Respuesta exitosa: HTTP 200.

## Eliminar usuario

```text
DELETE /api/usuarios/:id
```

Elimina la cuenta identificada por su ID.

Una cuenta administradora no puede eliminarse a sí misma.

Respuesta exitosa: HTTP 200.

La consulta posterior del mismo ID responde 404:

```json
{
  "message": "Usuario no encontrado"
}
```

## Seguridad

- Todas las operaciones requieren autenticación JWT y permisos de administrador.
- No existe registro público de administradores.
- Las contraseñas se almacenan como hashes bcrypt.
- Las respuestas del módulo no incluyen passwordHash.
- Se utiliza Cache-Control: no-store en las respuestas de los controladores y del manejador de errores del módulo.
- No se permite eliminar ni desactivar la propia cuenta administradora.
- Zod rechaza campos desconocidos y solicitudes incompletas.
- Los emails duplicados se rechazan.
- El rol administrativo se asigna desde el backend.

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación exitosa. |
| 201 | Usuario creado. |
| 400 | Datos o ID inválidos. |
| 401 | Autenticación ausente, inválida o cuenta no disponible. |
| 403 | Permisos insuficientes. |
| 404 | Usuario no encontrado. |
| 409 | Email duplicado u operación bloqueada para proteger la propia cuenta. |
| 500 | Error interno inesperado. |

## Pruebas manuales documentadas por Yami

Se comprobó el funcionamiento del módulo mediante solicitudes HTTP desde PowerShell contra la API local conectada a MongoDB Atlas.

Pruebas exitosas:

- Inicio de sesión y recepción del token JWT.
- Listado de usuarios.
- Creación de un usuario temporal.
- Consulta del usuario por ID.
- Verificación de que passwordHash no aparece en la respuesta.
- Actualización del nombre del usuario conservando su ID.
- Eliminación del usuario temporal.
- Confirmación de respuesta 404 después de eliminarlo.
- Rechazo de consultas sin token: 401.
- Rechazo de contraseñas demasiado cortas: 400.
- Bloqueo de eliminación de la propia cuenta: 409.
- Bloqueo de desactivación de la propia cuenta: 409.
- Rechazo de emails duplicados: 409.
- Rechazo de campos adicionales: 400.
- Rechazo de IDs inválidos: 400.
- Comprobación de que GET /api/productos y GET /api/pedidos continuaban respondiendo 200 en esa ronda.

Las pruebas utilizaron una cuenta temporal que fue eliminada al finalizar.

## Pruebas adicionales documentadas por Yami

Se realizaron desde PowerShell contra la API local conectada a MongoDB Atlas, utilizando una cuenta administradora y una cuenta temporal de prueba.

### Actualización

- Se creó una cuenta temporal y se comprobó que podía iniciar sesión.
- Se actualizó su nombre mediante PUT /api/usuarios/:id.
- Se verificó que createdAt conservara su valor original.
- Se comprobó que la contraseña original continuara funcionando después de la actualización.
- Se verificó que la cuenta permaneciera activa.

### Desactivación y reactivación

- Se desactivó la cuenta temporal mediante PUT /api/usuarios/:id.
- Su JWT anterior fue rechazado con 401 al intentar acceder a una ruta protegida.
- Se verificó que una cuenta desactivada no pudiera iniciar sesión: 401.
- Otra cuenta administradora reactivó al usuario temporal.
- Se comprobó que el usuario reactivado pudiera iniciar sesión con su contraseña original.

### Protección de la propia cuenta

Se verificó que las comparaciones de IDs funcionaran incluso cuando el identificador se enviaba en mayúsculas.

- Intento de autodesactivación: 409.
- Intento de autoeliminación: 409.
- Después de ambos intentos, la cuenta temporal seguía existiendo y permanecía activa.

### Normalización del email

Se corrigió el esquema de Zod para normalizar el email antes de validar su formato.

Mediante una prueba del esquema se comprobó que un email con espacios exteriores y letras mayúsculas se normalizara a minúsculas y sin espacios exteriores.

### Limpieza

La cuenta temporal fue eliminada de MongoDB Atlas.

Las pruebas adicionales indicadas finalizaron con los resultados esperados.

## Verificación local de Sofi en Postman

El 19/10/2026 se comprobó el CRUD utilizando una cuenta administrativa y un usuario temporal.

| Comprobación | Resultado |
|---|---|
| Crear usuario temporal | Cuenta creada y disponible para consultar. |
| Consultar por ID | 200. |
| Listar usuarios | 200, incluye la cuenta temporal. |
| Datos de las respuestas | Sin passwordHash. |
| Actualizar nombre mediante PUT | 200. |
| Conservación en PUT | ID, email, rol admin, activo y createdAt. |
| Eliminar usuario temporal | 200. |
| Consultar después de eliminar | 404, Usuario no encontrado. |

La cuenta temporal fue eliminada.

Esta ronda comprobó el CRUD desde Postman. No equivale a repetir todas las pruebas de seguridad y validaciones realizadas por Yami.

Tampoco constituye una prueba del módulo en Render ni de su integración desde el panel publicado.

## Colección de Postman

Las cinco solicitudes del módulo se encuentran en la carpeta Usuarios de:

[Descargar colección](./postman/Lara-Pasteleria-API.postman_collection.json)

Solicitudes:

- POST /api/usuarios.
- GET /api/usuarios.
- GET /api/usuarios/:id.
- PUT /api/usuarios/:id.
- DELETE /api/usuarios/:id.

Variables utilizadas:

| Variable | Uso |
|---|---|
| baseUrl | URL base de la API, sin /api al final. |
| token | Token administrativo. |
| usuarioId | ID de la cuenta administrativa temporal. |
| passwordUsuarioPrueba | Contraseña privada de la cuenta temporal. |

Respetar la escritura de usuarioId.

No se incluyeron credenciales ni tokens reales en las solicitudes versionadas.

No exportar entornos con secretos ni guardar respuestas de login con tokens reales en la colección compartida.

La colección no contiene aserciones automatizadas.

### Repetir el CRUD

1. Iniciar sesión como administrador y actualizar token.
2. Configurar passwordUsuarioPrueba de forma privada.
3. Crear una cuenta temporal.
4. Guardar su ID en usuarioId.
5. Listar y consultar por ID.
6. Actualizar y comprobar los datos conservados.
7. Eliminar la cuenta temporal desde otra cuenta administradora.
8. Consultar nuevamente y comprobar el 404.

No utilizar cuentas reales de trabajo para las pruebas de eliminación o desactivación.

## Archivos del módulo

| Archivo | Responsabilidad |
|---|---|
| src/models/Usuario.js | Modelo de MongoDB. |
| src/schemas/usuario.schema.js | Validaciones con Zod. |
| src/services/usuario.service.js | Lógica de negocio y operaciones de base de datos. |
| src/controllers/usuario.controller.js | Respuestas HTTP. |
| src/routes/usuario.routes.js | Rutas protegidas. |
| src/middlewares/autenticar.js | Autenticación y autorización administrativa. |
| src/middlewares/manejarErrores.js | Manejo de errores. |

## Integración con el frontend

El panel utiliza estas rutas para gestionar las cuentas administrativas.

Debe iniciar sesión mediante /api/auth/login y enviar el token en las solicitudes protegidas.

Para el frontend actual, que agrega /api al construir las rutas, la URL base de producción es:

```text
https://lara-backend-5tq4.onrender.com
```

El frontend debe utilizar VITE_API_URL y volver a desplegarse después de configurarla.

La integración de Usuarios desde el panel publicado sigue pendiente de verificación.

## Pendientes

- Comprobar el CRUD de Usuarios en Render.
- Conectar y verificar la pantalla de Usuarios del frontend publicado.
- Comprobar la presentación de errores y el vencimiento de sesión en el panel.
- Conservar la carpeta Usuarios al exportar la colección final.

Los resultados locales documentados se conservan como evidencia de esas rondas y no se presentan como pruebas de producción.