# API de pedidos

La API recibe consultas por encargo. Recibir una consulta no confirma una reserva: Lara debe confirmar disponibilidad y presupuesto.

Los clientes pueden crear pedidos y consultar los propios. La administración requiere una cuenta administradora activa.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/clientes/registro | Registrar cliente. |
| POST | /api/clientes/login | Iniciar sesión como cliente. |
| POST | /api/auth/login | Iniciar sesión como administrador. |

El registro de clientes requiere nombre, email y password. Los logins requieren email y password.

Los tokens duran una hora y utilizan audiencias separadas:

| Sesión | Audiencia |
|---|---|
| Cliente | lara-cliente |
| Administrador | lara-admin |

Enviar el token correspondiente:

```text
Authorization: Bearer TOKEN
```

El backend verifica token, audiencia, cuenta activa y rol.

Un token cliente en una ruta administrativa responde 401 por la separación de audiencias. Ese resultado no demuestra que el token haya vencido.

## Rutas

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/pedidos | Crear pedido. | Cliente |
| GET | /api/pedidos/mis-pedidos | Listar pedidos propios. | Cliente |
| GET | /api/pedidos | Listar todos los pedidos. | Admin |
| GET | /api/pedidos/:id | Consultar por ID. | Admin |
| PUT | /api/pedidos/:id | Reemplazar datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar pedido. | Admin |

## Campos

| Campo | Validación | POST | PUT |
|---|---|---|---|
| nombre | Texto entre 2 y 80 caracteres después de quitar espacios exteriores. | Obligatorio | Obligatorio |
| email | Correo válido de hasta 254 caracteres. | Obligatorio | Obligatorio |
| fecha | Fecha real en formato YYYY-MM-DD y con anticipación suficiente. | Obligatorio | Obligatorio |
| pedido | Una de las opciones admitidas. | Obligatorio | Obligatorio |
| tipoEvento | Vacío, Cumpleaños, Reunión u Otro. | Opcional | Obligatorio |
| cantidadPersonas | Entero positivo; admite número o texto numérico. | Opcional | Obligatorio |
| detalles | Texto de hasta 1000 caracteres después de quitar espacios exteriores. | Opcional | Obligatorio |

El email reemplaza al campo WhatsApp.

Antes de validar el correo, se eliminan los espacios exteriores y se convierte a minúsculas. Los espacios internos no se admiten.

El email es un dato de contacto. No determina la cuenta propietaria del pedido y guardarlo no envía un correo automáticamente.

La cantidad de personas se guarda como número. Si se omite al crear, el valor por defecto es 1.

Se rechazan campos desconocidos.

### Opciones de pedido

- Torta
- Medialunas
- Desayuno
- Panes
- Mesa dulce
- Comida saludable
- Otro pedido

### Fecha y anticipación

Las tortas y medialunas requieren al menos cinco días de anticipación.

Las demás opciones admiten fechas desde hoy.

El backend calcula hoy según Buenos Aires. La fecha se almacena como texto para conservar el día elegido.

Las mismas reglas se aplican en POST y PUT. Un PUT puede rechazarse si la fecha del pedido ya no cumple la anticipación vigente.

## Crear pedido

```text
POST /api/pedidos
```

Requiere sesión de cliente y estos encabezados:

```text
Content-Type: application/json
Authorization: Bearer TOKEN_CLIENTE
```

Ejemplo:

```json
{
  "nombre": "Cliente de ejemplo",
  "email": "cliente@example.com",
  "fecha": "2026-12-20",
  "tipoEvento": "Cumpleaños",
  "pedido": "Torta",
  "cantidadPersonas": 10,
  "detalles": "Consultar sabores y presupuesto"
}
```

Reemplazar la fecha del ejemplo por una válida al momento de usarlo.

No enviar cliente ni estado. El backend obtiene el cliente de la sesión y asigna el estado nuevo.

Respuesta exitosa: HTTP 201.

```json
{
  "message": "Consulta recibida. Lara confirmará disponibilidad y presupuesto",
  "pedido": {
    "id": "ID_GENERADO",
    "estado": "nuevo"
  }
}
```

La creación devuelve únicamente el ID y el estado del pedido, además del mensaje.

