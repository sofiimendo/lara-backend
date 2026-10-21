import { z } from 'zod'

const nombreSchema = z
  .string()
  .trim()
  .min(1, 'El nombre es obligatorio')
  .max(100, 'El nombre no puede superar los 100 caracteres')

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'El email no puede superar los 254 caracteres')
  .pipe(z.email('El email no es válido'))

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'La contraseña no puede superar los 72 bytes'
  )

export const registrarClienteSchema = z.strictObject({
  nombre: nombreSchema,
  email: emailSchema,
  password: passwordSchema,
})