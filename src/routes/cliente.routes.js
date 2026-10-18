import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { registrarCliente } from '../controllers/cliente.controller.js'
import { validarBody } from '../middlewares/validarBody.js'
import { registrarClienteSchema } from '../schemas/cliente.schema.js'

const router = Router()

const limitarRegistro = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de registro. Volvé a intentar en 15 minutos',
  },
})

router.post(
  '/registro',
  limitarRegistro,
  validarBody(registrarClienteSchema),
  registrarCliente
)

export default router