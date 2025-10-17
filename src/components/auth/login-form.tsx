'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Alert, AlertTitle, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { User, Eye, EyeOff, GraduationCap } from 'lucide-react'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const getPasswordIcon = () => {
    if (showPassword) {
      return <EyeOff className="h-4 w-4 text-muted-foreground" />
    }
    return <Eye className="h-4 w-4 text-muted-foreground" />
  }

  const getButtonText = () => {
    if (isLoading) {
      return 'Iniciando sesión...'
    }
    return 'Iniciar sesión'
  }

  const getPasswordInputType = () => {
    if (showPassword) {
      return 'text'
    }
    return 'password'
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      username: e.target.value
    }))
    if (error) {
      setError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      password: e.target.value
    }))
    if (error) {
      setError('')
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e)
  }

  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUsernameChange(e)
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordChange(e)
  }

  const handlePasswordToggleClick = () => {
    togglePasswordVisibility()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir según el rol del usuario
        switch (data.user.NombreRol?.toLowerCase()) {
          case 'administrador':
            router.push('/admin')
            break
          case 'docente':
            router.push('/teacher')
            break
          case 'padre':
            router.push('/parent')
            break
          default:
            router.push('/')
        }
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos')
      }
    } catch {
      setError('Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background con imagen en escala de grises */}
      <div 
        className="absolute inset-0 grayscale"
        style={{
          backgroundImage: "url('/assets/images/admision2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Overlay con gradiente rojo suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/60 via-brand-600/55 to-brand-700/65"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-brand-500 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-brand-900">
                Portal de Padres
              </CardTitle>
            </div>
            <CardDescription className="text-brand-600">
              Sistema de gestión escolar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-brand-700 font-medium">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    value={formData.username}
                    onChange={handleUsernameInputChange}
                    disabled={isLoading}
                    autoComplete="username"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-700 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={getPasswordInputType()}
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handlePasswordInputChange}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handlePasswordToggleClick}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    {getPasswordIcon()}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                  <AlertTitle className="text-sm">{error}</AlertTitle>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {getButtonText()}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
