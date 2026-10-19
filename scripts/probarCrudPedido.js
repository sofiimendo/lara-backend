import assert from 'node:assert/strict'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

const baseURL = 'http://localhost:4000/api'
let headersAdmin
let pedidoId
let eliminado = false

async function solicitar(ruta, opciones = {}, estadoEsperado = 200) {
  const respuesta = await fetch(`${baseURL}${ruta}`, opciones)
  const datos = await respuesta.json()

  assert.equal(
    respuesta.status,
    estadoEsperado,
    `${opciones.method || 'GET'} ${ruta}: se esperaba ${estadoEsperado}, se recibió ${respuesta.status}. ${datos.message || ''}`
  )

  return datos
}

function crearHeaders(token) {
  assert.equal(typeof token, 'string', 'La sesión no devolvió un token')
  assert.ok(token.length > 0, 'El token está vacío')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function buscarPedido(datos, id) {
  assert.ok(Array.isArray(datos.pedidos), 'La respuesta no contiene pedidos')
  return datos.pedidos.find((pedido) => pedido._id === id)
}

function comprobarDatos(pedido, esperados) {
  for (const [campo, valor] of Object.entries(esperados)) {
    assert.equal(pedido[campo], valor, `El campo ${campo} no coincide`)
  }
}

try {
  console.log('Usá una cuenta administradora y una cuenta cliente de prueba.')
  console.log('Las contraseñas se ven mientras las escribís.')

  const adminEmail = await terminal.question('Email de administrador: ')
  const adminPassword = await terminal.question('Contraseña de administrador: ')

  const sesionAdmin = await solicitar('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail.trim(),
      password: adminPassword,
    }),
  })

  headersAdmin = crearHeaders(sesionAdmin.token)

  const clienteEmail = await terminal.question('Email del cliente: ')
  const clientePassword = await terminal.question('Contraseña del cliente: ')

  const sesionCliente = await solicitar('/clientes/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: clienteEmail.trim(),
      password: clientePassword,
    }),
  })

  const headersCliente = crearHeaders(sesionCliente.token)
  const clienteId = sesionCliente.cliente?.id || sesionCliente.cliente?._id

  assert.equal(typeof clienteId, 'string', 'El login no devolvió el ID del cliente')
  assert.ok(clienteId.length > 0, 'El ID del cliente está vacío')

  const fecha = new Date()
  fecha.setUTCDate(fecha.getUTCDate() + 30)

  const datosIniciales = {
    nombre: 'Cliente de prueba CRUD',
    whatsapp: '11 1234 5678',
    fecha: fecha.toISOString().slice(0, 10),
    tipoEvento: 'Cumpleaños',
    pedido: 'Torta',
    cantidadPersonas: 10,
    detalles: 'Pedido creado para probar PUT y DELETE con clientes',
  }

  const creado = await solicitar(
    '/pedidos',
    {
      method: 'POST',
      headers: headersCliente,
      body: JSON.stringify(datosIniciales),
    },
    201
  )

  pedidoId = creado.pedido?.id

  assert.equal(typeof pedidoId, 'string', 'La creación no devolvió el ID')
  assert.ok(pedidoId.length > 0, 'El ID del pedido está vacío')
  assert.equal(creado.pedido.estado, 'nuevo')

  console.log('Creación como cliente: correcta')

  const propiosIniciales = await solicitar('/pedidos/mis-pedidos', {
    headers: headersCliente,
  })

  const propioInicial = buscarPedido(propiosIniciales, pedidoId)

  assert.ok(propioInicial, 'El pedido no aparece en mis-pedidos')
  assert.equal(propioInicial.cliente, clienteId)

  console.log('Pedido vinculado al cliente y visible en mis-pedidos: correcto')

  await solicitar(`/pedidos/${pedidoId}/estado`, {
    method: 'PATCH',
    headers: headersAdmin,
    body: JSON.stringify({ estado: 'pendiente' }),
  })

  const inicial = await solicitar(`/pedidos/${pedidoId}`, {
    headers: headersAdmin,
  })

  assert.equal(inicial.pedido.cliente, clienteId)
  assert.equal(inicial.pedido.estado, 'pendiente')
  assert.ok(inicial.pedido.createdAt, 'Falta la fecha de creación')

  await solicitar(
    `/pedidos/${pedidoId}`,
    {
      method: 'PUT',
      headers: headersAdmin,
      body: JSON.stringify({ nombre: 'Datos incompletos' }),
    },
    400
  )

  const despuesDelRechazo = await solicitar(`/pedidos/${pedidoId}`, {
    headers: headersAdmin,
  })

  assert.deepEqual(
    despuesDelRechazo.pedido,
    inicial.pedido,
    'El PUT incompleto modificó el pedido'
  )

  console.log('PUT incompleto: 400 sin modificar el pedido')

  const datosCompletos = {
    ...datosIniciales,
    nombre: 'Cliente actualizado',
    tipoEvento: 'Reunión',
    cantidadPersonas: 20,
    detalles: 'Datos actualizados por PUT',
  }

  await solicitar(`/pedidos/${pedidoId}`, {
    method: 'PUT',
    headers: headersAdmin,
    body: JSON.stringify(datosCompletos),
  })

  const consulta = await solicitar(`/pedidos/${pedidoId}`, {
    headers: headersAdmin,
  })

  const guardado = consulta.pedido

  comprobarDatos(guardado, datosCompletos)
  assert.equal(guardado._id, pedidoId)
  assert.equal(guardado.cliente, clienteId)
  assert.equal(guardado.createdAt, inicial.pedido.createdAt)
  assert.equal(guardado.estado, 'pendiente')

  console.log('PUT completo: datos guardados correctamente')
  console.log('Cliente, ID, estado y fecha de creación conservados')

  const propiosActualizados = await solicitar('/pedidos/mis-pedidos', {
    headers: headersCliente,
  })

  const propioActualizado = buscarPedido(propiosActualizados, pedidoId)

  assert.ok(propioActualizado, 'El pedido actualizado no aparece en mis-pedidos')
  comprobarDatos(propioActualizado, datosCompletos)
  assert.equal(propioActualizado.cliente, clienteId)
  assert.equal(propioActualizado.estado, 'pendiente')
  assert.equal(propioActualizado.createdAt, inicial.pedido.createdAt)

  console.log('El cliente ve los datos actualizados: correcto')

  await solicitar(`/pedidos/${pedidoId}`, {
    method: 'DELETE',
    headers: headersAdmin,
  })

  eliminado = true

  console.log('DELETE como administrador: correcto')

  await solicitar(
    `/pedidos/${pedidoId}`,
    { headers: headersAdmin },
    404
  )

  const propiosFinales = await solicitar('/pedidos/mis-pedidos', {
    headers: headersCliente,
  })

  assert.equal(
    buscarPedido(propiosFinales, pedidoId),
    undefined,
    'El pedido eliminado sigue apareciendo en mis-pedidos'
  )

  console.log('Consulta por ID después de eliminar: 404')
  console.log('El pedido eliminado ya no aparece en mis-pedidos')
  console.log('Prueba correcta: true')
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  if (pedidoId && headersAdmin && !eliminado) {
    try {
      await solicitar(`/pedidos/${pedidoId}`, {
        method: 'DELETE',
        headers: headersAdmin,
      })

      console.log('Pedido de prueba retirado')
    } catch {
      console.error('Revisá el pedido de prueba pendiente:', pedidoId)
      process.exitCode = 1
    }
  }

  terminal.close()
}