# API de pedidos

La API recibe consultas web y permite registrar encargos presenciales desde administración.

Recibir una consulta no confirma una reserva: Lara debe confirmar disponibilidad y presupuesto.

## Entornos

| Entorno | URL base |
|---|---|
| Local | http://localhost:4000 |
| Render | https://lara-backend-5tq4.onrender.com |

Las rutas indicadas en este documento se agregan a la URL base.

Pedidos con email se integró mediante el PR #16. Pedidos presenciales se integró mediante el PR #18.

Las pruebas locales, las pruebas en Render y la integración desde el frontend se distinguen en sus respectivas secciones.

## Autenticación

| Método | Ruta | Acción |
|---|---|---|
| POST | /api/clientes/registro | Registrar cliente. |
| POST | /api/clientes/login | Login cliente. |
| POST | /api/auth/login | Login administrativo. |

El registro requiere nombre, email y password. Los logins requieren email y password.

Los tokens duran una hora.

| Sesión | Audiencia |
|---|---|
| Cliente | lara-cliente |
| Administrador | lara-admin |

Enviar:

```text
Authorization: Bearer TOKEN
```

Se verifican token, audiencia, cuenta activa y rol.

Un token cliente vigente puede responder 200 en mis-pedidos y 401 en una ruta administrativa. Esto comprueba separación de audiencias, no vencimiento.

## Rutas

| Método | Ruta | Acción | Acceso |
|---|---|---|---|
| POST | /api/pedidos | Crear consulta web. | Cliente |
| POST | /api/pedidos/admin | Crear pedido presencial. | Admin |
| GET | /api/pedidos/mis-pedidos | Consultar pedidos propios. | Cliente |
| GET | /api/pedidos | Listar todos. | Admin |
| GET | /api/pedidos/:id | Consultar por ID. | Admin |
| PUT | /api/pedidos/:id | Reemplazar datos del formulario. | Admin |
| PATCH | /api/pedidos/:id/estado | Cambiar estado. | Admin |
| DELETE | /api/pedidos/:id | Eliminar. | Admin |

## Campos y validaciones

| Campo | Regla |
|---|---|
| nombre | Entre 2 y 80 caracteres después de quitar espacios exteriores. |
| email | Correo válido de hasta 254 caracteres; puede quedar vacío en presenciales con teléfono. |
| telefono | Exclusivo del formulario presencial; formato válido o vacío si hay email. |
| fecha | Fecha real YYYY-MM-DD. |
| pedido | Opción admitida por el esquema. |
| tipoEvento | Vacío, Cumpleaños, Reunión u Otro. |
| cantidadPersonas | Entero positivo, enviado como número o texto numérico, hasta Number.MAX_SAFE_INTEGER. |
| detalles | Máximo 1000 caracteres después de quitar espacios exteriores. |

El email se normaliza quitando espacios exteriores y convirtiéndolo a minúsculas antes de validar su formato.

cantidadPersonas se guarda como número. Su valor por defecto al crear es 1.

Guardar contactos no envía mensajes ni correos automáticamente.

Se rechazan campos desconocidos.

### Teléfono

Admite:

- Entre 8 y 15 dígitos.
- Máximo 25 caracteres.
- Espacios, guiones y paréntesis.
- Un signo + inicial.

No admite letras. Se debe ingresar con código de área; la validación de formato no comprueba que ese código sea real.

No se verifica la existencia del número ni que tenga WhatsApp.

### Opciones de pedido

- Torta
- Medialunas
- Desayuno
- Panes
- Mesa dulce
- Comida saludable
- Otro pedido

### Campos controlados por el backend

| Campo | Uso |
|---|---|
| cliente | Cuenta autenticada que creó el pedido web. |
| origen | web o presencial. |
| creadoPor | Admin que cargó el presencial. |
| estado | Estado actual; nuevo al crear. |
| createdAt | Fecha de creación. |
| updatedAt | Fecha de modificación. |

