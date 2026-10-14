import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '../src/config/db.js'
import Usuario from '../src/models/Usuario.js'

const adminSchema = z.strictObject({
  nombre: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine(
      (valor) => Buffer.byteLength(valor, 'utf8') <= 72,
      'La contraseña no puede superar los 72 bytes'
    ),
})

async function crearAdmin() {
  try {
    const resultado = adminSchema.safeParse({
      nombre: process.env.ADMIN_NOMBRE,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })

    if (!resultado.success) {
      console.error('Revisá las variables de la cuenta en .env:')

      for (const error of resultado.error.issues) {
        console.error(`${error.path.join('.')}: ${error.message}`)
      }

      process.exitCode = 1
      return
    }

    const { nombre, email, password } = resultado.data

    await connectDB()
    await Usuario.init()

    const existente = await Usuario.findOne({ email })

    if (existente) {
      console.error('Ya existe una cuenta con ese email')
      process.exitCode = 1
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await Usuario.create({
      nombre,
      email,
      passwordHash,
      rol: 'admin',
      activo: true,
    })

    console.log('Cuenta administradora creada correctamente')
  } catch (error) {
    if (error.code === 11000) {
      console.error('Ya existe una cuenta con ese email')
    } else {
      console.error('No se pudo crear la cuenta:', error.name)
    }

    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

await crearAdmin()