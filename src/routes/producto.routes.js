import { Router } from 'express'
import * as productoController from '../controllers/producto.controller.js'
import { validarBody } from '../middlewares/validarBody.js'
import {
  crearProductoSchema,
  actualizarProductoSchema,
} from '../schemas/producto.schema.js'

const router = Router()

router.get('/', productoController.listarProductos)

router.get('/:id', productoController.obtenerProducto)

router.post(
  '/',
  validarBody(crearProductoSchema),
  productoController.crearProducto
)

router.patch(
  '/:id',
  validarBody(actualizarProductoSchema),
  productoController.actualizarProducto
)

router.delete('/:id', productoController.eliminarProducto)

export default router