import express from 'express'
import cors from 'cors'
import productoRoutes from './routes/producto.routes.js'
import { manejarErrores } from './middlewares/manejarErrores.js'

const app = express()

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL || 'https://lara-pasteleria.vercel.app',
    ],
  })
)

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API de Lara Pastelería funcionando',
  })
})

app.use('/api/productos', productoRoutes)

app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
  })
})

app.use(manejarErrores)

export default app