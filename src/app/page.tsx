import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir al login por defecto
  redirect('/login')
}