### Errores de validación

Los datos inválidos responden HTTP 400.

Ejemplo de falta de anticipación:

```json
{
  "message": "Los datos enviados no son válidos",
  "errores": [
    {
      "campo": "fecha",
      "mensaje": "Las tortas y medialunas requieren al menos 5 días de anticipación"
    }
  ]
}
```

Sin un token válido de cliente, responde 401.

### Límite de creación

La ruta está configurada para admitir 10 solicitudes por IP en una ventana de 15 minutos, después de autenticar al cliente.

Los intentos que llegan a la validación de datos también cuentan.

Al superar el límite, la respuesta configurada es 429. La observación de ese límite y la recuperación posterior siguen pendientes de verificación.

## Consultar pedidos propios

```text
GET /api/pedidos/mis-pedidos
```

Requiere:

```text
Authorization: Bearer TOKEN_CLIENTE
```

El backend filtra por la cuenta autenticada. No se envía un ID de cliente en el cuerpo ni en la URL.

Respuesta exitosa: HTTP 200 con un objeto que contiene pedidos.

Si no hay pedidos:

```json
{
  "pedidos": []
}
```

Cuando existen pedidos, la lista incluye sus datos, estado y vínculo con el cliente.

Las modificaciones administrativas se reflejan en esta consulta.

Un cliente no puede utilizar la ruta administrativa por ID, aunque el pedido sea propio. Debe consultar mis-pedidos.

La separación depende del cliente autenticado, incluso cuando dos pedidos tienen el mismo email de contacto.

## Administración

Todas las rutas administrativas requieren:

```text
Authorization: Bearer TOKEN_ADMIN
```

El token se obtiene con POST /api/auth/login.

Las operaciones exitosas responden 200.

El listado devuelve un objeto con pedidos. La consulta individual devuelve un objeto con pedido.

Después de superar la autenticación:

- Un ID mal formado responde 400.
- Un pedido inexistente responde 404.

### Actualizar con PUT

```text
PUT /api/pedidos/:id
```

Enviar los siete campos:

```json
{
  "nombre": "Cliente actualizado",
  "email": "actualizado@example.com",
  "fecha": "2026-12-20",
  "tipoEvento": "",
  "pedido": "Torta",
  "cantidadPersonas": 20,
  "detalles": ""
}
```

Revisar la fecha antes de usar el ejemplo.

Todos los campos son obligatorios. tipoEvento y detalles pueden ser textos vacíos.

PUT conserva:

- Cliente vinculado.
- ID.
- Estado actual.
- createdAt.

No admite cliente ni estado en el cuerpo.

Respuesta exitosa: HTTP 200 con el mensaje Datos del pedido actualizados correctamente y el objeto pedido actualizado.

El cliente puede ver los cambios desde mis-pedidos.

### Cambiar estado

```text
PATCH /api/pedidos/:id/estado
```

Enviar:

```json
{
  "estado": "pendiente"
}
```

Estados admitidos:

- nuevo
- pendiente
- confirmado
- entregado
- cancelado

Actualmente se permite cambiar entre cualquiera de estos estados.

Respuesta exitosa: HTTP 200 con el mensaje Estado del pedido actualizado correctamente y el pedido.

Un estado no admitido responde 400.

### Eliminar

```text
DELETE /api/pedidos/:id
```

Elimina el documento de la base.

Para conservar el historial de una consulta que no se concreta, utilizar el estado cancelado.

Respuesta exitosa: HTTP 200.

```json
{
  "message": "Pedido eliminado correctamente"
}
```

La consulta administrativa posterior por el mismo ID responde 404:

```json
{
  "message": "Pedido no encontrado"
}
```

El pedido eliminado deja de aparecer en mis-pedidos.

## Documentos anteriores

Los pedidos anteriores al cambio pueden carecer de email o de cliente vinculado.

Modificar el esquema no migra los documentos existentes. No se realizó ni verificó una migración en esta ronda.

## Pruebas con scripts

Ejecutar desde lara-backend, en otra terminal y con la API funcionando.

Usar cuentas y registros de prueba.

### CRUD con email

```bash
node scripts/probarCrudPedido.js
```

