import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    // Obtener estadísticas de usuarios
    const users = await db.getAllUsers()
    const students = await db.getAllAlumnos()
    const teachers = await db.getAllDocentes()
    const parents = await db.getAllPadres()

    // Obtener estadísticas de asistencia (últimos 7 días)
    const attendanceQuery = `
      SELECT COUNT(*) as count 
      FROM Asistencia 
      WHERE Fecha >= date('now', '-7 days') AND Asistio = 1
    `
    const attendanceResult = await db.get(attendanceQuery) as { count: number } | undefined

    // Obtener eventos próximos (próximos 7 días)
    const eventsQuery = `
      SELECT COUNT(*) as count 
      FROM Calendario 
      WHERE Fecha BETWEEN date('now') AND date('now', '+7 days')
    `
    const eventsResult = await db.get(eventsQuery) as { count: number } | undefined

    const stats = {
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalParents: parents.length,
      recentAttendance: attendanceResult?.count || 0,
      upcomingEvents: eventsResult?.count || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
