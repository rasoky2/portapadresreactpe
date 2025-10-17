import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const users = await db.getAllUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function validateRequiredFields(data: Record<string, unknown>): boolean {
  const requiredFields = ['usuario', 'contraseña', 'idRol', 'nombre', 'apellido']
  return requiredFields.every(field => Boolean(data[field]))
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    
    // Mapear los nombres de campos del frontend a los esperados por la base de datos
    const mappedUserData = {
      usuario: userData.Usuario || userData.usuario,
      contraseña: userData.Contraseña || userData.contraseña,
      idRol: userData.IdRol || userData.idRol,
      nombre: userData.Nombre || userData.nombre,
      apellido: userData.Apellido || userData.apellido,
      email: userData.Email || userData.email,
      telefono: userData.Telefono || userData.telefono
    }
    
    // Validar datos requeridos
    if (!validateRequiredFields(mappedUserData)) {
      return NextResponse.json(
        { message: 'Usuario, contraseña, ID de rol, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    const result = await db.createUser(mappedUserData)
    return NextResponse.json({ 
      message: 'Usuario creado exitosamente',
      id: result.lastID 
    })
  } catch (error) {
    // Error creando usuario
    let errorMessage = 'Error interno del servidor'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed: Usuarios.Usuario')) {
        errorMessage = 'El nombre de usuario ya existe. Por favor, elige otro nombre de usuario.'
        statusCode = 409 // Conflict
      } else if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = 'Ya existe un registro con estos datos. Por favor, verifica la información.'
        statusCode = 409 // Conflict
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    )
  }
}