Solicita credenciales de un administrador y un cliente existente. Las contraseñas quedan ocultas al escribirlas y no se imprimen tokens.

Crea su propio pedido y verifica mediante aserciones:

- POST como cliente: 201 y estado nuevo.
- Email con espacios exteriores y mayúsculas guardado normalizado.
- Vínculo con el cliente autenticado.
- Presencia en mis-pedidos.
- Cambio administrativo a pendiente.
- PUT incompleto: 400 sin modificar el documento.
- PUT completo con un email distinto del inicial.
- Normalización del nuevo email.
- Conservación de cliente, ID, estado y createdAt.
- Visibilidad de los datos actualizados para el cliente.
- DELETE administrativo.
- Consulta posterior por ID: 404.
- Ausencia del pedido eliminado en mis-pedidos.

Resultado verificado el 19/10/2026:

```text
Prueba CRUD con email correcta: true
```

El pedido de prueba fue eliminado.

Si ocurre un error, el script intenta limpiarlo al finalizar. Si no puede, informa el ID pendiente de revisión.

Las aserciones fallidas establecen un código de salida distinto de cero.

### Separación de clientes y acceso administrativo

```bash
node scripts/probarAccesoPedidosEmail.js
```

Solicita un administrador y dos clientes existentes distintos. Oculta las contraseñas y no imprime tokens.

Crea un pedido por cliente usando el mismo email de contacto.

Verifica:

- Cada cliente ve su pedido y no ve el del otro.
- Cada pedido conserva el vínculo con su cliente.
- El administrador ve ambos pedidos.
- Ambos clientes reciben 401 en las cinco rutas administrativas.
- Los diez intentos rechazados no modifican el pedido comprobado.
- Un estado inventado responde 400 sin modificar el pedido.

Resultado verificado el 19/10/2026:

```text
Prueba de acceso a pedidos con email correcta: true
```

Los dos pedidos de prueba fueron eliminados durante la limpieza.

El rechazo de tokens cliente no constituye una prueba de expiración.

### Validación aislada del esquema

El 19/10/2026 se comprobaron seis casos para POST y seis para PUT:

| Entrada | Resultado |
|---|---|
| Correo válido | Aceptado |
| Correo en mayúsculas | Aceptado y convertido a minúsculas |
| Correo con espacios exteriores | Aceptado y normalizado |
| Correo inválido | Rechazado |
| Correo con espacios internos | Rechazado |
| Texto vacío | Rechazado |

Resultado:

```text
Validación de email correcta: true
```

Esta prueba no usa HTTP ni guarda documentos.

La normalización también se verificó mediante la API con el script de CRUD.

### Script independiente de estado inválido

```bash
node scripts/probarPedidoAdmin.js
```

Solicita credenciales administrativas y el ID de un pedido existente.

No crea ni elimina pedidos. Conserva la entrada visible de contraseña; no compartir credenciales en capturas o mensajes.

Antes del cambio a email, su resultado fue:

```text
Validación correcta: true
```

No se volvió a ejecutar ese script independiente en esta ronda. El estado inválido con email se comprobó dentro de probarAccesoPedidosEmail.js.

## Postman

Colección versionada:

[Lara Pastelería API](./postman/Lara-Pasteleria-API.postman_collection.json)

La colección contiene 51 solicitudes e incluye las cinco de Usuarios.

No contiene aserciones automatizadas. El script previo calcula fechas y no verifica resultados.

### Variables principales

| Variable | Uso |
|---|---|
| baseUrl | http://localhost:4000 |
| token | Token administrativo |
| clienteEmail | Email del primer cliente |
| clienteToken | Token del primer cliente |
| cliente2Token | Token del segundo cliente |
| pedidoID | ID del pedido de prueba |

Las variables de credenciales y la configuración completa se detallan en README.md.

Respetar pedidoID con ID en mayúsculas.

Guardar tokens sin comillas ni prefijo Bearer. Las solicitudes agregan el prefijo.

No compartir ni exportar credenciales o tokens reales.

### Fechas automáticas

El script previo calcula según Buenos Aires:

| Variable | Valor |
|---|---|
| fechaPedido | Hoy más 30 días |
| fechaSinAnticipacion | Hoy |

