import { subirImagenProducto } from '../services/imagen.service.js'

export async function subirImagen(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Seleccioná una imagen para subir.',
      })
    }

    const imagen = await subirImagenProducto(req.file)

    return res.status(201).json({
      message: 'Imagen subida correctamente',
      imagen: {
        url: imagen.url,
        publicId: imagen.publicId,
      },
    })
  } catch (error) {
    next(error)
  }
}