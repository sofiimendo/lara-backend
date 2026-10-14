import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

const baseURL = 'http://localhost:4000/api'

try {
  const email = await terminal.question('Email de la cuenta: ')
  const password = await terminal.question('Contraseña: ')

  const loginRespuesta = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const sesion = await loginRespuesta.json()

  console.log('Login HTTP:', loginRespuesta.status)

  if (!loginRespuesta.ok) {
    console.log('Mensaje:', sesion.message)
    process.exitCode = 1
  } else {
    const crearRespuesta = await fetch(`${baseURL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sesion.token}`,
      },
      body: JSON.stringify({
        nombre: 'Prueba de acceso admin',
        precio: 1500,
      }),
    })

    const creacion = await crearRespuesta.json()

    console.log('Crear HTTP:', crearRespuesta.status)
    console.log('Mensaje:', creacion.message)

    if (crearRespuesta.status === 201 && creacion.producto?._id) {
      const eliminarRespuesta = await fetch(
        `${baseURL}/productos/${creacion.producto._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sesion.token}`,
          },
        }
      )

      const eliminacion = await eliminarRespuesta.json()

      console.log('Eliminar HTTP:', eliminarRespuesta.status)
      console.log('Mensaje:', eliminacion.message)

      if (!eliminarRespuesta.ok) {
        console.log('Producto de prueba pendiente:', creacion.producto._id)
        process.exitCode = 1
      }
    } else {
      process.exitCode = 1
    }
  }
} catch (error) {
  console.error('No se pudo completar la prueba:', error.message)
  process.exitCode = 1
} finally {
  terminal.close()
}