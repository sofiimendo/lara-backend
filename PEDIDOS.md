# API de pedidos

El formulario de la landing envía una consulta por encargo. Recibirla no confirma una reserva: Lara coordina disponibilidad y presupuesto.

## Crear una consulta

`POST /api/pedidos`

Acceso público. Enviar `Content-Type: application/json`.

Ejemplo de cuerpo:

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

| Campo | Regla |
|---|---|
| nombre | Obligatorio, entre 2 y 80 caracteres. |
| whatsapp | Obligatorio, entre 8 y 15 dígitos; admite espacios, guiones, paréntesis y un + inicial. Máximo 25 caracteres. |
| fecha | Obligatoria, fecha real en formato YYYY-MM-DD. |
| pedido | Obligatorio, una de las opciones admitidas. |
| tipoEvento | Opcional: vacío, Cumpleaños, Reunión u Otro. |
| cantidadPersonas | Opcional, entero positivo. Admite número o texto numérico; se guarda como número. Por defecto: 1. |
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

No enviar `estado`: el backend asigna `nuevo`. Los campos desconocidos se rechazan.

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

Todas estas rutas requieren una cuenta administradora activa y el encabezado:

```text
Authorization: Bearer TOKEN
```

| Método | Ruta | Respuesta exitosa |
|---|---|---|
| GET | /api/pedidos | 200, objeto con `pedidos` como lista. |
| GET | /api/pedidos/:id | 200, objeto con `pedido`. |
| PATCH | /api/pedidos/:id/estado | 200, mensaje y `pedido` actualizado. |

El listado ordena primero los pedidos más recientes.

Para cambiar un estado, enviar JSON:

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

Actualmente se permite cambiar entre cualquiera de estos estados. No existe una ruta para eliminar pedidos.

Sin sesión válida responde 401; sin permisos de administración, 403. Un ID mal formado responde 400 y un pedido inexistente, 404.

## Integración pendiente con React

El formulario actual prepara un mensaje para WhatsApp y todavía no llama a esta API.

Conservar los nombres de los campos de `usePedidoStore.js`. Al conectar:

- Enviar la consulta después de que el cliente revise el resumen.
- Mostrar un estado de envío y evitar clics repetidos.
- Mostrar los errores de validación junto a sus campos.
- Mostrar la confirmación de recepción solo después del HTTP 201.
- Aclarar que la recepción no confirma una reserva.
- Ajustar los textos actuales que indican que la consulta se envía por WhatsApp.

## Prueba manual de administración

Con `pnpm dev` funcionando, ejecutar en otra terminal:

```bash
node scripts/probarPedidoAdmin.js
```

Ingresar las credenciales y el ID de un pedido de prueba existente.

La versión actual verifica que un estado inválido responda 400 y que el estado guardado se conserve. No imprime el token.

La contraseña se ve mientras se escribe. No compartir las credenciales en capturas o mensajes.