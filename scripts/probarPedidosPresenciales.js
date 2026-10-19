import assert from 'node:assert/strict'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { stdin, stdout } from 'node:process'

let ocultarSalida = false
let headersAdmin
const pendientes = new Set()
const baseURL = 'http://localhost:4000/api'

const salida = new Writable({
  write(contenido, codificacion, callback) {
    if (!ocultarSalida) stdout.write(contenido, codificacion)
    callback()
  },
})

const terminal = createInterface({
  input: stdin,
  output: salida,
  terminal: true,
})

async function solicitar(ruta, opciones = {}, esperado = 200) {
  const respuesta = await fetch(`${baseURL}${ruta}`, opciones)
  const datos = await respuesta.json()

  assert.equal(
    respuesta.status,
    esperado,
    `${opciones.method || 'GET'} ${ruta}: esperado ${esperado}, recibido ${respuesta.status}. ${datos.message || ''}`
  )

  return datos
}

async function password(mensaje) {
  stdout.write(mensaje)
  ocultarSalida = true

  try {
    return await terminal.question('')
  } finally {
    ocultarSalida = false
    stdout.write('\n')
  }
}

async function login(etiqueta, ruta) {
  const email = await terminal.question(`Email ${etiqueta}: `)
  const clave = await password(`Contraseña ${etiqueta}: `)

  const datos = await solicitar(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      password: clave,
    }),
  })

  assert.equal(typeof datos.token, 'string')
  assert.ok(datos.token.length > 0)

  return {
    datos,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${datos.token}`,
    },
  }
}

function escribir(method, headers, datos) {
  return {
    method,
    headers,
    body: JSON.stringify(datos),
  }
}

function fechaBuenosAires() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const obtener = tipo => partes.find(p => p.type === tipo).value

  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`
}

async function crear(datos) {
  const resultado = await solicitar(
    '/pedidos/admin',
    escribir('POST', headersAdmin, datos),
    201
  )

  const id = resultado.pedido?._id

  assert.equal(typeof id, 'string', 'Falta el ID del pedido')
  assert.ok(id.length > 0)
  pendientes.add(id)

  return resultado.pedido
}

