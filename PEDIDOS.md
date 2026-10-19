# API de pedidos

La API recibe consultas por encargo. Recibir una consulta no confirma una reserva: Lara coordina disponibilidad y presupuesto.

Los clientes pueden crear consultas y consultar sus propios pedidos. La administración de pedidos requiere una cuenta administradora activa.

## Autenticación de clientes

Para crear pedidos y consultar los propios, el cliente debe registrarse e iniciar sesión:

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/clientes/registro | Registrar una cuenta cliente. |
| POST | /api/clientes/login | Iniciar sesión como cliente. |

Registro y login reciben `email` y `password`. El registro también exige `nombre`.

El login devuelve un token de cliente con una duración de una hora y audiencia `lara-cliente`.

Enviar ese token en las rutas de cliente:

```text
Authorization: Bearer TOKEN_CLIENTE
```

El backend verifica el token, su audiencia y que la cuenta siga activa y tenga rol cliente.

## Crear una consulta

`POST /api/pedidos`

Requiere una sesión válida de cliente y los encabezados:

```text
Content-Type: application/json
Authorization: Bearer TOKEN_CLIENTE
```

Ejemplo:

```json
{
  "nombre": "Cliente de ejemplo",
  "whatsapp": "11 1234 5678",
  "fecha": "2026-12-20",
  "tipoEvento": "Cumpleaños",
  "pedido": "Torta",
  "cantidadPersonas": "10",
  "detalles": "Consultar sabores y presupuesto"
}
```

La fecha del ejemplo debe reemplazarse por una que cumpla las reglas al momento de probar.

| Campo | Regla |
|---|---|
| nombre | Obligatorio, entre 2 y 80 caracteres. |
| whatsapp | Obligatorio, entre 8 y 15 dígitos. Admite espacios, guiones, paréntesis y un + inicial. Máximo 25 caracteres. |
| fecha | Obligatoria, fecha real en formato YYYY-MM-DD. |
| pedido | Obligatorio, una de las opciones admitidas. |
| tipoEvento | Opcional: vacío, Cumpleaños, Reunión u Otro. |
| cantidadPersonas | Opcional, entero positivo. Admite número o texto numérico y se guarda como número. Por defecto: 1. |
| detalles | Opcional, máximo 1000 caracteres. |

Opciones de pedido:

- Torta
- Medialunas
- Desayuno
- Panes
- Mesa dulce
- Comida saludable
- Otro pedido

Tortas y medialunas requieren al menos 5 días de anticipación. Las demás opciones admiten desde hoy. El backend calcula hoy usando la zona horaria de Buenos Aires.

La fecha se guarda como texto para conservar el día elegido.

No enviar `estado`: el backend asigna `nuevo`.

No enviar `cliente`: el backend toma el ID desde la sesión autenticada y vincula el pedido con esa cuenta.

Se rechazan campos desconocidos.

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

Datos inválidos: HTTP 400.

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

El envío permite 10 solicitudes por IP en una ventana de 15 minutos. El límite se aplica después de autenticar al cliente; los intentos que llegan a la validación de datos también cuentan. Al superar el límite responde 429.

## Consultar pedidos propios

`GET /api/pedidos/mis-pedidos`

Requiere:

```text
Authorization: Bearer TOKEN_CLIENTE
```

El backend filtra los pedidos usando la cuenta autenticada. No se envía un ID de cliente en el cuerpo ni en la URL.

Respuesta exitosa: HTTP 200 con un objeto que contiene `pedidos`.

Si la cuenta no tiene pedidos:

```json
{
  "pedidos": []
}
```

Si tiene pedidos, la lista incluye sus datos, estado y vínculo con el cliente. Las modificaciones administrativas se reflejan en esta consulta.

Sin un token válido de cliente, responde 401.

Un cliente no puede usar la ruta administrativa `/api/pedidos/:id` para consultar un pedido, aunque sea propio. Debe usar `mis-pedidos`.

Los pedidos antiguos pueden no tener un cliente vinculado.

## Administración

Estas rutas requieren una cuenta administradora activa y el encabezado:

```text
Authorization: Bearer TOKEN_ADMIN
```

El token administrativo se obtiene mediante `POST /api/auth/login`.

| Método | Ruta | Acción |
|---|---|---|
| GET | /api/pedidos | Listar pedidos. |
| GET | /api/pedidos/:id | Obtener un pedido. |
| PUT | /api/pedidos/:id | Actualizar todos los datos del formulario. |
| PATCH | /api/pedidos/:id/estado | Cambiar el estado. |
| DELETE | /api/pedidos/:id | Eliminar el pedido de la base. |

Las operaciones exitosas responden 200.

