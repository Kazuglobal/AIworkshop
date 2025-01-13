'use client'

import { Filter, Plus } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">ダッシュボード</h2>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Filter className="w-5 h-5 mr-2" />
            フィルター
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            ウィジェットを追加
          </button>
        </div>
      </div>
    </header>
  )
} 