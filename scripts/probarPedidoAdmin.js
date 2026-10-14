import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

const baseURL = 'http://localhost:4000/api'

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${baseURL}${ruta}`, opciones)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.message || 'La solicitud falló')
  }

  return datos
}

try {
  const email = await terminal.question('Email de la cuenta: ')
  const password = await terminal.question('Contraseña: ')
  const id = (
    await terminal.question('ID del pedido de prueba: ')
  ).trim()

  const sesion = await solicitar('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const headers = {
    Authorization: `Bearer ${sesion.token}`,
  }

  const inicial = await solicitar(`/pedidos/${id}`, { headers })

  console.log('Estado antes:', inicial.pedido.estado)

  const respuesta = await fetch(`${baseURL}/pedidos/${id}/estado`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado: 'inventado' }),
  })

  const resultado = await respuesta.json()

  console.log('Estado inválido HTTP:', respuesta.status)
  console.log('Mensaje:', resultado.message)

  const final = await solicitar(`/pedidos/${id}`, { headers })

  console.log('Estado después:', final.pedido.estado)

  const pruebaCorrecta =
    respuesta.status === 400 &&
    inicial.pedido.estado === final.pedido.estado

  console.log('Validación correcta:', pruebaCorrecta)

  if (!pruebaCorrecta) {
    process.exitCode = 1
  }
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  terminal.close()
}