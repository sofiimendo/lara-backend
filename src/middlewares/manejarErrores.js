export function manejarErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  if (req.originalUrl.startsWith('/api/usuarios')) {
    res.set('Cache-Control', 'no-store')
  }

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'La imagen no puede superar los 5 MB',
      })
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Solo podés subir una imagen por solicitud',
      })
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Enviá una sola imagen en el campo imagen',
      })
    }

    return res.status(400).json({
      message: 'No se pudo recibir el archivo. Revisá los campos del formulario',
    })
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'El JSON enviado no tiene un formato válido',
    })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Los datos enviados superan el tamaño permitido',
    })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Los datos enviados no son válidos',
      errores: Object.values(error.errors).map((detalle) => ({
        campo: detalle.path,
        mensaje: detalle.message,
      })),
    })
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Uno de los datos enviados tiene un formato incorrecto',
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'Ya existe un registro con esos datos únicos',
    })
  }

  const estado = error.statusCode ?? error.status

  if ([400, 401, 403, 404, 409].includes(estado)) {
    return res.status(estado).json({
      message: error.message,
    })
  }

  console.error('Error interno de la API:', error.name)

  return res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  })
}