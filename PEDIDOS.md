# API de pedidos

La API recibe consultas por encargo. Recibir una consulta no confirma una reserva: Lara coordina disponibilidad y presupuesto.

## Crear una consulta

`POST /api/pedidos`

Acceso público. Enviar `Content-Type: application/json`.

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

No enviar `estado`: el backend asigna `nuevo`. Se rechazan campos desconocidos.

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

El envío permite 10 solicitudes por IP en una ventana de 15 minutos. Los intentos inválidos también cuentan. Al superar el límite responde 429.

## Administración

Estas rutas requieren una cuenta administradora activa y el encabezado:

```text
Authorization: Bearer TOKEN
```

| Método | Ruta | Acción |
|---|---|---|
| GET | /api/pedidos | Listar pedidos. |
| GET | /api/pedidos/:id | Obtener un pedido. |
| PUT | /api/pedidos/:id | Actualizar todos los datos del formulario. |
| PATCH | /api/pedidos/:id/estado | Cambiar el estado. |
| DELETE | /api/pedidos/:id | Eliminar el pedido de la base. |

Las operaciones exitosas responden 200.

El listado devuelve un objeto con `pedidos` y ordena primero los más recientes. La consulta por ID devuelve un objeto con `pedido`.

Sin sesión válida responde 401; sin permisos de administración, 403. Un ID mal formado responde 400 y un pedido inexistente, 404.

### Actualizar datos con PUT

Enviar los siete campos del formulario:

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

PUT conserva el ID, la fecha de creación y el estado actual. No admite `estado` en el cuerpo.

La respuesta incluye el mensaje `Datos del pedido actualizados correctamente` y el objeto `pedido` actualizado.

### Cambiar el estado

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

La respuesta incluye el mensaje `Estado del pedido actualizado correctamente` y el objeto `pedido`.

### Eliminar

DELETE elimina el pedido de la base. Para conservar el historial de una consulta que no se concreta, usar el estado `cancelado`.

Respuesta exitosa:

```json
{
  "message": "Pedido eliminado correctamente"
}
```

Una consulta posterior por ese ID responde 404.

## Integración pendiente con React

El formulario actual de lara-pasteleria prepara un mensaje para WhatsApp y todavía no llama a esta API.

Conservar los nombres de los campos de `usePedidoStore.js`. Al conectar:

- Enviar la consulta después de que el cliente revise el resumen.
- Mostrar un estado de envío y evitar clics repetidos.
- Mostrar los errores de validación junto a sus campos.
- Mostrar la recepción solo después del HTTP 201.
- Aclarar que la recepción no confirma una reserva.
- Ajustar los textos que indican que la consulta se envía por WhatsApp.

## Pruebas manuales

Con `pnpm dev` funcionando, ejecutar en otra terminal.

### Validar un estado inválido

```bash
node scripts/probarPedidoAdmin.js
```

Ingresar las credenciales y el ID de un pedido de prueba existente.

Comprueba que un estado inválido responda 400 y que el estado guardado se conserve.

### Probar PUT y DELETE

```bash
node scripts/probarCrudPedido.js
```

Crea un pedido de prueba y comprueba:

- PUT incompleto responde 400.
- PUT completo guarda los datos.
- El estado, el ID y la fecha de creación se conservan.
- DELETE elimina el pedido.
- Consultarlo después responde 404.

El script retira el pedido de prueba al terminar. Si falla la limpieza, muestra el ID pendiente.

Los scripts no imprimen el token. La contraseña se ve mientras se escribe: no compartir credenciales en capturas ni mensajes.