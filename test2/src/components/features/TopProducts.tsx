'use client'

import Image from 'next/image'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Product {
  id: number
  name: string
  image: string
  sales: number
  revenue: number
  trend: number
}

export default function TopProducts() {
  const products: Product[] = [
    {
      id: 1,
      name: "プレミアムフェイスクリーム",
      image: "https://picsum.photos/id/100/64/64",
      sales: 1234,
      revenue: 2345678,
      trend: 12.5
    },
    {
      id: 2,
      name: "オーガニックシャンプー",
      image: "https://picsum.photos/id/101/64/64",
      sales: 987,
      revenue: 1876543,
      trend: -2.3
    },
    {
      id: 3,
      name: "美容液セット",
      image: "https://picsum.photos/id/102/64/64",
      sales: 876,
      revenue: 1654321,
      trend: 5.8
    }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">人気商品</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-3">商品</th>
              <th className="text-right pb-3">売上数</th>
              <th className="text-right pb-3">売上金額</th>
              <th className="text-right pb-3">トレンド</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="py-4">
                  <div className="flex items-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="ml-3">{product.name}</span>
                  </div>
                </td>
                <td className="text-right">{product.sales.toLocaleString()}</td>
                <td className="text-right">¥{product.revenue.toLocaleString()}</td>
                <td className="text-right">
                  <div className={`flex items-center justify-end ${
                    product.trend >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {product.trend >= 0 ? 
                      <ArrowUpRight size={16} /> : 
                      <ArrowDownRight size={16} />
                    }
                    <span className="ml-1">{Math.abs(product.trend)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 