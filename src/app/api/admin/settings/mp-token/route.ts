import { NextResponse } from 'next/server'
import { Database } from '@/lib/database'

const db = new Database()

export async function GET() {
  try {
    const value = await db.getSetting('MP_ACCESS_TOKEN')
    return NextResponse.json({ mpAccessToken: value || '' })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { mpAccessToken } = await request.json()
    if (typeof mpAccessToken !== 'string') {
      return NextResponse.json({ message: 'mpAccessToken requerido' }, { status: 400 })
    }
    await db.setSetting('MP_ACCESS_TOKEN', mpAccessToken)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
