import { iniciarSesion } from '../services/auth.service.js'

export async function login(req, res, next) {
  try {
    const resultado = await iniciarSesion(req.body)

    res.set('Cache-Control', 'no-store')

    if (!resultado) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos',
      })
    }

    return res.status(200).json({
      message: 'Sesión iniciada correctamente',
      ...resultado,
    })
  } catch (error) {
    next(error)
  }
}