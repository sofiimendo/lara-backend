export function validarBody(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body)

    if (!resultado.success) {
      return res.status(400).json({
        message: 'Los datos enviados no son válidos',
        errores: resultado.error.issues.map((error) => ({
          campo: error.path.join('.') || 'body',
          mensaje: error.message,
        })),
      })
    }

    req.body = resultado.data
    next()
  }
}