El listado devuelve un objeto con `pedidos` y ordena primero los más recientes. La consulta por ID devuelve un objeto con `pedido`.

Sin sesión administrativa válida responde 401. En las pruebas, el token de cliente fue rechazado con 401 al consultar rutas administrativas o intentar cambiar un estado.

Un ID mal formado responde 400 y un pedido inexistente, 404, después de superar la autenticación administrativa.

### Actualizar datos con PUT

`PUT /api/pedidos/:id`

Enviar `Content-Type: application/json`, el token administrativo y los siete campos del formulario:

```json
{
  "nombre": "Cliente actualizado",
  "whatsapp": "11 1234 5678",
  "fecha": "2026-12-20",
  "tipoEvento": "",
  "pedido": "Torta",
  "cantidadPersonas": 20,
  "detalles": ""
}
```

Todos los campos son obligatorios para PUT. `tipoEvento` y `detalles` pueden ser textos vacíos.

Se aplican las mismas reglas de teléfono, fecha y anticipación que al crear. Por eso, PUT no permite editar un pedido con una fecha pasada o sin la anticipación mínima vigente.

PUT conserva:

- El vínculo con el cliente.
- El ID.
- La fecha de creación.
- El estado actual.

No admite `estado` ni `cliente` en el cuerpo.

La respuesta incluye el mensaje `Datos del pedido actualizados correctamente` y el objeto `pedido` actualizado.

Después de la actualización, el cliente puede ver los cambios desde `mis-pedidos`.

### Cambiar el estado

`PATCH /api/pedidos/:id/estado`

Enviar `Content-Type: application/json`, el token administrativo y:

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

La respuesta incluye el mensaje `Estado del pedido actualizado correctamente` y el objeto `pedido`.

El cliente puede consultar el nuevo estado desde `mis-pedidos`.

Un estado no admitido responde 400. Se verificó que enviar `inventado` conserva el estado anterior del pedido.

### Eliminar

`DELETE /api/pedidos/:id`

DELETE elimina el pedido de la base. Para conservar el historial de una consulta que no se concreta, usar el estado `cancelado`.

Respuesta exitosa: HTTP 200.

```json
{
  "message": "Pedido eliminado correctamente"
}
```

Una consulta administrativa posterior por ese ID responde 404:

```json
{
  "message": "Pedido no encontrado"
}
```

El pedido eliminado también deja de aparecer en `mis-pedidos`.

## Integración pendiente con React

El formulario actual de lara-pasteleria prepara un mensaje para WhatsApp y todavía no llama a esta API.

Conservar los nombres de los campos de `usePedidoStore.js`. Al conectar:

- Incorporar el registro y login de clientes.
- Exigir una sesión de cliente antes de enviar la consulta.
- Enviar el token de cliente en el encabezado Authorization.
- Enviar la consulta después de que el cliente revise el resumen.
- Mostrar un estado de envío y evitar clics repetidos.
- Mostrar los errores de validación junto a sus campos.
- Mostrar la recepción solo después del HTTP 201.
- Aclarar que la recepción no confirma una reserva.
- Ajustar los textos que indican que la consulta se envía por WhatsApp.
- Permitir consultar los pedidos propios mediante `mis-pedidos`.
- Manejar el vencimiento de la sesión solicitando un nuevo login.

Las operaciones del panel administrativo deben usar una sesión administrativa.

No enviar el ID del cliente desde el formulario: el backend lo obtiene de la sesión.

## Pruebas manuales con Postman

Con `pnpm dev` funcionando, usar la colección:

[Postman — Lara Pastelería API](./postman/Lara-Pasteleria-API.postman_collection.json)

Las instrucciones completas de configuración y ejecución están en [README.md](./README.md).

Variables principales:

| Variable | Uso |
|---|---|
| baseUrl | Dirección de la API. Localmente: http://localhost:4000. |
| token | Token administrativo. |
| clienteToken | Token del primer cliente. |
| cliente2Token | Token del segundo cliente. |
| pedidoID | ID del pedido de prueba actual. |

Guardar credenciales y tokens únicamente como valores locales. No compartirlos ni exportar el entorno con datos reales.

### Flujo de comprobación

1. Iniciar sesión como cliente y guardar `clienteToken`.
2. Crear un pedido con una fecha válida: esperar 201.
3. Guardar el ID recibido en `pedidoID`.
4. Consultar `mis-pedidos` y verificar que incluya el pedido.
5. Iniciar sesión como administrador y guardar `token`.
6. Consultar el pedido por ID y cambiar su estado a `pendiente`.
7. Consultar `mis-pedidos` como cliente y comprobar el estado.
8. Ejecutar PUT como administrador con los siete campos.
9. Verificar que conserve cliente, ID, estado y `createdAt`.
10. Consultar `mis-pedidos` y comprobar que el cliente vea los datos actualizados.
11. Eliminar el pedido como administrador.
12. Consultar el mismo ID como administrador: esperar 404.
13. Consultar `mis-pedidos` y comprobar que el pedido eliminado ya no figure.

