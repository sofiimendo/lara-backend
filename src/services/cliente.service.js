import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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

export async function iniciarSesionCliente({ email, password }) {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
  }

  const cliente = await Usuario.findOne({
    email: email.trim().toLowerCase(),
  }).select('+passwordHash')

  if (!cliente || !cliente.activo || cliente.rol !== 'cliente') {
    return null
  }

  const passwordValida = await bcrypt.compare(
    password,
    cliente.passwordHash
  )

  if (!passwordValida) {
    return null
  }

  const token = jwt.sign(
    {},
    secret,
    {
      algorithm: 'HS256',
      subject: cliente._id.toString(),
      issuer: 'lara-backend',
      audience: 'lara-cliente',
      expiresIn: '1h',
    }
  )

  return {
    token,
    cliente: clienteSeguro(cliente),
  }
}