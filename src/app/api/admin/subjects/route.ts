import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const subjects = await db.getAllMaterias()
    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Error obteniendo materias:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    const result = await db.run(`
      INSERT INTO Materias (NombreMateria, IdNivel, HorasSemanales)
      VALUES (?, ?, ?)
    `, [
      subjectData.nombreMateria,
      subjectData.idNivel,
      subjectData.horasSemanales
    ])

    return NextResponse.json({
      message: 'Materia creada correctamente',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creando materia:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
