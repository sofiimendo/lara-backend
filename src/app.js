import express from 'express'
import cors from 'cors'
import productoRoutes from './routes/producto.routes.js'
import authRoutes from './routes/auth.routes.js'
import pedidoRoutes from './routes/pedido.routes.js'
import usuarioRoutes from './routes/usuario.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import { manejarErrores } from './middlewares/manejarErrores.js'

const app = express()

if (process.env.RENDER === 'true') {
  app.set('trust proxy', 1)
}

const frontendURL = process.env.FRONTEND_URL?.trim().replace(/\/+$/, '')

const origenesPermitidos = [
  'http://localhost:5173',
  ...(frontendURL ? [frontendURL] : []),
]

app.use(
  cors({
    origin: origenesPermitidos,
  })
)

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API de Lara Pastelería funcionando',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/clientes', clienteRoutes)

app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
  })
})

app.use(manejarErrores)

export default app