'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch('/api/auth/login')
        const { url } = await response.json()
        window.location.href = url
      } catch (error) {
        console.error('Login failed:', error)
      }
    }

    login()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>ログイン中...</p>
    </div>
  )
}