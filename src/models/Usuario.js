import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar los 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [254, 'El email no puede superar los 254 caracteres'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    rol: {
      type: String,
      enum: ['admin', 'cliente'],
      default: 'cliente',
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Usuario = mongoose.model('Usuario', usuarioSchema)

export default Usuario