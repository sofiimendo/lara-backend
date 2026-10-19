import mongoose from 'mongoose'

const pedidoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      index: true,
    },
    origen: {
      type: String,
      enum: ['web', 'presencial'],
      default: 'web',
      immutable: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: function () {
        return this.origen === 'presencial'
      },
      immutable: true,
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
      required: [
        function () {
          return this.origen !== 'presencial' || !this.telefono
        },
        'Ingresá un correo electrónico de contacto',
      ],
      trim: true,
      lowercase: true,
      maxlength: 254,
      validate: {
        validator: function (valor) {
          return !valor || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
        },
        message: 'Ingresá un correo válido',
      },
    },
    telefono: {
      type: String,
      trim: true,
      maxlength: 25,
      required: [
        function () {
          return this.origen === 'presencial' && !this.email
        },
        'Ingresá un teléfono o un correo electrónico de contacto',
      ],
      validate: {
        validator: function (valor) {
          if (!valor) return true

          const digitos = valor.replace(/\D/g, '')

          return (
            /^\+?[0-9\s()-]+$/.test(valor) &&
            digitos.length >= 8 &&
            digitos.length <= 15
          )
        },
        message: 'Ingresá un teléfono válido, con código de área',
      },
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