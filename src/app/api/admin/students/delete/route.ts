import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json(
        { message: 'ID de estudiante requerido' },
        { status: 400 }
      )
    }

    const id = parseInt(studentId)
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de estudiante inválido' },
        { status: 400 }
      )
    }

    // Verificar si el estudiante existe
    const student = await db.get('SELECT IdHijo FROM Hijos WHERE IdHijo = ?', [id])
    if (!student) {
      return NextResponse.json(
        { message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el estudiante
    await db.run('DELETE FROM Hijos WHERE IdHijo = ?', [id])

    return NextResponse.json({ message: 'Estudiante eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando estudiante:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