No enviar estos campos en los formularios de creación o reemplazo.

El estado se modifica exclusivamente mediante su ruta PATCH.

origen y creadoPor son inmutables en el modelo.

## Fecha y anticipación

Se utiliza la fecha de Buenos Aires y se guarda el día como texto.

### Web

Tortas y medialunas requieren al menos cinco días.

Las otras opciones admiten desde hoy.

Las reglas se aplican en POST y PUT. Una edición puede rechazarse si la fecha ya no cumple la anticipación vigente.

### Presencial

No admite fechas pasadas.

Para aceptar tortas o medialunas con menos de cinco días, el administrador debe agregar al cuerpo completo:

```json
{
  "confirmarAnticipacion": true
}
```

El panel debe solicitar confirmación explícita antes de enviarlo.

Si falta o es false cuando corresponde, responde 400 en confirmarAnticipacion.

Se aplica al crear y editar. No permite fechas pasadas.

El indicador se valida, pero no se guarda ni genera un historial de excepciones.

## Crear consulta web

```text
POST /api/pedidos
```

Requiere token cliente y Content-Type application/json.

Obligatorios:

- nombre
- email
- fecha
- pedido

Opcionales:

- tipoEvento
- cantidadPersonas
- detalles

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

Revisar la fecha antes de utilizar el ejemplo.

El backend toma cliente desde la sesión y asigna origen web y estado nuevo.

No admite telefono ni confirmarAnticipacion.

Respuesta: HTTP 201.

```json
{
  "message": "Consulta recibida. Lara confirmará disponibilidad y presupuesto",
  "pedido": {
    "id": "ID_GENERADO",
    "estado": "nuevo"
  }
}
```

### Límite web

Configurado en 10 solicitudes por IP en 15 minutos, después de autenticar.

Los intentos que llegan a validación cuentan, aunque respondan 400.

Al superar el límite, responde 429:

```json
{
  "message": "Demasiadas consultas. Volvé a intentar en 15 minutos"
}
```

Este limitador no se aplica a la creación administrativa.

### Prueba local del límite

Se enviaron cuerpos vacíos con sesión cliente válida:

- Se observaron respuestas 400 por validación.
- Se alcanzó una respuesta 429.
- Después de la ventana de bloqueo, sin reiniciar el servidor durante la espera, la misma solicitud volvió a responder 400 por validación.
- No se crearon pedidos.

No se midió el umbral exacto desde una ventana inicialmente vacía.

Esta prueba no verifica el comportamiento del limitador detrás del proxy de Render.

## Crear presencial

```text
POST /api/pedidos/admin
```

Requiere token admin y Content-Type application/json.

No exige cuenta cliente ni crea una ficticia.

Obligatorios:

- nombre
- fecha
- pedido
- Al menos un contacto: email o telefono.

Opcionales:

- tipoEvento
- cantidadPersonas
- detalles
- confirmarAnticipacion

Email y telefono pueden omitirse individualmente; se normalizan a texto vacío.

Si se completan ambos, ambos deben ser válidos.

Ejemplo:

```json
{
  "nombre": "Cliente del local",
  "email": "",
  "telefono": "11 1234 5678",
  "fecha": "2026-12-20",
  "tipoEvento": "Cumpleaños",
  "pedido": "Torta",
  "cantidadPersonas": 10,
  "detalles": "Encargo recibido en el local"
}
```

Para utilizar solo email, enviar un correo válido y telefono vacío u omitido.

Revisar la fecha antes de utilizar el ejemplo.

Respuesta: HTTP 201 con:

- message: Pedido presencial creado correctamente.
- pedido: documento completo.

El documento tiene origen presencial, creadoPor del administrador autenticado, estado nuevo y sin cliente vinculado.

La creación web devuelve pedido.id; la presencial devuelve pedido._id.

