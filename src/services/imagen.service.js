import { Readable } from 'node:stream'
import cloudinary from '../config/cloudinary.js'

export async function subirImagenProducto(archivo) {
  if (!archivo?.buffer) {
    const error = new Error('No se recibió ninguna imagen.')
    error.status = 400
    throw error
  }

  const formatosPermitidos = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
  }

  const firma = formatosPermitidos[archivo.mimetype]

  let formatoValido =
    firma &&
    firma.every((byte, indice) => archivo.buffer[indice] === byte)

  if (archivo.mimetype === 'image/webp') {
    formatoValido =
      formatoValido &&
      archivo.buffer.subarray(8, 12).toString() === 'WEBP'
  }

  if (!formatoValido) {
    const error = new Error(
      'El archivo no corresponde a una imagen JPG, PNG o WebP válida.'
    )
    error.status = 400
    throw error
  }

  return new Promise((resolve, reject) => {
    const streamCloudinary = cloudinary.uploader.upload_stream(
      {
        folder: 'lara-pasteleria/productos',
        resource_type: 'image',
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, resultado) => {
        if (error) {
          return reject(
            new Error('No se pudo subir la imagen a Cloudinary.')
          )
        }

        if (!resultado?.secure_url) {
          return reject(
            new Error('Cloudinary no devolvió la URL de la imagen.')
          )
        }

        resolve({
          url: resultado.secure_url,
          publicId: resultado.public_id,
        })
      }
    )

    Readable.from([archivo.buffer])
      .on('error', reject)
      .pipe(streamCloudinary)
  })
}