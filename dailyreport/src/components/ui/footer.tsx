import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm">
            © 2025 Culture Bridge Program. All rights reserved.
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-800 text-sm">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-800 text-sm">
              利用規約
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-800 text-sm">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 