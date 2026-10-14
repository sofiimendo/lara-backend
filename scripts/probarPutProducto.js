import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

const baseURL = 'http://localhost:4000/api'
let headers
let productoId

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

  const creado = await solicitar('/productos', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      nombre: 'Producto de prueba PUT',
      precio: 1500,
    }),
  })

  productoId = creado.producto._id

  const incompleto = await fetch(`${baseURL}/productos/${productoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ precio: 1800 }),
  })

  console.log('PUT incompleto HTTP:', incompleto.status)

  const productoCompleto = {
    nombre: 'Producto actualizado por PUT',
    descripcion: 'Descripción de prueba',
    precio: 1800,
    categoria: 'Pastelería',
    imagen: '',
    disponible: false,
  }

  await solicitar(`/productos/${productoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(productoCompleto),
  })

  const consulta = await solicitar(`/productos/${productoId}`)
  const guardado = consulta.producto

  const coincide = Object.entries(productoCompleto).every(
    ([campo, valor]) => guardado[campo] === valor
  )

  const correcto =
    incompleto.status === 400 &&
    coincide &&
    guardado._id === productoId &&
    guardado.createdAt === creado.producto.createdAt

  console.log('Datos completos guardados:', coincide)
  console.log('ID y fecha de creación conservados:',
    guardado._id === productoId &&
    guardado.createdAt === creado.producto.createdAt
  )
  console.log('Prueba correcta:', correcto)

  if (!correcto) {
    process.exitCode = 1
  }
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  if (productoId && headers) {
    try {
      await solicitar(`/productos/${productoId}`, {
        method: 'DELETE',
        headers,
      })

      console.log('Producto de prueba eliminado')
    } catch (error) {
      console.error('No se pudo eliminar el producto de prueba:', productoId)
      process.exitCode = 1
    }
  }

  terminal.close()
}