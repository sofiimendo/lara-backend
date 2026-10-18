import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

export async function iniciarSesion({ email, password }) {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
  }

  const usuario = await Usuario.findOne({ email }).select('+passwordHash')

  if (!usuario || !usuario.activo || usuario.rol !== 'admin') {
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
      audience: 'lara-admin',
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