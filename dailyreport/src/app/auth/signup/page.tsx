'use client'

import React, { useEffect } from 'react'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [isLoading, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4">
        <SignUpForm />
      </div>
    </div>
  )
} 