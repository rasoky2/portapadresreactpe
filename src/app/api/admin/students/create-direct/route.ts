import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const studentData = await request.json()
    
    // Validar datos requeridos
    if (!studentData.nombreHijo || !studentData.apellidoHijo || !studentData.fechaNacimiento) {
      return NextResponse.json(
        { message: 'Nombre, apellido y fecha de nacimiento son requeridos' },
        { status: 400 }
      )
    }

    // Validar que se haya seleccionado un padre
    if (!studentData.idPadre || studentData.idPadre === 0) {
      return NextResponse.json(
        { message: 'Debe seleccionar un padre para el estudiante' },
        { status: 400 }
      )
    }

    // Crear el estudiante
    const result = await db.createStudent({
      nombreHijo: studentData.nombreHijo,
      apellidoHijo: studentData.apellidoHijo,
      fechaNacimiento: studentData.fechaNacimiento,
      edad: studentData.edad,
      idGrado: studentData.idGrado || null,
      idSeccion: studentData.idSeccion || null,
      codigoEstudiante: studentData.codigoEstudiante || null,
      estado: studentData.estado || 'Activo',
      idPadre: studentData.idPadre
    })

    return NextResponse.json({ 
      message: 'Estudiante creado correctamente',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creando estudiante:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
