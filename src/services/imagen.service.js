import { Readable } from 'node:stream'
import cloudinary from '../config/cloudinary.js'

function registrarErrorCloudinary(error) {
  const mensaje = String(error?.message || '').toLowerCase()

  let motivo = 'Error de subida sin clasificar'

  if (/api_key|api key|signature|authentication|authorization/.test(mensaje)) {
    motivo = 'Revisar credenciales de Cloudinary'
  } else if (/cloud_name|cloud name/.test(mensaje)) {
    motivo = 'Revisar nombre de la cuenta de Cloudinary'
  } else if (/transformation|parameter|format/.test(mensaje)) {
    motivo = 'Revisar parámetros, transformación o formato'
  } else if (/timeout|timed out|network|connection|enotfound/.test(mensaje)) {
    motivo = 'Problema de conexión con Cloudinary'
  } else if (/quota|limit|disabled/.test(mensaje)) {
    motivo = 'Revisar límites o disponibilidad de la cuenta'
  }

  console.error('Fallo de subida a Cloudinary:', {
    motivo,
    estadoHTTP: error?.http_code,
  })
}

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

  const configuracion = cloudinary.config()

  if (
    !configuracion.cloud_name ||
    !configuracion.api_key ||
    !configuracion.api_secret
  ) {
    console.error('Cloudinary: faltan variables de configuración')
    throw new Error('El servicio de imágenes no está configurado.')
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
          registrarErrorCloudinary(error)

          return reject(
            new Error('No se pudo subir la imagen a Cloudinary.')
          )
        }

        if (!resultado?.secure_url) {
          console.error('Cloudinary: respuesta sin URL de imagen')

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

    streamCloudinary.on('error', (error) => {
      registrarErrorCloudinary(error)
      reject(new Error('No se pudo enviar la imagen a Cloudinary.'))
    })

    Readable.from([archivo.buffer])
      .on('error', reject)
      .pipe(streamCloudinary)
  })
}