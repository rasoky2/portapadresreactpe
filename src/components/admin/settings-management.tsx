'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  Database,
  Shield,
  Globe,
  Clock
} from 'lucide-react'

interface SystemSettings {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  academicYear: string
  semester: string
  maxStudentsPerClass: number
  attendanceThreshold: number
  // Notificaciones eliminadas
  mpAccessToken?: string
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>({
    schoolName: 'Colegio San José',
    schoolAddress: 'Calle Principal 123, Ciudad',
    schoolPhone: '+1 234 567 8900',
    schoolEmail: 'info@colegiosanjose.edu',
    academicYear: '2025',
    semester: 'Bimestre 1',
    maxStudentsPerClass: 30,
    attendanceThreshold: 80,
    mpAccessToken: ''
  })

  const [loading, setLoading] = useState(false)

  // Cargar token existente desde DB
  useEffect(() => {
    fetch('/api/admin/settings/mp-token')
      .then(r => r.json())
      .then(data => {
        if (data?.mpAccessToken !== undefined) {
          setSettings(prev => ({ ...prev, mpAccessToken: data.mpAccessToken }))
        }
      })
      .catch(() => {})
  }, [])

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Aquí implementarías la lógica para guardar en la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular guardado
      // Guardar info del colegio y académica en DB
      try {
        await fetch('/api/admin/settings/school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolName: settings.schoolName,
            schoolAddress: settings.schoolAddress,
            schoolPhone: settings.schoolPhone,
            schoolEmail: settings.schoolEmail,
            academicYear: settings.academicYear,
            currentBimester: settings.semester.replace('Bimestre ', ''),
            gradingScale: String(settings.gradingScale),
            maxStudentsPerClass: String(settings.maxStudentsPerClass),
            attendanceThreshold: String(settings.attendanceThreshold)
          })
        })
      } catch {}
      // Guardar en DB via API
      try {
        await fetch('/api/admin/settings/mp-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mpAccessToken: settings.mpAccessToken || '' })
        })
      } catch {}
      alert('Configuración guardada exitosamente')
    } catch (error) {
      alert('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona la configuración general del portal escolar</p>
      </div>

      <div className="space-y-6">
        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Información del Colegio
            </CardTitle>
            <CardDescription>
              Configura los datos básicos de la institución
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schoolName">Nombre del Colegio</Label>
                <Input
                  id="schoolName"
                  value={settings.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="schoolEmail">Email</Label>
                <Input
                  id="schoolEmail"
                  type="email"
                  value={settings.schoolEmail}
                  onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schoolAddress">Dirección</Label>
              <Input
                id="schoolAddress"
                value={settings.schoolAddress}
                onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schoolPhone">Teléfono</Label>
                <Input
                  id="schoolPhone"
                  value={settings.schoolPhone}
                  onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Configuración Académica
            </CardTitle>
            <CardDescription>
              Define parámetros del año académico y calificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academicYear">Año Académico</Label>
                <select
                  id="academicYear"
                  value={settings.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
              <div>
                <Label htmlFor="semester">Bimestre actual</Label>
                <select
                  value={settings.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Bimestre 1">Bimestre 1</option>
                  <option value="Bimestre 2">Bimestre 2</option>
                  <option value="Bimestre 3">Bimestre 3</option>
                  <option value="Bimestre 4">Bimestre 4</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxStudents">Máx. Estudiantes por Clase</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={settings.maxStudentsPerClass}
                  onChange={(e) => handleInputChange('maxStudentsPerClass', Number.parseInt(e.target.value, 10))}
                />
              </div>
              {/* Escala fija a 20 - removida del formulario */}
              <div>
                <Label htmlFor="attendanceThreshold">Umbral de Asistencia (%)</Label>
                <Input
                  id="attendanceThreshold"
                  type="number"
                  value={settings.attendanceThreshold}
                  onChange={(e) => handleInputChange('attendanceThreshold', Number.parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integraciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Integraciones
            </CardTitle>
            <CardDescription>
              Configura credenciales para servicios externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mp_token">Mercado Pago Access Token (demo)</Label>
              <Input
                id="mp_token"
                type="password"
                placeholder="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.mpAccessToken || ''}
                onChange={(e) => handleInputChange('mpAccessToken', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Se guarda localmente para pruebas. En producción, usa variables de entorno del servidor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Información del Sistema
            </CardTitle>
            <CardDescription>
              Detalles técnicos del portal escolar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Versión del Sistema</span>
                  <span className="text-sm text-gray-900">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Base de Datos</span>
                  <span className="text-sm text-gray-900">SQLite 3.x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Framework</span>
                  <span className="text-sm text-gray-900">Next.js 15</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Usuarios Registrados</span>
                  <span className="text-sm text-gray-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Estudiantes</span>
                  <span className="text-sm text-gray-900">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Última Actualización</span>
                  <span className="text-sm text-gray-900">Hoy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Restaurar Valores por Defecto
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}
