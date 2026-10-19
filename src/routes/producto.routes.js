import { Router } from 'express'
import * as productoController from '../controllers/producto.controller.js'
import { validarBody } from '../middlewares/validarBody.js'
import { autenticar, soloAdmin } from '../middlewares/autenticar.js'
import {
  crearProductoSchema,
  reemplazarProductoSchema,
  actualizarProductoSchema,
} from '../schemas/producto.schema.js'

const router = Router()

router.get(
  '/admin',
  autenticar,
  soloAdmin,
  productoController.listarProductosAdmin
)

router.get(
  '/admin/:id',
  autenticar,
  soloAdmin,
  productoController.obtenerProductoAdmin
)

router.get('/', productoController.listarProductos)

router.get('/:id', productoController.obtenerProducto)

router.post(
  '/',
  autenticar,
  soloAdmin,
  validarBody(crearProductoSchema),
  productoController.crearProducto
)

router.put(
  '/:id',
  autenticar,
  soloAdmin,
  validarBody(reemplazarProductoSchema),
  productoController.actualizarProducto
)

router.patch(
  '/:id',
  autenticar,
  soloAdmin,
  validarBody(actualizarProductoSchema),
  productoController.actualizarProducto
)

router.delete(
  '/:id',
  autenticar,
  soloAdmin,
  productoController.eliminarProducto
)

export default router