Los presenciales aparecen en el listado administrativo. No se vinculan con cuentas por coincidencia de email.

## Consultar propios

```text
GET /api/pedidos/mis-pedidos
```

Requiere token cliente.

Filtra utilizando el ID de la cuenta autenticada, no el email de contacto.

No enviar un ID de cliente en cuerpo ni URL.

Respuesta: HTTP 200 con pedidos.

```json
{
  "pedidos": []
}
```

Los cambios administrativos de pedidos web se reflejan aquí.

Un cliente no puede utilizar la consulta administrativa por ID, aunque el pedido sea propio.

Los presenciales sin cliente vinculado no aparecen en esta consulta.

## Consultas administrativas

```text
GET /api/pedidos
GET /api/pedidos/:id
```

Requieren token admin.

El listado incluye pedidos web y presenciales, ordenados por creación descendente.

Devuelve pedidos para el listado y pedido para la consulta individual.

Después de autenticar:

- ID mal formado: 400.
- Pedido inexistente: 404.

## Reemplazar con PUT

```text
PUT /api/pedidos/:id
```

Requiere token admin y Content-Type application/json.

El controlador selecciona el esquema según el origen guardado en MongoDB.

### Web: siete campos obligatorios

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

No admite telefono ni confirmarAnticipacion.

### Presencial: ocho campos obligatorios

```json
{
  "nombre": "Presencial actualizado",
  "email": "",
  "telefono": "11 1234 5678",
  "fecha": "2026-12-20",
  "tipoEvento": "",
  "pedido": "Torta",
  "cantidadPersonas": 20,
  "detalles": ""
}
```

Email y telefono deben estar presentes; uno puede quedar vacío si el otro es válido.

confirmarAnticipacion es adicional y opcional. Debe enviarse como true cuando corresponda aceptar menos anticipación.

tipoEvento y detalles pueden ser textos vacíos.

Revisar las fechas antes de utilizar los ejemplos.

### Conservación

PUT conserva, cuando existen:

- cliente
- ID
- origen
- creadoPor
- estado
- createdAt

No admite esos campos protegidos en el cuerpo.

La actualización valida el documento completo antes de guardar.

Respuesta: HTTP 200, mensaje Datos del pedido actualizados correctamente y pedido actualizado.

## Cambiar estado

```text
PATCH /api/pedidos/:id/estado
```

Requiere token admin.

```json
{
  "estado": "pendiente"
}
```

Estados:

- nuevo
- pendiente
- confirmado
- entregado
- cancelado

Se permite cambiar entre cualquiera de ellos.

Respuesta: 200 con mensaje Estado del pedido actualizado correctamente y pedido.

Estado no admitido: 400.

Aplica a pedidos web y presenciales.

## Eliminar

```text
DELETE /api/pedidos/:id
```

Requiere token admin y elimina el documento.

Para conservarlo, utilizar el estado cancelado.

Respuesta: HTTP 200.

```json
{
  "message": "Pedido eliminado correctamente"
}
```

Consultar después el mismo ID responde 404.

El pedido web eliminado deja de aparecer en mis-pedidos.

## Errores

| Caso | Respuesta |
|---|---|
| Datos inválidos o campos desconocidos | 400 |
| ID mal formado después de autenticar | 400 |
| Presencial sin contacto | 400 |
| Falta de confirmación de plazo presencial | 400 |
| Fecha pasada | 400 |
| Sin sesión válida | 401 |
| Token cliente en ruta admin | 401 por audiencia |
| Pedido inexistente después de autenticar | 404 |
| Límite de creación web superado | 429 |

Ejemplo de presencial sin contacto:

```json
{
  "message": "Los datos enviados no son válidos",
  "errores": [
    {
      "campo": "email",
      "mensaje": "Ingresá al menos un contacto: email o teléfono"
    }
  ]
}
```

## Documentos antiguos

Pueden carecer de email, origen, creadoPor o cliente.

No se realizó migración.

