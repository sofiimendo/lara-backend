import { z } from 'zod'

export const loginSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('El email no tiene un formato válido')
    .max(254, 'El email no puede superar los 254 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(128, 'La contraseña no puede superar los 128 caracteres'),
})