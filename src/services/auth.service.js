import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

async function autenticarUsuario({ email, password }, rolRequerido) {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
  }

  const usuario = await Usuario.findOne({
    email: email.trim().toLowerCase(),
  }).select('+passwordHash')

  if (
    !usuario ||
    !usuario.activo ||
    !['admin', 'cliente'].includes(usuario.rol) ||
    (rolRequerido && usuario.rol !== rolRequerido)
  ) {
    return null
  }

  const passwordValida = await bcrypt.compare(
    password,
    usuario.passwordHash
  )

  if (!passwordValida) {
    return null
  }

  const token = jwt.sign(
    {},
    secret,
    {
      algorithm: 'HS256',
      subject: usuario._id.toString(),
      issuer: 'lara-backend',
      audience: usuario.rol === 'admin'
        ? 'lara-admin'
        : 'lara-cliente',
      expiresIn: '1h',
    }
  )

  return {
    token,
    usuario: {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  }
}

export async function iniciarSesion(datos) {
  return autenticarUsuario(datos, 'admin')
}

export async function iniciarSesionUnificada(datos) {
  return autenticarUsuario(datos)
}