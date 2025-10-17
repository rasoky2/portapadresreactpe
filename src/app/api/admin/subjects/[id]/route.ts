import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subjectId = parseInt(id)
    if (isNaN(subjectId)) {
      return NextResponse.json(
        { message: 'ID de materia inválido' },
        { status: 400 }
      )
    }

    const subjectData = await request.json()
    
    // Validar datos requeridos
    if (!subjectData.nombreMateria || !subjectData.idNivel || !subjectData.horasSemanales) {
      return NextResponse.json(
        { message: 'Nombre de materia, nivel educativo y horas semanales son requeridos' },
        { status: 400 }
      )
    }

    // Validar que el nivel sea válido
    if (subjectData.idNivel < 1 || subjectData.idNivel > 2) {
      return NextResponse.json(
        { message: 'Nivel educativo inválido' },
        { status: 400 }
      )
    }

    // Validar horas semanales
    if (subjectData.horasSemanales < 1 || subjectData.horasSemanales > 10) {
      return NextResponse.json(
        { message: 'Las horas semanales deben estar entre 1 y 10' },
        { status: 400 }
      )
    }

    // Verificar si la materia existe
    const subject = await db.get('SELECT IdMateria FROM Materias WHERE IdMateria = ?', [subjectId])
    if (!subject) {
      return NextResponse.json(
        { message: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la materia
    await db.run(`
      UPDATE Materias 
      SET NombreMateria = ?, IdNivel = ?, HorasSemanales = ?
      WHERE IdMateria = ?
    `, [
      subjectData.nombreMateria,
      subjectData.idNivel,
      subjectData.horasSemanales,
      subjectId
    ])

    return NextResponse.json({ message: 'Materia actualizada correctamente' })
  } catch (error) {
    console.error('Error actualizando materia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subjectId = parseInt(id)
    if (isNaN(subjectId)) {
      return NextResponse.json(
        { message: 'ID de materia inválido' },
        { status: 400 }
      )
    }

    // Verificar si la materia existe
    const subject = await db.get('SELECT IdMateria FROM Materias WHERE IdMateria = ?', [subjectId])
    if (!subject) {
      return NextResponse.json(
        { message: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay asignaciones de docentes a esta materia
    const assignments = await db.get('SELECT COUNT(*) as count FROM DocenteMateriaGrado WHERE IdMateria = ?', [subjectId]) as { count: number }
    if (assignments.count > 0) {
      return NextResponse.json(
        { message: 'No se puede eliminar la materia porque tiene docentes asignados' },
        { status: 400 }
      )
    }

    // Verificar si hay notas registradas para esta materia
    const grades = await db.get('SELECT COUNT(*) as count FROM Notas WHERE IdMateria = ?', [subjectId]) as { count: number }
    if (grades.count > 0) {
      return NextResponse.json(
        { message: 'No se puede eliminar la materia porque tiene notas registradas' },
        { status: 400 }
      )
    }

    await db.run('DELETE FROM Materias WHERE IdMateria = ?', [subjectId])

    return NextResponse.json({ message: 'Materia eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando materia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
