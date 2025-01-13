'use client'

import { ReactNode } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  icon: ReactNode
  trend: number
}

export default function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  const isPositive = trend >= 0

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-gray-500">{title}</div>
        <div className="text-gray-600">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className={`mt-2 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        <span className="ml-1">{Math.abs(trend)}%</span>
      </div>
    </div>
  )
} 