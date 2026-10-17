import * as usuarioService from '../services/usuario.service.js'

function prepararRespuesta(res) {
  res.set('Cache-Control', 'no-store')
}

export async function listarUsuarios(req, res, next) {
  try {
    prepararRespuesta(res)

    const usuarios = await usuarioService.listarUsuarios()

    return res.status(200).json({ usuarios })
  } catch (error) {
    next(error)
  }
}

export async function obtenerUsuario(req, res, next) {
  try {
    prepararRespuesta(res)

    const usuario = await usuarioService.obtenerUsuarioPorId(
      req.params.id
    )

    return res.status(200).json({ usuario })
  } catch (error) {
    next(error)
  }
}

export async function crearUsuario(req, res, next) {
  try {
    prepararRespuesta(res)

    const usuario = await usuarioService.crearUsuario(req.body)

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      usuario,
    })
  } catch (error) {
    next(error)
  }
}

export async function actualizarUsuario(req, res, next) {
  try {
    prepararRespuesta(res)

    const usuario = await usuarioService.actualizarUsuario(
      req.params.id,
      req.body,
      req.usuario._id
    )

    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      usuario,
    })
  } catch (error) {
    next(error)
  }
}

export async function eliminarUsuario(req, res, next) {
  try {
    prepararRespuesta(res)

    const usuario = await usuarioService.eliminarUsuario(
      req.params.id,
      req.usuario._id
    )

    return res.status(200).json({
      message: 'Usuario eliminado correctamente',
      usuario,
    })
  } catch (error) {
    next(error)
  }
}