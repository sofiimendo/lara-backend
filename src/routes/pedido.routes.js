import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as pedidoController from '../controllers/pedido.controller.js'
import { autenticar, soloAdmin } from '../middlewares/autenticar.js'
import { autenticarCliente } from '../middlewares/autenticarCliente.js'
import { validarBody } from '../middlewares/validarBody.js'
import {
  crearPedidoSchema,
  crearPedidoPresencialSchema,
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
  '/admin',
  autenticar,
  soloAdmin,
  validarBody(crearPedidoPresencialSchema),
  pedidoController.crearPedidoPresencial
)

router.post(
  '/',
  autenticarCliente,
  limitarConsultas,
  validarBody(crearPedidoSchema),
  pedidoController.crearPedido
)

router.get(
  '/mis-pedidos',
  autenticarCliente,
  pedidoController.listarMisPedidos
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

router.put(
  '/:id',
  autenticar,
  soloAdmin,
  pedidoController.reemplazarPedido
)

router.patch(
  '/:id/estado',
  autenticar,
  soloAdmin,
  validarBody(actualizarEstadoPedidoSchema),
  pedidoController.actualizarEstadoPedido
)

router.delete(
  '/:id',
  autenticar,
  soloAdmin,
  pedidoController.eliminarPedido
)

export default router
