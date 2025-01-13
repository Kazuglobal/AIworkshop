'use client'

import { BarChart3, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import MetricCard from '../shared/MetricCard'
import SalesChart from './SalesChart'
import TopProducts from './TopProducts'
import VisitorHeatmap from './VisitorHeatmap'

export default function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="総売上"
          value="¥2,456,789"
          icon={<BarChart3 />}
          trend={12.5}
        />
        <MetricCard 
          title="訪問者数"
          value="12,345"
          icon={<Users />}
          trend={-2.3}
        />
        <MetricCard 
          title="注文数"
          value="456"
          icon={<ShoppingBag />}
          trend={5.8}
        />
        <MetricCard 
          title="コンバージョン率"
          value="3.2%"
          icon={<TrendingUp />}
          trend={0.5}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <VisitorHeatmap />
      </div>
      
      <TopProducts />
    </div>
  )
} 