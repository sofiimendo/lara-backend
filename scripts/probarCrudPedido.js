import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

const baseURL = 'http://localhost:4000/api'
let headers
let pedidoId

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${baseURL}${ruta}`, opciones)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(`${respuesta.status}: ${datos.message}`)
  }

  return datos
}

try {
  const email = await terminal.question('Email de la cuenta: ')
  const password = await terminal.question('Contraseña: ')

  const sesion = await solicitar('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sesion.token}`,
  }

  const fecha = new Date()
  fecha.setUTCDate(fecha.getUTCDate() + 30)

  const datosIniciales = {
    nombre: 'Cliente de prueba CRUD',
    whatsapp: '11 1234 5678',
    fecha: fecha.toISOString().slice(0, 10),
    tipoEvento: 'Cumpleaños',
    pedido: 'Torta',
    cantidadPersonas: 10,
    detalles: 'Pedido creado para probar PUT y DELETE',
  }

  const creado = await solicitar('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosIniciales),
  })

  pedidoId = creado.pedido.id

  await solicitar(`/pedidos/${pedidoId}/estado`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ estado: 'pendiente' }),
  })

  const inicial = await solicitar(`/pedidos/${pedidoId}`, { headers })

  const incompleto = await fetch(`${baseURL}/pedidos/${pedidoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ nombre: 'Datos incompletos' }),
  })

  console.log('PUT incompleto HTTP:', incompleto.status)

  const datosCompletos = {
    ...datosIniciales,
    nombre: 'Cliente actualizado',
    tipoEvento: 'Reunión',
    cantidadPersonas: 20,
    detalles: 'Datos actualizados por PUT',
  }

  await solicitar(`/pedidos/${pedidoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(datosCompletos),
  })

  const consulta = await solicitar(`/pedidos/${pedidoId}`, { headers })
  const guardado = consulta.pedido

  const datosCorrectos = Object.entries(datosCompletos).every(
    ([campo, valor]) => guardado[campo] === valor
  )

  const identidadConservada =
    guardado._id === pedidoId &&
    guardado.createdAt === inicial.pedido.createdAt

  console.log('Datos completos guardados:', datosCorrectos)
  console.log('Estado conservado:', guardado.estado === 'pendiente')
  console.log('ID y fecha de creación conservados:', identidadConservada)

  await solicitar(`/pedidos/${pedidoId}`, {
    method: 'DELETE',
    headers,
  })

  console.log('Pedido de prueba eliminado')

  const respuestaFinal = await fetch(`${baseURL}/pedidos/${pedidoId}`, {
    headers,
  })

  console.log('Consulta después de eliminar HTTP:', respuestaFinal.status)

  const correcto =
    incompleto.status === 400 &&
    datosCorrectos &&
    identidadConservada &&
    guardado.estado === 'pendiente' &&
    respuestaFinal.status === 404

  console.log('Prueba correcta:', correcto)

  pedidoId = null

  if (!correcto) {
    process.exitCode = 1
  }
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  if (pedidoId && headers) {
    try {
      await solicitar(`/pedidos/${pedidoId}`, {
        method: 'DELETE',
        headers,
      })

      console.log('Pedido de prueba retirado')
    } catch {
      console.error('Revisá el pedido de prueba pendiente:', pedidoId)
      process.exitCode = 1
    }
  }

  terminal.close()
}