import assert from 'node:assert/strict'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { stdin, stdout } from 'node:process'

let ocultarSalida = false

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

const baseURL = 'http://localhost:4000/api'
const pendientes = new Set()
let headersAdmin

async function preguntarPassword(mensaje) {
  stdout.write(mensaje)
  ocultarSalida = true

  try {
    return await terminal.question('')
  } finally {
    ocultarSalida = false
    stdout.write('\n')
  }
}

async function solicitar(ruta, opciones = {}, esperado = 200) {
  const respuesta = await fetch(`${baseURL}${ruta}`, opciones)
  const datos = await respuesta.json()

  assert.equal(
    respuesta.status,
    esperado,
    `${opciones.method || 'GET'} ${ruta}: se esperaba ${esperado}, se recibió ${respuesta.status}. ${datos.message || ''}`
  )

  return datos
}

async function iniciarSesion(etiqueta, ruta) {
  const email = await terminal.question(`Email ${etiqueta}: `)
  const password = await preguntarPassword(`Contraseña ${etiqueta}: `)

  const sesion = await solicitar(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  assert.equal(typeof sesion.token, 'string')
  assert.ok(sesion.token.length > 0)

  return {
    sesion,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sesion.token}`,
    },
  }
}

function obtenerClienteId(sesion) {
  const id = sesion.cliente?.id || sesion.cliente?._id
  assert.equal(typeof id, 'string', 'Falta el ID del cliente')
  assert.ok(id.length > 0)
  return id
}

function buscarPedido(datos, id) {
  assert.ok(Array.isArray(datos.pedidos), 'Falta el listado de pedidos')
  return datos.pedidos.find((pedido) => pedido._id === id)
}

async function crearPedido(headers, nombre, email) {
  const fecha = new Date()
  fecha.setUTCDate(fecha.getUTCDate() + 30)

  const cuerpo = {
    nombre,
    email,
    fecha: fecha.toISOString().slice(0, 10),
    tipoEvento: '',
    pedido: 'Otro pedido',
    cantidadPersonas: 1,
    detalles: 'Prueba de separación de pedidos con email',
  }

  const resultado = await solicitar('/pedidos', {
    method: 'POST',
    headers,
    body: JSON.stringify(cuerpo),
  }, 201)

  const id = resultado.pedido?.id || resultado.pedido?._id

  assert.equal(typeof id, 'string', 'Falta el ID del pedido')
  assert.ok(id.length > 0)
  pendientes.add(id)

  return { id, cuerpo }
}

try {
  console.log('Usá un administrador y dos clientes de prueba distintos.')
  console.log('Las contraseñas quedan ocultas.')

  const admin = await iniciarSesion('del administrador', '/auth/login')
  headersAdmin = admin.headers

  const cliente1 = await iniciarSesion('del cliente 1', '/clientes/login')
  const cliente2 = await iniciarSesion('del cliente 2', '/clientes/login')

  const cliente1Id = obtenerClienteId(cliente1.sesion)
  const cliente2Id = obtenerClienteId(cliente2.sesion)

  assert.notEqual(
    cliente1Id,
    cliente2Id,
    'Debés usar dos cuentas cliente distintas'
  )

  const pedido1 = await crearPedido(
    cliente1.headers,
    'Prueba acceso cliente uno',
    'acceso.compartido@example.com'
  )

  const pedido2 = await crearPedido(
    cliente2.headers,
    'Prueba acceso cliente dos',
    'acceso.compartido@example.com'
  )

  const propios1 = await solicitar('/pedidos/mis-pedidos', {
    headers: cliente1.headers,
  })

  const propios2 = await solicitar('/pedidos/mis-pedidos', {
    headers: cliente2.headers,
  })

  const propio1 = buscarPedido(propios1, pedido1.id)
  const propio2 = buscarPedido(propios2, pedido2.id)

  assert.ok(propio1, 'El cliente 1 no ve su pedido')
  assert.ok(propio2, 'El cliente 2 no ve su pedido')
  assert.equal(propio1.cliente, cliente1Id)
  assert.equal(propio2.cliente, cliente2Id)
  assert.equal(propio1.email, 'acceso.compartido@example.com')
  assert.equal(propio2.email, 'acceso.compartido@example.com')
  assert.equal(buscarPedido(propios1, pedido2.id), undefined)
  assert.equal(buscarPedido(propios2, pedido1.id), undefined)

  console.log('Cada cliente ve su pedido y no ve el del otro')
  console.log('La separación se mantiene aunque ambos pedidos usen el mismo email')

  const listadoAdmin = await solicitar('/pedidos', {
    headers: headersAdmin,
  })

  assert.ok(buscarPedido(listadoAdmin, pedido1.id))
  assert.ok(buscarPedido(listadoAdmin, pedido2.id))

  console.log('El administrador ve ambos pedidos')

  const antes = await solicitar(`/pedidos/${pedido1.id}`, {
    headers: headersAdmin,
  })

  for (const [indice, cliente] of [cliente1, cliente2].entries()) {
    await solicitar('/pedidos', {
      headers: cliente.headers,
    }, 401)

    await solicitar(`/pedidos/${pedido1.id}`, {
      headers: cliente.headers,
    }, 401)

    await solicitar(`/pedidos/${pedido1.id}`, {
      method: 'PUT',
      headers: cliente.headers,
      body: JSON.stringify({
        ...pedido1.cuerpo,
        nombre: 'Cambio no autorizado',
      }),
    }, 401)

    await solicitar(`/pedidos/${pedido1.id}/estado`, {
      method: 'PATCH',
      headers: cliente.headers,
      body: JSON.stringify({ estado: 'confirmado' }),
    }, 401)

    await solicitar(`/pedidos/${pedido1.id}`, {
      method: 'DELETE',
      headers: cliente.headers,
    }, 401)

    console.log(`Cliente ${indice + 1}: cinco rutas administrativas rechazadas con 401`)
  }

  const despues = await solicitar(`/pedidos/${pedido1.id}`, {
    headers: headersAdmin,
  })

  assert.deepEqual(
    despues.pedido,
    antes.pedido,
    'Los intentos rechazados modificaron el pedido'
  )

  console.log('Los accesos rechazados no modificaron el pedido')

  await solicitar(`/pedidos/${pedido1.id}/estado`, {
    method: 'PATCH',
    headers: headersAdmin,
    body: JSON.stringify({ estado: 'inventado' }),
  }, 400)

  const despuesEstadoInvalido = await solicitar(`/pedidos/${pedido1.id}`, {
    headers: headersAdmin,
  })

  assert.deepEqual(
    despuesEstadoInvalido.pedido,
    antes.pedido,
    'El estado inválido modificó el pedido'
  )

  console.log('Estado inválido: 400 sin modificar el pedido')
  console.log('Prueba de acceso a pedidos con email correcta: true')
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

      console.log('Pedido de prueba eliminado:', id)
    } catch {
      console.error('Revisá el pedido de prueba pendiente:', id)
      process.exitCode = 1
    }
  }

  terminal.close()
}