import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const teachers = await db.getAllDocentes()
    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error obteniendo docentes:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const teacherData = await request.json()
    
    // Validar datos requeridos
    if (!teacherData.usuario || !teacherData.contraseña || !teacherData.nombre || !teacherData.apellido) {
      return NextResponse.json(
        { message: 'Usuario, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    // Crear el docente
    const result = await db.createUser({
      usuario: teacherData.usuario,
      contraseña: teacherData.contraseña,
      idRol: teacherData.idRol || 2, // Rol de docente por defecto
      nombre: teacherData.nombre,
      apellido: teacherData.apellido,
      email: teacherData.email || null,
      telefono: teacherData.telefono || null
    })

    return NextResponse.json({ 
      message: 'Docente creado correctamente',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creando docente:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
