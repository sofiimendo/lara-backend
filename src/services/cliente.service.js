import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'

function crearError(mensaje, estado) {
  const error = new Error(mensaje)
  error.status = estado
  error.statusCode = estado
  return error
}

function clienteSeguro(cliente) {
  return {
    id: cliente._id.toString(),
    nombre: cliente.nombre,
    email: cliente.email,
    rol: cliente.rol,
  }
}

export async function registrarCliente(datos) {
  const email = datos.email.trim().toLowerCase()

  const existente = await Usuario.findOne({ email })

  if (existente) {
    throw crearError('Ya existe una cuenta con ese email', 409)
  }

  const passwordHash = await bcrypt.hash(datos.password, 12)

  try {
    const cliente = await Usuario.create({
      nombre: datos.nombre,
      email,
      passwordHash,
      rol: 'cliente',
      activo: true,
    })

    return clienteSeguro(cliente)
  } catch (error) {
    if (error.code === 11000) {
      throw crearError('Ya existe una cuenta con ese email', 409)
    }

    throw error
  }
}