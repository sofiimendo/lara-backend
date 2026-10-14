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

export const crearPedidoSchema = z
  .strictObject({
    nombre: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(80, 'El nombre no puede superar los 80 caracteres'),
    whatsapp: z
      .string()
      .trim()
      .max(25, 'El WhatsApp no puede superar los 25 caracteres')
      .refine(
        (valor) => {
          const digitos = valor.replace(/\D/g, '')

          return (
            /^\+?[0-9\s()-]+$/.test(valor) &&
            digitos.length >= 8 &&
            digitos.length <= 15
          )
        },
        'Ingresá un WhatsApp válido, con código de área'
      ),
    fecha: z
      .string()
      .refine(fechaValida, 'Seleccioná una fecha válida'),
    tipoEvento: z
      .enum(['', 'Cumpleaños', 'Reunión', 'Otro'])
      .optional(),
    pedido: z.enum(opcionesPedido),
    cantidadPersonas: cantidadPersonasSchema.optional(),
    detalles: z
      .string()
      .trim()
      .max(1000, 'Los detalles no pueden superar los 1000 caracteres')
      .optional(),
  })
  .superRefine((datos, contexto) => {
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
  })

export const actualizarEstadoPedidoSchema = z.strictObject({
  estado: z.enum([
    'nuevo',
    'pendiente',
    'confirmado',
    'entregado',
    'cancelado',
  ]),
})