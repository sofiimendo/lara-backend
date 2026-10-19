import Pedido from '../models/Pedido.js'

export async function crearPedido(datos, clienteId) {
  return Pedido.create({
    cliente: clienteId,
    origen: 'web',
    nombre: datos.nombre,
    email: datos.email,
    fecha: datos.fecha,
    tipoEvento: datos.tipoEvento,
    pedido: datos.pedido,
    cantidadPersonas: datos.cantidadPersonas,
    detalles: datos.detalles,
    estado: 'nuevo',
  })
}

export async function crearPedidoPresencial(datos, administradorId) {
  return Pedido.create({
    origen: 'presencial',
    creadoPor: administradorId,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
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
  const pedido = await Pedido.findById(id)

  if (!pedido) return null

  pedido.nombre = datos.nombre
  pedido.email = datos.email
  pedido.fecha = datos.fecha
  pedido.tipoEvento = datos.tipoEvento
  pedido.pedido = datos.pedido
  pedido.cantidadPersonas = datos.cantidadPersonas
  pedido.detalles = datos.detalles

  if (pedido.origen === 'presencial') {
    pedido.telefono = datos.telefono
  }

  return pedido.save()
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