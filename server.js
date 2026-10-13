import 'dotenv/config'
import app from './src/app.js'
import { connectDB } from './src/config/db.js'

const PORT = process.env.PORT || 4000

async function startServer() {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`API de Lara disponible en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('No se pudo conectar a MongoDB e iniciar la API.')
    console.error('Tipo de error:', error.name)
    console.error('Código de error:', error.code ?? 'Sin código')
    console.error('Detalle:', error.message)
    process.exit(1)
  }
}

startServer()