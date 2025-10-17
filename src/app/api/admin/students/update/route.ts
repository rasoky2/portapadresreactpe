import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function PUT(request: Request) {
  try {
    const studentData = await request.json()
    
    // Validar datos requeridos
    if (!studentData.IdHijo) {
      return NextResponse.json(
        { message: 'ID del estudiante es requerido' },
        { status: 400 }
      )
    }

    if (!studentData.NombreHijo || !studentData.ApellidoHijo) {
      return NextResponse.json(
        { message: 'Nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    if (!studentData.FechaNacimiento) {
      return NextResponse.json(
        { message: 'Fecha de nacimiento es requerida' },
        { status: 400 }
      )
    }

    if (!studentData.IdGrado || !studentData.IdSeccion) {
      return NextResponse.json(
        { message: 'Grado y sección son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el estudiante existe
    const existingStudent = await db.get(
      'SELECT IdHijo FROM Hijos WHERE IdHijo = ?',
      [studentData.IdHijo]
    )

    if (!existingStudent) {
      return NextResponse.json(
        { message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el estudiante
    const result = await db.runWithInfo(`
      UPDATE Hijos 
      SET 
        NombreHijo = ?,
        ApellidoHijo = ?,
        FechaNacimiento = ?,
        Edad = ?,
        IdGrado = ?,
        IdSeccion = ?,
        CodigoEstudiante = ?,
        Estado = ?
      WHERE IdHijo = ?
    `, [
      studentData.NombreHijo,
      studentData.ApellidoHijo,
      studentData.FechaNacimiento,
      studentData.Edad,
      studentData.IdGrado,
      studentData.IdSeccion,
      studentData.CodigoEstudiante || null,
      studentData.Estado || 'Activo',
      studentData.IdHijo
    ])

    if (result.changes === 0) {
      return NextResponse.json(
        { message: 'No se realizaron cambios en el estudiante' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Estudiante actualizado exitosamente',
      changes: result.changes
    })

  } catch (error) {
    // Error actualizando estudiante
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