async function probar() {
  const admin = await login('del administrador', '/auth/login')
  headersAdmin = admin.headers

  const cliente = await login('del cliente', '/clientes/login')
  const adminId = admin.datos.usuario?.id || admin.datos.usuario?._id

  assert.equal(typeof adminId, 'string', 'Falta el ID del administrador')
  assert.ok(adminId.length > 0)

  const hoy = fechaBuenosAires()
  const futura = new Date(`${hoy}T12:00:00Z`)
  futura.setUTCDate(futura.getUTCDate() + 30)

  const base = {
    nombre: 'Prueba presencial API',
    email: '',
    telefono: '11 1234 5678',
    fecha: futura.toISOString().slice(0, 10),
    pedido: 'Torta',
    tipoEvento: '',
    cantidadPersonas: 10,
    detalles: 'Pedido temporal de prueba',
  }

  await solicitar(
    '/pedidos/admin',
    escribir('POST', { 'Content-Type': 'application/json' }, base),
    401
  )

  await solicitar(
    '/pedidos/admin',
    escribir('POST', cliente.headers, base),
    401
  )

  console.log('Sin sesión y con token cliente: 401')

  await solicitar(
    '/pedidos/admin',
    escribir('POST', headersAdmin, { ...base, telefono: '' }),
    400
  )

  await solicitar(
    '/pedidos/admin',
    escribir('POST', headersAdmin, { ...base, creadoPor: adminId }),
    400
  )

  console.log('Sin contacto y con creador enviado en el cuerpo: 400')

  const inicial = await crear(base)
  const id = inicial._id

  assert.equal(inicial.origen, 'presencial')
  assert.equal(inicial.creadoPor, adminId)
  assert.ok(!inicial.cliente, 'El pedido tiene una cuenta cliente vinculada')
  assert.equal(inicial.email, '')
  assert.equal(inicial.telefono, base.telefono)
  assert.equal(inicial.estado, 'nuevo')
  assert.ok(inicial.createdAt)

  console.log('Creación con teléfono y sin cuenta cliente: correcta')

  const listado = await solicitar('/pedidos', { headers: headersAdmin })
  assert.ok(Array.isArray(listado.pedidos))
  assert.ok(listado.pedidos.some(p => p._id === id))

  const propios = await solicitar('/pedidos/mis-pedidos', {
    headers: cliente.headers,
  })

  assert.ok(Array.isArray(propios.pedidos))
  assert.ok(!propios.pedidos.some(p => p._id === id))

  console.log('Visible para admin y ausente en pedidos propios del cliente')

  await solicitar(
    `/pedidos/${id}/estado`,
    escribir('PATCH', headersAdmin, { estado: 'pendiente' })
  )

  const antes = await solicitar(`/pedidos/${id}`, {
    headers: headersAdmin,
  })

  await solicitar(
    `/pedidos/${id}`,
    escribir('PUT', headersAdmin, { nombre: 'Incompleto' }),
    400
  )

  await solicitar(
    `/pedidos/${id}`,
    escribir('PUT', headersAdmin, { ...base, telefono: '' }),
    400
  )

  const sinCambios = await solicitar(`/pedidos/${id}`, {
    headers: headersAdmin,
  })

  assert.deepEqual(sinCambios.pedido, antes.pedido)
  console.log('PUT incompleto y sin contacto: 400 sin cambios')

  const editado = await solicitar(
    `/pedidos/${id}`,
    escribir('PUT', headersAdmin, {
      ...base,
      nombre: 'Presencial editado',
      email: '  PRESENCIAL@EXAMPLE.COM  ',
      telefono: '',
    })
  )

  assert.equal(editado.pedido.email, 'presencial@example.com')
  assert.equal(editado.pedido.telefono, '')
  assert.equal(editado.pedido.nombre, 'Presencial editado')
  assert.equal(editado.pedido._id, id)
  assert.equal(editado.pedido.origen, 'presencial')
  assert.equal(editado.pedido.creadoPor, adminId)
  assert.equal(editado.pedido.estado, 'pendiente')
  assert.equal(editado.pedido.createdAt, inicial.createdAt)
  assert.ok(!editado.pedido.cliente)

  console.log('PUT cambia teléfono por email y conserva los datos protegidos')

  await solicitar(
    '/pedidos/admin',
    escribir('POST', headersAdmin, { ...base, fecha: hoy }),
    400
  )

  const urgente = await crear({
    ...base,
    fecha: hoy,
    confirmarAnticipacion: true,
  })

  assert.equal(urgente.fecha, hoy)
  assert.equal(urgente.origen, 'presencial')

  console.log('Torta para hoy: exige confirmación y se crea al confirmarla')

  const ayer = new Date(`${hoy}T12:00:00Z`)
  ayer.setUTCDate(ayer.getUTCDate() - 1)

  await solicitar(
    '/pedidos/admin',
    escribir('POST', headersAdmin, {
      ...base,
      fecha: ayer.toISOString().slice(0, 10),
      confirmarAnticipacion: true,
    }),
    400
  )

  console.log('Fecha pasada: 400 incluso con confirmación')
}

try {
  await probar()
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  for (const id of pendientes) {
    try {
      await solicitar(`/pedidos/${id}`, {
        method: 'DELETE',
        headers: headersAdmin,
      })

      await solicitar(
        `/pedidos/${id}`,
        { headers: headersAdmin },
        404
      )

      console.log('Pedido de prueba eliminado y consulta posterior 404:', id)
    } catch (error) {
      console.error('Revisá el pedido de prueba:', id, error.message)
      process.exitCode = 1
    }
  }

  terminal.close()
}

if (!process.exitCode) {
  console.log('Prueba de pedidos presenciales correcta: true')
}