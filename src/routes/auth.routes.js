import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { login } from '../controllers/auth.controller.js'
import { validarBody } from '../middlewares/validarBody.js'
import { loginSchema } from '../schemas/auth.schema.js'

const router = Router()

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: 'Demasiados intentos. Volvé a intentar en 15 minutos',
  },
})

router.post(
  '/login',
  limitarLogin,
  validarBody(loginSchema),
  login
)

export default router