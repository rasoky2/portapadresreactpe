import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const teacherId = parseInt(id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: 'ID de docente inválido' },
        { status: 400 }
      )
    }

    const assignments = await db.getTeacherAssignments(teacherId)
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error obteniendo asignaciones del docente:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const teacherId = parseInt(id)
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { message: 'ID de docente inválido' },
        { status: 400 }
      )
    }

    const { assignments } = await request.json()
    
    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { message: 'Las asignaciones deben ser un array' },
        { status: 400 }
      )
    }

    // Eliminar asignaciones existentes del docente
    await db.run('DELETE FROM DocenteMateriaGrado WHERE IdUsuario = ?', [teacherId])

    // Insertar nuevas asignaciones
    for (const assignment of assignments) {
      await db.run(`
        INSERT INTO DocenteMateriaGrado (IdUsuario, IdMateria, IdGrado, IdSeccion)
        VALUES (?, ?, ?, ?)
      `, [
        teacherId,
        assignment.IdMateria,
        assignment.IdGrado,
        assignment.IdSeccion
      ])
    }

    return NextResponse.json({ 
      message: 'Asignaciones guardadas correctamente',
      count: assignments.length 
    })
  } catch (error) {
    console.error('Error guardando asignaciones del docente:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
