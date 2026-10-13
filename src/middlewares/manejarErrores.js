export function manejarErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
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

  console.error('Error interno de la API:', error.name)

  return res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  })
}