Ajustar las fechas de los ejemplos antes de ejecutar. Si un token vence, repetir el login correspondiente y actualizar su variable.

Para repetir el flujo después del DELETE, crear un pedido nuevo y actualizar `pedidoID`.

### Resultados verificados tras integrar clientes

- Registro y login de dos clientes.
- Creación autenticada de pedido: 201, estado `nuevo` y vínculo con el primer cliente.
- Consulta de pedidos propios: 200.
- Creación y consulta de pedidos propios sin token: 401.
- La creación rechazada sin token no generó un pedido adicional.
- Listado administrativo y cambio de estado con token cliente: 401.
- Consulta por ID y cambio a `pendiente` como administrador: 200.
- El cliente vio el estado actualizado.
- El intento rechazado de cambiar el estado no alteró el estado ni la fecha de actualización.
- El segundo cliente recibió una lista vacía y no pudo consultar el pedido por la ruta administrativa.
- Torta sin anticipación con token cliente: 400.
- PUT administrativo: 200, conservando cliente, ID, estado `pendiente` y `createdAt`.
- El cliente vio los datos actualizados mediante `mis-pedidos`.
- DELETE devolvió el mensaje `Pedido eliminado correctamente`.
- La consulta posterior por ID respondió 404 con `Pedido no encontrado`.
- La consulta posterior de pedidos propios respondió 200 con `pedidos: []`.

El pedido utilizado en estas pruebas ya fue eliminado.

Las pruebas adicionales con scripts se detallan a continuación. No implican que se haya vuelto a ejecutar toda la colección de Postman.

## Pruebas con scripts

Ambos scripts se ejecutaron correctamente después de integrar clientes.

Con `pnpm dev` funcionando, ejecutar los scripts desde otra terminal, dentro de `lara-backend`.

Usar cuentas y pedidos de prueba. Las operaciones se realizan sobre la base configurada en el servidor.

Los scripts no imprimen el token. Las contraseñas se ven mientras se escriben: no compartir credenciales en capturas ni mensajes.

### Probar PUT y DELETE con clientes

```bash
node scripts/probarCrudPedido.js
```

Solicita primero las credenciales de una cuenta administradora y después las de una cuenta cliente existente.

Crea un pedido con la sesión de cliente y utiliza la sesión administrativa para actualizarlo y eliminarlo.

Comprueba mediante aserciones:

- Creación como cliente: HTTP 201 y estado `nuevo`.
- El pedido aparece en `mis-pedidos` vinculado a la cuenta autenticada.
- El administrador puede cambiar el estado a `pendiente`.
- PUT incompleto responde 400 y no modifica el pedido.
- PUT completo guarda los siete campos.
- Se conservan cliente, ID, estado y `createdAt`.
- El cliente ve los datos actualizados en `mis-pedidos`.
- DELETE administrativo responde 200.
- La consulta posterior por ID responde 404.
- El pedido eliminado deja de aparecer en `mis-pedidos`.

Resultado verificado:

```text
Creación como cliente: correcta
Pedido vinculado al cliente y visible en mis-pedidos: correcto
PUT incompleto: 400 sin modificar el pedido
PUT completo: datos guardados correctamente
Cliente, ID, estado y fecha de creación conservados
El cliente ve los datos actualizados: correcto
DELETE como administrador: correcto
Consulta por ID después de eliminar: 404
El pedido eliminado ya no aparece en mis-pedidos
Prueba correcta: true
```

El script elimina el pedido que crea. Si ocurre un error antes de eliminarlo, intenta retirarlo al finalizar. Si la limpieza falla, informa el ID para revisarlo.

Una comprobación fallida establece un código de salida distinto de cero.

### Validar un estado inválido

```bash
node scripts/probarPedidoAdmin.js
```

Solicita credenciales administrativas y el ID de un pedido de prueba existente.

Envía el estado `inventado` y comprueba que la API responda 400 y que el estado guardado se conserve.

Resultado verificado:

```text
Estado antes: nuevo
Estado inválido HTTP: 400
Mensaje: Los datos enviados no son válidos
Estado después: nuevo
Validación correcta: true
```

Este script no crea ni elimina pedidos.

Para ejecutarlo, crear previamente un pedido con una sesión de cliente. Al terminar, eliminar ese pedido de prueba desde Postman con una sesión administrativa.

El pedido utilizado para esta comprobación se eliminó desde Postman con respuesta HTTP 200.