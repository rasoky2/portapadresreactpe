import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const teacherId = parseInt(id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: 'ID de docente inválido' },
        { status: 400 }
      )
    }

    const teacherData = await request.json()
    
    // Validar datos requeridos
    if (!teacherData.usuario || !teacherData.nombre || !teacherData.apellido) {
      return NextResponse.json(
        { message: 'Usuario, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el docente existe
    const teacher = await db.get('SELECT IdUsuario FROM Usuarios WHERE IdUsuario = ? AND IdRol = 2', [teacherId])
    if (!teacher) {
      return NextResponse.json(
        { message: 'Docente no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el docente
    if (teacherData.contraseña && teacherData.contraseña.trim()) {
      // Si se proporciona nueva contraseña, actualizar con ella
      await db.run(`
        UPDATE Usuarios 
        SET Usuario = ?, Contraseña = ?, Nombre = ?, Apellido = ?, Email = ?, Telefono = ?
        WHERE IdUsuario = ?
      `, [
        teacherData.usuario,
        teacherData.contraseña,
        teacherData.nombre,
        teacherData.apellido,
        teacherData.email || null,
        teacherData.telefono || null,
        teacherId
      ])
    } else {
      // Si no se proporciona contraseña, mantener la actual
      await db.run(`
        UPDATE Usuarios 
        SET Usuario = ?, Nombre = ?, Apellido = ?, Email = ?, Telefono = ?
        WHERE IdUsuario = ?
      `, [
        teacherData.usuario,
        teacherData.nombre,
        teacherData.apellido,
        teacherData.email || null,
        teacherData.telefono || null,
        teacherId
      ])
    }

    return NextResponse.json({ message: 'Docente actualizado correctamente' })
  } catch (error) {
    console.error('Error actualizando docente:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const teacherId = parseInt(id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: 'ID de docente inválido' },
        { status: 400 }
      )
    }

    // Verificar si el docente existe
    const teacher = await db.get('SELECT IdUsuario FROM Usuarios WHERE IdUsuario = ? AND IdRol = 2', [teacherId])
    if (!teacher) {
      return NextResponse.json(
        { message: 'Docente no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el docente
    await db.run('DELETE FROM Usuarios WHERE IdUsuario = ?', [teacherId])

    return NextResponse.json({ message: 'Docente eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando docente:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
