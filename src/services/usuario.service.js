import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Usuario from '../models/Usuario.js'

function crearError(mensaje, estado) {
  const error = new Error(mensaje)
  error.status = estado
  error.statusCode = estado
  return error
}

function validarId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw crearError('El ID del usuario no es válido', 400)
  }
}

function esMismoUsuario(id, usuarioActualId) {
  return String(id).toLowerCase() === String(usuarioActualId).toLowerCase()
}

function usuarioSeguro(usuario) {
  if (!usuario) return null

  const datos = usuario.toObject()

  delete datos.passwordHash

  return datos
}

export async function listarUsuarios() {
  const usuarios = await Usuario.find().sort({ createdAt: -1 })

  return usuarios.map(usuarioSeguro)
}

export async function obtenerUsuarioPorId(id) {
  validarId(id)

  const usuario = await Usuario.findById(id)

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404)
  }

  return usuarioSeguro(usuario)
}

export async function crearUsuario(datos) {
  const email = datos.email.trim().toLowerCase()

  const existente = await Usuario.findOne({ email })

  if (existente) {
    throw crearError('Ya existe un usuario con ese email', 409)
  }

  const passwordHash = await bcrypt.hash(datos.password, 12)

  try {
    const usuario = await Usuario.create({
      nombre: datos.nombre,
      email,
      passwordHash,
      rol: 'admin',
      activo: true,
    })

    return usuarioSeguro(usuario)
  } catch (error) {
    if (error.code === 11000) {
      throw crearError('Ya existe un usuario con ese email', 409)
    }

    throw error
  }
}

export async function actualizarUsuario(id, datos, usuarioActualId) {
  validarId(id)

  if (
    esMismoUsuario(id, usuarioActualId) &&
    datos.activo === false
  ) {
    throw crearError(
      'No podés desactivar tu propia cuenta',
      409
    )
  }

  try {
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        $set: {
          nombre: datos.nombre,
          email: datos.email.trim().toLowerCase(),
          activo: datos.activo,
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )

    if (!usuario) {
      throw crearError('Usuario no encontrado', 404)
    }

    return usuarioSeguro(usuario)
  } catch (error) {
    if (error.code === 11000) {
      throw crearError('Ya existe un usuario con ese email', 409)
    }

    throw error
  }
}

export async function eliminarUsuario(id, usuarioActualId) {
  validarId(id)

  if (esMismoUsuario(id, usuarioActualId)) {
    throw crearError(
      'No podés eliminar tu propia cuenta',
      409
    )
  }

  const usuario = await Usuario.findByIdAndDelete(id)

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404)
  }

  return usuarioSeguro(usuario)
}