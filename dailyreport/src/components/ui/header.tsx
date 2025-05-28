import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/supabase/auth-context'

export function Header() {
  const { user, signOut } = useAuth()
  
  const handleSignOut = async () => {
    await signOut()
  }
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Culture Bridge Program 2025
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  ダッシュボード
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-blue-600"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 