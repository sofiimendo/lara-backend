import express from 'express'
import cors from 'cors'

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

app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
  })
})

export default app