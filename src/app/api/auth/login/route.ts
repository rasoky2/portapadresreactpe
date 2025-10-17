import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario en la base de datos
    const user = await db.getUserByCredentials(username, password) as {
      IdUsuario: number
      Usuario: string
      NombreRol: string
      Nombre: string
      Apellido: string
      Email: string
    } | null

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Crear sesión (en un proyecto real, usarías JWT o cookies seguras)
    const session = {
      user: {
        id: user.IdUsuario,
        username: user.Usuario,
        NombreRol: user.NombreRol,
        Nombre: user.Nombre,
        Apellido: user.Apellido,
        Email: user.Email
      }
    }

    return NextResponse.json({
      message: 'Login exitoso',
      user: session.user
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
