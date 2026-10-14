import mongoose from 'mongoose'
import * as pedidoService from '../services/pedido.service.js'

function validarId(id, res) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    res.status(400).json({
      message: 'El ID del pedido no es válido',
    })

    return false
  }

  return true
}

export async function crearPedido(req, res, next) {
  try {
    const pedido = await pedidoService.crearPedido(req.body)

    return res.status(201).json({
      message: 'Consulta recibida. Lara confirmará disponibilidad y presupuesto',
      pedido: {
        id: pedido._id.toString(),
        estado: pedido.estado,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function listarPedidos(req, res, next) {
  try {
    const pedidos = await pedidoService.listarPedidos()

    res.set('Cache-Control', 'no-store')

    return res.status(200).json({ pedidos })
  } catch (error) {
    next(error)
  }
}

export async function obtenerPedido(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const pedido = await pedidoService.obtenerPedidoPorId(id)

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado',
      })
    }

    res.set('Cache-Control', 'no-store')

    return res.status(200).json({ pedido })
  } catch (error) {
    next(error)
  }
}

export async function reemplazarPedido(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const pedido = await pedidoService.reemplazarPedido(id, req.body)

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado',
      })
    }

    res.set('Cache-Control', 'no-store')

    return res.status(200).json({
      message: 'Datos del pedido actualizados correctamente',
      pedido,
    })
  } catch (error) {
    next(error)
  }
}

export async function actualizarEstadoPedido(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const pedido = await pedidoService.actualizarEstadoPedido(
      id,
      req.body.estado
    )

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado',
      })
    }

    res.set('Cache-Control', 'no-store')

    return res.status(200).json({
      message: 'Estado del pedido actualizado correctamente',
      pedido,
    })
  } catch (error) {
    next(error)
  }
}

export async function eliminarPedido(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const pedido = await pedidoService.eliminarPedido(id)

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado',
      })
    }

    res.set('Cache-Control', 'no-store')

    return res.status(200).json({
      message: 'Pedido eliminado correctamente',
    })
  } catch (error) {
    next(error)
  }
}