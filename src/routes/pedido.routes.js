import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as pedidoController from '../controllers/pedido.controller.js'
import { autenticar, soloAdmin } from '../middlewares/autenticar.js'
import { validarBody } from '../middlewares/validarBody.js'
import {
  crearPedidoSchema,
  actualizarEstadoPedidoSchema,
} from '../schemas/pedido.schema.js'

const router = Router()

const limitarConsultas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Demasiadas consultas. Volvé a intentar en 15 minutos',
  },
})

router.post(
  '/',
  limitarConsultas,
  validarBody(crearPedidoSchema),
  pedidoController.crearPedido
)

router.get(
  '/',
  autenticar,
  soloAdmin,
  pedidoController.listarPedidos
)

router.get(
  '/:id',
  autenticar,
  soloAdmin,
  pedidoController.obtenerPedido
)

router.patch(
  '/:id/estado',
  autenticar,
  soloAdmin,
  validarBody(actualizarEstadoPedidoSchema),
  pedidoController.actualizarEstadoPedido
)

export default router