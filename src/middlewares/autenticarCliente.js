import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import Usuario from '../models/Usuario.js'

export async function autenticarCliente(req, res, next) {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    return next(new Error('JWT_SECRET no está configurado correctamente'))
  }

  const authorization = req.get('Authorization') || ''
  const partes = authorization.trim().split(/\s+/)

  if (
    partes.length !== 2 ||
    partes[0].toLowerCase() !== 'bearer' ||
    !partes[1]
  ) {
    return res.status(401).json({
      message: 'Debés iniciar sesión para continuar',
    })
  }

  let payload

  try {
    payload = jwt.verify(partes[1], secret, {
      algorithms: ['HS256'],
      issuer: 'lara-backend',
      audience: 'lara-cliente',
    })
  } catch {
    return res.status(401).json({
      message: 'Token inválido o vencido',
    })
  }

  if (
    typeof payload !== 'object' ||
    !mongoose.isObjectIdOrHexString(payload.sub)
  ) {
    return res.status(401).json({
      message: 'Token inválido o vencido',
    })
  }

  try {
    const cliente = await Usuario.findById(payload.sub)

    if (!cliente || !cliente.activo) {
      return res.status(401).json({
        message: 'La cuenta no está disponible',
      })
    }

    if (cliente.rol !== 'cliente') {
      return res.status(403).json({
        message: 'No tenés permisos para acceder como cliente',
      })
    }

    req.cliente = cliente
    next()
  } catch (error) {
    next(error)
  }
}