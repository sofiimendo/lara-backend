import mongoose from 'mongoose'

const pedidoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      index: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Ingresá un correo válido'],
    },
    fecha: {
      type: String,
      required: [true, 'La fecha es obligatoria'],
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    tipoEvento: {
      type: String,
      enum: ['', 'Cumpleaños', 'Reunión', 'Otro'],
      default: '',
    },
    pedido: {
      type: String,
      required: [true, 'El tipo de pedido es obligatorio'],
      enum: [
        'Torta',
        'Medialunas',
        'Desayuno',
        'Panes',
        'Mesa dulce',
        'Comida saludable',
        'Otro pedido',
      ],
    },
    cantidadPersonas: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: 'La cantidad de personas debe ser un número entero',
      },
    },
    detalles: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    estado: {
      type: String,
      enum: [
        'nuevo',
        'pendiente',
        'confirmado',
        'entregado',
        'cancelado',
      ],
      default: 'nuevo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Pedido = mongoose.model('Pedido', pedidoSchema)

export default Pedido