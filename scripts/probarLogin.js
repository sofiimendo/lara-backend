import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const terminal = createInterface({
  input: stdin,
  output: stdout,
})

try {
  const email = await terminal.question('Email de la cuenta: ')
  const password = await terminal.question('Contraseña: ')

  const respuesta = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const datos = await respuesta.json()

  console.log('Estado HTTP:', respuesta.status)
  console.log('Mensaje:', datos.message)

  if (respuesta.ok) {
    console.log('Token recibido:', Boolean(datos.token))
    console.log('Usuario:', datos.usuario.nombre)
    console.log('Rol:', datos.usuario.rol)
  }
} catch (error) {
  console.error('No se pudo completar la prueba:', error.message)
  process.exitCode = 1
} finally {
  terminal.close()
}