import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { message: 'Nombre de usuario requerido' },
        { status: 400 }
      )
    }
    
    // Verificar si el nombre de usuario ya existe
    const isAvailable = await db.isUsernameAvailable(username)
    
    const message = isAvailable 
      ? 'Nombre de usuario disponible' 
      : 'El nombre de usuario ya está en uso'
    
    return NextResponse.json({
      available: isAvailable,
      message
    })
    
  } catch {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
