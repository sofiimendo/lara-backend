import Pedido from '../models/Pedido.js'

export async function crearPedido(datos) {
  return Pedido.create({
    nombre: datos.nombre,
    whatsapp: datos.whatsapp,
    fecha: datos.fecha,
    tipoEvento: datos.tipoEvento,
    pedido: datos.pedido,
    cantidadPersonas: datos.cantidadPersonas,
    detalles: datos.detalles,
    estado: 'nuevo',
  })
}

export async function listarPedidos() {
  return Pedido.find().sort({ createdAt: -1 })
}

export async function obtenerPedidoPorId(id) {
  return Pedido.findById(id)
}

export async function actualizarEstadoPedido(id, estado) {
  return Pedido.findByIdAndUpdate(
    id,
    { $set: { estado } },
    {
      new: true,
      runValidators: true,
    }
  )
}