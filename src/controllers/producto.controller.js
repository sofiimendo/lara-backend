import mongoose from 'mongoose'
import * as productoService from '../services/producto.service.js'

function validarId(id, res) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    res.status(400).json({
      message: 'El ID del producto no es válido',
    })

    return false
  }

  return true
}

export async function listarProductos(req, res, next) {
  try {
    const productos = await productoService.listarProductos()

    return res.status(200).json({ productos })
  } catch (error) {
    next(error)
  }
}

export async function listarProductosAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store')

  try {
    const productos = await productoService.listarProductosAdmin()

    return res.status(200).json({ productos })
  } catch (error) {
    next(error)
  }
}

export async function obtenerProducto(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const producto = await productoService.obtenerProductoPorId(id)

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado',
      })
    }

    return res.status(200).json({ producto })
  } catch (error) {
    next(error)
  }
}

export async function obtenerProductoAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store')

  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const producto = await productoService.obtenerProductoPorIdAdmin(id)

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado',
      })
    }

    return res.status(200).json({ producto })
  } catch (error) {
    next(error)
  }
}

export async function crearProducto(req, res, next) {
  try {
    const producto = await productoService.crearProducto(req.body)

    return res.status(201).json({
      message: 'Producto creado correctamente',
      producto,
    })
  } catch (error) {
    next(error)
  }
}

export async function actualizarProducto(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const producto = await productoService.actualizarProducto(id, req.body)

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado',
      })
    }

    return res.status(200).json({
      message: 'Producto actualizado correctamente',
      producto,
    })
  } catch (error) {
    next(error)
  }
}

export async function eliminarProducto(req, res, next) {
  try {
    const { id } = req.params

    if (!validarId(id, res)) return

    const producto = await productoService.eliminarProducto(id)

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado',
      })
    }

    return res.status(200).json({
      message: 'Producto eliminado correctamente',
      producto,
    })
  } catch (error) {
    next(error)
  }
}