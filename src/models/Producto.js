import mongoose from 'mongoose'

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar los 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede superar los 1000 caracteres'],
      default: '',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    categoria: {
      type: String,
      trim: true,
      maxlength: [100, 'La categoría no puede superar los 100 caracteres'],
      default: 'Sin categoría',
    },
    imagen: {
      type: String,
      trim: true,
      default: '',
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Producto = mongoose.model('Producto', productoSchema)

export default Producto