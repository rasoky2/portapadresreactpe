import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const user = await db.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar usuario
    await db.deleteUser(userId)

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)
    const userData = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const user = await db.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Asegurar campos requeridos por updateUser
    const current = user as any
    const payload = {
      usuario: userData.usuario ?? current.Usuario,
      contraseña: userData.contraseña ?? current.Contraseña,
      idRol: userData.idRol ?? current.IdRol,
      nombre: userData.nombre ?? current.Nombre ?? null,
      apellido: userData.apellido ?? current.Apellido ?? null,
      email: userData.email ?? current.Email ?? null,
      telefono: userData.telefono ?? current.Telefono ?? null,
    }

    // Actualizar usuario
    await db.updateUser(userId, payload as any)

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
