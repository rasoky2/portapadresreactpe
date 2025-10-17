import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function POST(request: Request) {
  try {
    const studentData = await request.json()
    console.log('Datos recibidos para crear estudiante:', JSON.stringify(studentData, null, 2))
    
    // Validar datos requeridos
    if (!studentData.nombreHijo || !studentData.apellidoHijo || !studentData.fechaNacimiento) {
      console.log('Error de validación: datos requeridos faltantes', {
        nombreHijo: studentData.nombreHijo,
        apellidoHijo: studentData.apellidoHijo,
        fechaNacimiento: studentData.fechaNacimiento
      })
      return NextResponse.json(
        { message: 'Nombre, apellido y fecha de nacimiento son requeridos' },
        { status: 400 }
      )
    }

    // Validar que se haya seleccionado un padre
    if (!studentData.idPadre || studentData.idPadre === 0) {
      console.log('Error de validación: padre no seleccionado', {
        idPadre: studentData.idPadre
      })
      return NextResponse.json(
        { message: 'Debe seleccionar un padre para el estudiante' },
        { status: 400 }
      )
    }

    // Verificar que el padre existe en la base de datos
    try {
      const parentExists = await db.get(`SELECT IdPadre FROM Padres WHERE IdPadre = ?`, [studentData.idPadre])
      if (!parentExists) {
        console.log('Error: El padre seleccionado no existe en la base de datos', {
          idPadre: studentData.idPadre
        })
        return NextResponse.json(
          { message: 'El padre seleccionado no existe' },
          { status: 400 }
        )
      }
      console.log('Padre verificado correctamente:', parentExists)
    } catch (error) {
      console.error('Error verificando padre:', error)
      return NextResponse.json(
        { message: 'Error verificando el padre seleccionado' },
        { status: 500 }
      )
    }

    // Verificar que el grado existe si se proporciona
    if (studentData.idGrado) {
      try {
        const gradeExists = await db.get(`SELECT IdGrado FROM Grados WHERE IdGrado = ?`, [studentData.idGrado])
        if (!gradeExists) {
          console.log('Error: El grado seleccionado no existe en la base de datos', {
            idGrado: studentData.idGrado
          })
          return NextResponse.json(
            { message: 'El grado seleccionado no existe' },
            { status: 400 }
          )
        }
        console.log('Grado verificado correctamente:', gradeExists)
      } catch (error) {
        console.error('Error verificando grado:', error)
        return NextResponse.json(
          { message: 'Error verificando el grado seleccionado' },
          { status: 500 }
        )
      }
    }

    // Verificar que la sección existe si se proporciona
    if (studentData.idSeccion) {
      try {
        const sectionExists = await db.get(`SELECT IdSeccion FROM Secciones WHERE IdSeccion = ?`, [studentData.idSeccion])
        if (!sectionExists) {
          console.log('Error: La sección seleccionada no existe en la base de datos', {
            idSeccion: studentData.idSeccion
          })
          return NextResponse.json(
            { message: 'La sección seleccionada no existe' },
            { status: 400 }
          )
        }
        console.log('Sección verificada correctamente:', sectionExists)
      } catch (error) {
        console.error('Error verificando sección:', error)
        return NextResponse.json(
          { message: 'Error verificando la sección seleccionada' },
          { status: 500 }
        )
      }
    }

    // Verificar que la sección pertenece al grado seleccionado
    if (studentData.idGrado && studentData.idSeccion) {
      try {
        const sectionGradeMatch = await db.get(`
          SELECT IdSeccion FROM Secciones 
          WHERE IdSeccion = ? AND IdGrado = ?
        `, [studentData.idSeccion, studentData.idGrado])
        
        if (!sectionGradeMatch) {
          console.log('Error: La sección no pertenece al grado seleccionado', {
            idSeccion: studentData.idSeccion,
            idGrado: studentData.idGrado
          })
          return NextResponse.json(
            { message: 'La sección seleccionada no pertenece al grado seleccionado' },
            { status: 400 }
          )
        }
        console.log('Relación sección-grado verificada correctamente:', sectionGradeMatch)
      } catch (error) {
        console.error('Error verificando relación sección-grado:', error)
        return NextResponse.json(
          { message: 'Error verificando la relación entre sección y grado' },
          { status: 500 }
        )
      }
    }

    console.log('Datos validados correctamente, procediendo a crear estudiante...')

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

    console.log('Estudiante creado exitosamente:', result)

    return NextResponse.json({ 
      message: 'Estudiante creado correctamente',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creando estudiante:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
