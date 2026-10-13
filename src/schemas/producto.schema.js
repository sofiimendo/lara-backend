import { z } from 'zod'

export const crearProductoSchema = z.strictObject({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede superar los 1000 caracteres')
    .optional(),
  precio: z
    .number()
    .min(0, 'El precio no puede ser negativo'),
  categoria: z
    .string()
    .trim()
    .min(1, 'La categoría no puede estar vacía')
    .max(100, 'La categoría no puede superar los 100 caracteres')
    .optional(),
  imagen: z
    .string()
    .trim()
    .optional(),
  disponible: z
    .boolean()
    .optional(),
})

export const actualizarProductoSchema = crearProductoSchema
  .partial()
  .refine(
    (datos) => Object.keys(datos).length > 0,
    {
      message: 'Debés enviar al menos un campo para actualizar',
    }
  )