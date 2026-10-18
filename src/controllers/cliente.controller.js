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