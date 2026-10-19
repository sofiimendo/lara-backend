import Producto from '../models/Producto.js'

export async function listarProductos() {
  return Producto.find({ disponible: true }).sort({ createdAt: -1 })
}

export async function listarProductosAdmin() {
  return Producto.find().sort({ createdAt: -1 })
}

export async function obtenerProductoPorId(id) {
  return Producto.findOne({
    _id: id,
    disponible: true,
  })
}

export async function obtenerProductoPorIdAdmin(id) {
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
      returnDocument: 'after',
      runValidators: true,
    }
  )
}

export async function eliminarProducto(id) {
  return Producto.findByIdAndDelete(id)
}