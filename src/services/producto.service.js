import Producto from '../models/Producto.js'

export async function listarProductos() {
  return Producto.find().sort({ createdAt: -1 })
}

export async function obtenerProductoPorId(id) {
  return Producto.findById(id)
}

export async function crearProducto(datos) {
  return Producto.create(datos)
}

export async function actualizarProducto(id, datos) {
  return Producto.findByIdAndUpdate(
    id,
    { $set: datos },
    {
      new: true,
      runValidators: true,
    }
  )
}

export async function eliminarProducto(id) {
  return Producto.findByIdAndDelete(id)
}