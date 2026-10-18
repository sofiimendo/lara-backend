import * as clienteService from '../services/cliente.service.js'

export async function registrarCliente(req, res, next) {
  try {
    const cliente = await clienteService.registrarCliente(req.body)

    res.set('Cache-Control', 'no-store')

    return res.status(201).json({
      message: 'Cuenta creada correctamente. Ya podés iniciar sesión',
      cliente,
    })
  } catch (error) {
    next(error)
  }
}

export async function iniciarSesionCliente(req, res, next) {
  try {
    const resultado = await clienteService.iniciarSesionCliente(req.body)

    res.set('Cache-Control', 'no-store')

    if (!resultado) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos',
      })
    }

    return res.status(200).json({
      message: 'Inicio de sesión correcto',
      ...resultado,
    })
  } catch (error) {
    next(error)
  }
}