import { z } from 'zod'

const opcionesPedido = [
  'Torta',
  'Medialunas',
  'Desayuno',
  'Panes',
  'Mesa dulce',
  'Comida saludable',
  'Otro pedido',
]

function fechaValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }

  const fecha = new Date(`${valor}T12:00:00Z`)

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor
  )
}

function obtenerFechaMinima(pedido) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const obtener = (tipo) =>
    partes.find((parte) => parte.type === tipo).value

  const hoy = `${obtener('year')}-${obtener('month')}-${obtener('day')}`
  const fecha = new Date(`${hoy}T12:00:00Z`)

  if (pedido === 'Torta' || pedido === 'Medialunas') {
    fecha.setUTCDate(fecha.getUTCDate() + 5)
  }

  return fecha.toISOString().slice(0, 10)
}

function validarAnticipacion(datos, contexto) {
  if (!fechaValida(datos.fecha)) return

  if (datos.fecha < obtenerFechaMinima(datos.pedido)) {
    const requiereAnticipacion =
      datos.pedido === 'Torta' || datos.pedido === 'Medialunas'

    contexto.addIssue({
      code: 'custom',
      path: ['fecha'],
      message: requiereAnticipacion
        ? 'Las tortas y medialunas requieren al menos 5 días de anticipación'
        : 'La fecha no puede ser anterior a hoy',
    })
  }
}

const cantidadPersonasSchema = z
  .union([
    z.number(),
    z.string().trim().regex(/^\d+$/, 'Ingresá una cantidad válida'),
  ])
  .transform((valor) => Number(valor))
  .pipe(
    z.number()
      .int('La cantidad debe ser un número entero')
      .min(1, 'La cantidad debe ser al menos 1')
      .max(Number.MAX_SAFE_INTEGER, 'La cantidad es demasiado grande')
  )

const camposPedido = {
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z.email('Ingresá un correo electrónico válido')
        .max(254, 'El correo electrónico es demasiado largo')
    ),

  fecha: z
    .string()
    .refine(fechaValida, 'Seleccioná una fecha válida'),

  tipoEvento: z.enum(['', 'Cumpleaños', 'Reunión', 'Otro']),

  pedido: z.enum(opcionesPedido),

  cantidadPersonas: cantidadPersonasSchema,

  detalles: z
    .string()
    .trim()
    .max(1000, 'Los detalles no pueden superar los 1000 caracteres'),
}

export const crearPedidoSchema = z
  .strictObject({
    nombre: camposPedido.nombre,
    email: camposPedido.email,
    fecha: camposPedido.fecha,
    tipoEvento: camposPedido.tipoEvento.optional(),
    pedido: camposPedido.pedido,
    cantidadPersonas: camposPedido.cantidadPersonas.optional(),
    detalles: camposPedido.detalles.optional(),
  })
  .superRefine(validarAnticipacion)

export const reemplazarPedidoSchema = z
  .strictObject(camposPedido)
  .superRefine(validarAnticipacion)

export const actualizarEstadoPedidoSchema = z.strictObject({
  estado: z.enum([
    'nuevo',
    'pendiente',
    'confirmado',
    'entregado',
    'cancelado',
  ]),
})