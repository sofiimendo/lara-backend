import { z } from 'zod'

const camposProducto = {
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),
  precio: z
    .number()
    .min(0, 'El precio no puede ser negativo'),
  categoria: z
    .string()
    .trim()
    .min(1, 'La categoría no puede estar vacía')
    .max(100, 'La categoría no puede superar los 100 caracteres'),
  imagen: z
    .string()
    .trim(),
  disponible: z
    .boolean(),
}

export const crearProductoSchema = z.strictObject({
  nombre: camposProducto.nombre,
  descripcion: camposProducto.descripcion.optional(),
  precio: camposProducto.precio,
  categoria: camposProducto.categoria.optional(),
  imagen: camposProducto.imagen.optional(),
  disponible: camposProducto.disponible.optional(),
})

export const reemplazarProductoSchema = z.strictObject(camposProducto)

export const actualizarProductoSchema = reemplazarProductoSchema
  .partial()
  .refine(
    (datos) => Object.keys(datos).length > 0,
    {
      message: 'Debés enviar al menos un campo para actualizar',
    }
  )