El controlador trata como web los documentos cuyo origen no sea presencial.

No debe inferirse que un documento sin cliente sea presencial.

## Pruebas locales verificadas el 19/10/2026

### Esquemas y modelo presenciales

Sin guardar documentos se comprobó:

- Solo teléfono, solo email y ambos válidos.
- Contactos ausentes o vacíos rechazados.
- Contactos inválidos rechazados.
- Cliente y origen en el cuerpo rechazados.
- Normalización de email.
- Web exige email y rechaza telefono.
- PUT presencial exige todos los campos.
- Modelo acepta teléfono sin email.
- Modelo rechaza ausencia de contacto.

```text
Validación presencial correcta: true
```

### Script presencial

```bash
node scripts/probarPedidosPresenciales.js
```

Utiliza administrador y cliente, oculta contraseñas y no imprime tokens.

| Comprobación | Resultado |
|---|---|
| Sin sesión o token cliente en creación admin | 401 |
| Sin contacto o creadoPor enviado en cuerpo | 400 |
| Crear con teléfono sin cuenta cliente | 201 |
| Origen y creador | Correctos |
| Listado admin | Incluye pedido |
| Mis-pedidos del cliente de prueba | No incluye presencial |
| PUT incompleto o sin contacto | 400 sin cambios |
| PUT cambia teléfono por email | 200, email normalizado |
| Datos protegidos | Conservados |
| Torta hoy sin confirmación | 400 |
| Torta hoy confirmada | 201 |
| Pasado incluso confirmado | 400 |
| Limpieza de ambos pedidos | DELETE y GET posterior 404 |

```text
Prueba de pedidos presenciales correcta: true
```

El script intenta limpiar registros aun si falla e informa IDs si no puede.

### Regresión web posterior al cambio presencial

```bash
node scripts/probarCrudPedido.js
```

Comprobó:

- Creación web autenticada.
- Normalización y cambio de email.
- Vínculo cliente y consulta propia.
- Cambio de estado.
- PUT incompleto sin cambios.
- PUT completo conservando datos protegidos.
- DELETE seguido de 404.
- Ausencia del pedido eliminado en mis-pedidos.

```text
Prueba CRUD con email correcta: true
```

El pedido fue eliminado.

### Postman presencial

La colección actualizada fue importada. Se confirmó la presencia de Pedidos presenciales y Usuarios.

Se ejecutaron las diez solicitudes de la carpeta presencial:

| Solicitud | Resultado observado |
|---|---|
| Crear presencial con telefono | 201 |
| Rechazar presencial sin token | 401 |
| Rechazar presencial con token cliente vigente | 401 |
| Rechazar presencial sin contacto | 400 en email |
| Rechazar torta para hoy sin confirmación | 400 en confirmarAnticipacion |
| Crear torta para hoy con confirmación | 201 |
| Consultar presencial por ID | 200 antes de eliminar y 404 después |
| Actualizar con email sin telefono | 200, email normalizado |
| Rechazar PUT sin contacto | 400 sin modificar datos ni updatedAt |
| Eliminar presencial | 200 |

Se verificó conservación de ID, origen, creadoPor, estado y createdAt en el PUT.

Para comprobar el rechazo administrativo del token cliente, se renovó clienteToken, se obtuvo 200 en mis-pedidos y luego 401 en creación administrativa.

Los dos pedidos creados manualmente se eliminaron y sus consultas posteriores respondieron 404.

Las respuestas 401 iniciales con sesiones no confirmadas como vigentes no se contabilizan como prueba de permisos.

Estos resultados no equivalen a ejecutar nuevamente las 61 solicitudes de la colección.

## Pruebas en Render del 19/10/2026

Las solicitudes se realizaron manualmente mediante Postman contra el backend publicado.

### Pedido web temporal

