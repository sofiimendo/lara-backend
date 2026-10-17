import { Router } from 'express'
import * as usuarioController from '../controllers/usuario.controller.js'
import { validarBody } from '../middlewares/validarBody.js'
import { autenticar, soloAdmin } from '../middlewares/autenticar.js'
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
} from '../schemas/usuario.schema.js'

const router = Router()

router.use(autenticar, soloAdmin)

router.get('/', usuarioController.listarUsuarios)

router.get('/:id', usuarioController.obtenerUsuario)

router.post(
  '/',
  validarBody(crearUsuarioSchema),
  usuarioController.crearUsuario
)

router.put(
  '/:id',
  validarBody(actualizarUsuarioSchema),
  usuarioController.actualizarUsuario
)

router.delete('/:id', usuarioController.eliminarUsuario)

export default router