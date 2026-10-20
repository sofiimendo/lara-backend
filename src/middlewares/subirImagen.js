import multer from 'multer'

const almacenamiento = multer.memoryStorage()

const formatosPermitidos = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const subirImagen = multer({
  storage: almacenamiento,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!formatosPermitidos.includes(file.mimetype)) {
      return callback(
        new Error(
          'Formato no permitido. Seleccioná una imagen JPG, PNG o WebP.'
        )
      )
    }

    callback(null, true)
  },
})

export default subirImagen