| Operación | Resultado |
|---|---|
| Crear con token cliente | 201, estado nuevo. |
| Consultar mis-pedidos | 200, pedido vinculado al cliente y origen web. |
| Consultar por ID como admin | Documento correcto. |
| Cambiar estado | 200, pendiente. |
| PUT completo | 200, datos actualizados. |
| Conservación en PUT | Cliente, ID, origen, estado pendiente y createdAt. |
| Eliminar | 200. |
| Consultar por ID después de eliminar | 404. |
| Consultar mis-pedidos después de eliminar | 200, listado vacío. |

El pedido temporal fue eliminado.

### Pedido presencial temporal

Se recibió una respuesta de creación correcta con:

- origen presencial.
- creadoPor correspondiente al administrador.
- Teléfono válido y email vacío.
- Estado nuevo.
- Sin cliente vinculado.

Después se comprobó:

| Operación | Resultado |
|---|---|
| Consultar por ID como admin | 200. |
| PUT completo | 200. |
| Cambio de contacto | Email guardado y teléfono vacío. |
| Datos editables | Nombre, cantidad y detalles actualizados. |
| Conservación | ID, origen, creadoPor, estado y createdAt. |
| Eliminar | 200. |
| Consultar después de eliminar | 404. |

El pedido temporal fue eliminado.

### Alcance

Estas pruebas verifican los flujos indicados en el entorno publicado.

No equivalen a repetir todas las pruebas locales de permisos, validaciones, anticipación, separación entre clientes o límites.

La prueba completa desde el frontend publicado sigue pendiente.

Se observaron demoras y un error de protocolo HTTP/2 en Postman durante la sesión. No se confirmó su causa. Las mediciones posteriores de health y productos respondieron en menos de un segundo.

## Pruebas anteriores

### Separación entre clientes

Antes de agregar presenciales:

```bash
node scripts/probarAccesoPedidosEmail.js
```

Verificó dos clientes con el mismo email de contacto, separación de pedidos propios, acceso admin a ambos, diez rechazos administrativos con tokens cliente y estado inválido sin cambios.

```text
Prueba de acceso a pedidos con email correcta: true
```

Ambos pedidos se eliminaron. Este script completo no se volvió a ejecutar después del cambio presencial.

### Email web aislado

Doce aserciones: seis para POST y seis para PUT.

Correos válidos, mayúsculas y espacios exteriores aceptados y normalizados. Correos inválidos, espacios internos y vacío rechazados.

```text
Validación de email correcta: true
```

### Estado inválido independiente

```bash
node scripts/probarPedidoAdmin.js
```

Resultado anterior al cambio a email:

```text
Validación correcta: true
```

No se volvió a ejecutar ese script independiente. No crea ni elimina pedidos y conserva la entrada visible de contraseña.

### Postman web anterior a presenciales

Se comprobaron login cliente/admin, creación con email, consulta propia, PUT conservando datos, anticipación, cambio de estado y eliminación seguida de 404 y listado propio vacío.

El PUT manual mantuvo el email. Su cambio se verificó mediante script.

Los antecedentes no prueban por sí solos los cambios posteriores.

## Postman: colección y variables

[Lara Pastelería API](./postman/Lara-Pasteleria-API.postman_collection.json)

La última versión contabilizada contiene:

| Grupo | Cantidad |
|---|---:|
| Autenticación admin y productos | 16 |
| Pedidos | 15 |
| Clientes y propios | 15 |
| Usuarios | 5 |
| Presenciales | 10 |
| Total | 61 |

Las 51 solicitudes originales se conservaron.

Durante las pruebas se utilizaron también solicitudes modificadas manualmente. Antes de la entrega debe revisarse la exportación final y volver a contar sus solicitudes.

No contiene aserciones automatizadas. El script previo calcula fechas, no comprueba resultados.

### Entornos

| Entorno | baseUrl |
|---|---|
| Lara Local | http://localhost:4000 |
| Lara Render | https://lara-backend-5tq4.onrender.com |