No hace falta definir estas variables manualmente en el entorno.

Los cuerpos de pedidos utilizan email con la variable clienteEmail.

### Flujo manual

1. Iniciar sesión como cliente y actualizar clienteToken.
2. Crear un pedido: esperar 201 y estado nuevo.
3. Guardar el ID en pedidoID.
4. Consultar mis-pedidos y verificar los datos.
5. Iniciar sesión como administrador y actualizar token.
6. Ejecutar PUT con los siete campos.
7. Verificar ID, cliente, estado y createdAt.
8. Probar una torta para hoy: esperar 400 por anticipación.
9. Cambiar el estado como administrador.
10. Eliminar el pedido.
11. Consultar el mismo ID: esperar 404.
12. Consultar mis-pedidos y comprobar que ya no aparezca.

Para repetir el flujo, crear otro pedido y actualizar pedidoID.

### Resultados con email del 19/10/2026

| Prueba | Resultado observado |
|---|---|
| Login cliente y admin | 200 |
| Crear pedido | 201 y estado nuevo |
| Consultar mis-pedidos | 200, email correcto y cliente vinculado |
| Fecha automática | 2026-11-18 |
| PUT administrativo | 200 |
| Datos actualizados por PUT | Nombre, cantidad de personas y detalles |
| Datos conservados por PUT | ID, cliente, estado nuevo y createdAt |
| Email en PUT manual | Se mantuvo el mismo correo |
| Torta sin anticipación | 400 en fecha |
| Cambio de estado | 200, pendiente |
| DELETE | 200 |
| Consulta posterior por ID | 404 |
| Mis-pedidos después del DELETE | 200 con pedidos vacío |

El pedido de prueba fue eliminado.

El cambio a un email diferente y su normalización se comprobaron con el script de CRUD. El PUT manual mantuvo el mismo correo.

Esta ronda no implica que se hayan ejecutado nuevamente las 51 solicitudes ni las pruebas de Usuarios.

## Antecedentes anteriores al cambio a email

Antes del reemplazo de WhatsApp se habían comprobado:

- Registro y login de dos clientes.
- Creación autenticada y consulta de pedidos propios.
- Rechazo de creación y consulta propia sin token.
- Separación entre pedidos de clientes.
- Rechazo de rutas administrativas con token cliente.
- Consulta administrativa y cambio de estado.
- PUT conservando cliente, ID, estado y createdAt.
- Visibilidad de los cambios para el cliente.
- Rechazo de torta sin anticipación.
- Rechazo de estado inválido sin modificar el estado anterior.
- DELETE seguido de 404 y ausencia en mis-pedidos.

Son resultados históricos. No prueban por sí solos el cambio actual a email.

Los resultados de autenticación y límites anteriores se conservan en README.md.

## Coordinación con el frontend

Yami realiza la conexión en lara-pasteleria, rama feat/panel-administrativo.

Coordinar el formulario y el store con los siete campos vigentes, incluido email.

La integración debe:

- Exigir sesión de cliente antes de crear pedidos.
- Enviar el token cliente en Authorization.
- Enviar los datos después de que el cliente revise el resumen.
- Mostrar el estado de envío y evitar clics repetidos.
- Mostrar los errores de validación junto a sus campos.
- Confirmar la recepción únicamente después de un HTTP 201.
- Aclarar que recibir la consulta no confirma una reserva.
- Permitir consultar los pedidos propios.
- Manejar el vencimiento de sesión solicitando un nuevo login.
- Usar sesión administrativa para las operaciones del panel.

No enviar el ID del cliente desde el formulario.

Guardar el email de contacto no implica enviar un correo.

El estado actual del frontend no se verificó durante esta ronda de backend.

## Pendientes

- Revisar los cambios e integrarlos a main mediante PR.
- Verificar el límite de creación de pedidos.
- Comprobar la recuperación después de las ventanas de bloqueo.
- Definir y revisar otros escenarios concretos de autenticación.
- Completar la verificación de Usuarios en Postman.
- Conservar la colección completa al exportar.
- Revisar CORS y variables para deploy.
- Revisar acceso a Atlas y configuración de proxy para rate limiting.
- Probar la integración desde la web publicada.