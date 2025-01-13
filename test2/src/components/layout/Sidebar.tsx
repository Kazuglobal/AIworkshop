'use client'

import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageCircle,
  Mail,
  BarChart2,
  Share2,
  Activity,
  User,
  Users2,
  Settings,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  const mainMenu = [
    { icon: LayoutDashboard, label: 'ダッシュボード', href: '/' },
    { icon: Package, label: '商品', href: '/products' },
    { icon: ShoppingCart, label: '注文', href: '/orders' },
    { icon: Users, label: '顧客', href: '/customers' },
    { icon: MessageCircle, label: 'チャット', href: '/chat' },
  ]

  const secondaryMenu = [
    { icon: Mail, label: 'メール', href: '/email' },
    { icon: BarChart2, label: '分析', href: '/analytics' },
    { icon: Share2, label: '連携', href: '/integration' },
    { icon: Activity, label: 'パフォーマンス', href: '/performance' },
  ]

  const accountMenu = [
    { icon: User, label: 'アカウント', href: '/account' },
    { icon: Users2, label: 'メンバー', href: '/members' },
    { icon: Settings, label: '設定', href: '/settings' },
    { icon: MessageSquare, label: 'フィードバック', href: '/feedback' },
  ]

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Analytics</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {mainMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 px-3 py-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            その他
          </div>
          {secondaryMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 px-3 py-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            アカウント
          </div>
          {accountMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
} 