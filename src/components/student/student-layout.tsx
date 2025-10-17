'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { BookOpen, Calendar, GraduationCap, Home } from 'lucide-react'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-gray-900">Portal de Estudiantes</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/student" className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><Home className="w-4 h-4" /> Inicio</Link>
            <Link href="/student/grades" className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><BookOpen className="w-4 h-4" /> Calificaciones</Link>
            <Link href="/student/calendar" className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><Calendar className="w-4 h-4" /> Calendario</Link>
          </nav>
        </div>
      </header>
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}