baseUrl no lleva /api al final porque las solicitudes agregan ese segmento.

### Variables de pedidos

| Variable | Uso |
|---|---|
| baseUrl | URL de la API según el entorno. |
| token | Token admin. |
| clienteEmail | Email del primer cliente. |
| clienteToken | Token del primer cliente. |
| cliente2Token | Token del segundo cliente. |
| pedidoID | Pedido web de prueba. |
| pedidoPresencialID | Pedido presencial de prueba. |

Configuración completa de variables: [README.md](./README.md).

Respetar mayúsculas y minúsculas.

No exportar credenciales ni tokens reales. No guardar respuestas de login con tokens reales en la colección compartida.

### Fechas automáticas

| Variable | Valor según Buenos Aires |
|---|---|
| fechaPedido | Hoy más 30 días. |
| fechaSinAnticipacion | Hoy. |

No definirlas manualmente cuando se utiliza el script de fechas de la colección.

Revisar cualquier fecha fija antes de repetir una prueba.

### Repetir flujo presencial

1. Login admin y actualizar token.
2. Crear con teléfono.
3. Guardar pedido._id en pedidoPresencialID.
4. Consultar.
5. Probar rechazos y comprobar que no cambió el documento.
6. Actualizar con email y teléfono vacío.
7. Verificar normalización y conservación.
8. Eliminar y comprobar 404.
9. Crear por separado para hoy con confirmación.
10. Actualizar pedidoPresencialID.
11. Eliminar también ese pedido y comprobar 404.

Para la prueba con token cliente, verificar primero que funcione en mis-pedidos.

No ejecutar toda la colección sin revisar orden y registros afectados.

## Coordinación con frontend

Yami trabaja en lara-pasteleria.

### URL base

El frontend agrega /api a sus solicitudes. Por lo tanto, la variable de Vercel debe tener:

```text
VITE_API_URL=https://lara-backend-5tq4.onrender.com
```

El frontend debe utilizar esa variable en lugar de una URL local fija y volver a desplegarse.

El backend tiene configurado como origen permitido:

```text
https://lara-pasteleria.vercel.app
```

Se comprobaron los preflight en Render:

- Origen de Vercel: 204 con Access-Control-Allow-Origin correspondiente.
- Origen ajeno: 204 sin Access-Control-Allow-Origin.
- POST y encabezados authorization,content-type permitidos para el origen configurado.

La integración completa en navegador sigue pendiente.

### Web

- POST /api/pedidos con token cliente.
- Cuatro campos obligatorios y tres opcionales al crear.
- No enviar telefono ni confirmarAnticipacion.
- Confirmar recepción después del 201.
- Aclarar que no confirma una reserva.

### Presencial

- POST /api/pedidos/admin con token admin.
- Al menos email o telefono.
- Confirmación explícita para aceptar menos anticipación.
- ID en pedido._id.
- No enviar campos protegidos.

### Edición y listado

- Elegir campos según origen.
- Web: siete campos completos en PUT.
- Presencial: ocho campos completos y confirmación cuando corresponda.
- Mostrar teléfono cuando no haya email.
- No asumir cliente vinculado en todos los pedidos.
- Cambiar estado por PATCH.
- Mostrar carga, errores y vencimiento de sesión.

La conexión presencial debe comprobarse desde el panel publicado.

## Pendientes

- Configurar VITE_API_URL en Vercel y actualizar el frontend para utilizarla.
- Probar creación y administración de pedidos desde la web publicada.
- Verificar el rate limiting detrás del proxy de Render.
- Definir y completar otros escenarios concretos de autenticación pendientes.
- Revisar y exportar la colección final conservando Usuarios y Presenciales.
- Actualizar el conteo de solicitudes después de la exportación final.

Los pedidos con email y los pedidos presenciales ya están integrados en main. Las pruebas anteriores y locales no sustituyen la verificación de la integración publicada.