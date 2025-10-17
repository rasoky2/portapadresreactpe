import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

const KEYS = {
  schoolName: 'SCHOOL_NAME',
  schoolAddress: 'SCHOOL_ADDRESS',
  schoolPhone: 'SCHOOL_PHONE',
  schoolEmail: 'SCHOOL_EMAIL',
  academicYear: 'ACADEMIC_YEAR',
  currentBimester: 'CURRENT_BIMESTER',
  maxStudentsPerClass: 'MAX_STUDENTS_PER_CLASS',
  attendanceThreshold: 'ATTENDANCE_THRESHOLD'
}

export async function GET() {
  try {
    const schoolName = await db.getSetting(KEYS.schoolName)
    const schoolAddress = await db.getSetting(KEYS.schoolAddress)
    const schoolPhone = await db.getSetting(KEYS.schoolPhone)
    const schoolEmail = await db.getSetting(KEYS.schoolEmail)
    const academicYear = await db.getSetting(KEYS.academicYear)
    const currentBimester = await db.getSetting(KEYS.currentBimester)
    const maxStudentsPerClass = await db.getSetting(KEYS.maxStudentsPerClass)
    const attendanceThreshold = await db.getSetting(KEYS.attendanceThreshold)
    return NextResponse.json({ schoolName, schoolAddress, schoolPhone, schoolEmail, academicYear, currentBimester, maxStudentsPerClass, attendanceThreshold })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ message: 'Payload inválido' }, { status: 400 })
    }
    const tasks: Promise<unknown>[] = []
    if (typeof body.schoolName === 'string') tasks.push(db.setSetting(KEYS.schoolName, body.schoolName))
    if (typeof body.schoolAddress === 'string') tasks.push(db.setSetting(KEYS.schoolAddress, body.schoolAddress))
    if (typeof body.schoolPhone === 'string') tasks.push(db.setSetting(KEYS.schoolPhone, body.schoolPhone))
    if (typeof body.schoolEmail === 'string') tasks.push(db.setSetting(KEYS.schoolEmail, body.schoolEmail))
    if (typeof body.academicYear === 'string') tasks.push(db.setSetting(KEYS.academicYear, body.academicYear))
    if (typeof body.currentBimester === 'string') tasks.push(db.setSetting(KEYS.currentBimester, body.currentBimester))
    if (typeof body.maxStudentsPerClass === 'string') tasks.push(db.setSetting(KEYS.maxStudentsPerClass, body.maxStudentsPerClass))
    if (typeof body.attendanceThreshold === 'string') tasks.push(db.setSetting(KEYS.attendanceThreshold, body.attendanceThreshold))
    if (tasks.length === 0) return NextResponse.json({ message: 'Sin cambios' })
    await Promise.all(tasks)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
