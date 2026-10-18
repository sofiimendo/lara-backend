import Pedido from '../models/Pedido.js'

export async function crearPedido(datos, clienteId) {
  return Pedido.create({
    cliente: clienteId,
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

export async function listarPedidosDeCliente(clienteId) {
  return Pedido.find({ cliente: clienteId }).sort({ createdAt: -1 })
}

export async function obtenerPedidoPorId(id) {
  return Pedido.findById(id)
}

export async function reemplazarPedido(id, datos) {
  return Pedido.findByIdAndUpdate(
    id,
    {
      $set: {
        nombre: datos.nombre,
        whatsapp: datos.whatsapp,
        fecha: datos.fecha,
        tipoEvento: datos.tipoEvento,
        pedido: datos.pedido,
        cantidadPersonas: datos.cantidadPersonas,
        detalles: datos.detalles,
      },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  )
}

export async function actualizarEstadoPedido(id, estado) {
  return Pedido.findByIdAndUpdate(
    id,
    { $set: { estado } },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  )
}

export async function eliminarPedido(id) {
  return Pedido.findByIdAndDelete(id)
}