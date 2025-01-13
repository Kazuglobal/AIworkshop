'use client'

import { ResponsiveHeatMap } from '@nivo/heatmap'

export default function VisitorHeatmap() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['月', '火', '水', '木', '金', '土', '日']

  const generateData = () => {
    return days.map(day => ({
      id: day,
      data: hours.map(hour => ({
        x: hour,
        y: Math.floor(Math.random() * 100)
      }))
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">時間帯別訪問者数</h3>
      <div style={{ height: '400px' }}>
        <ResponsiveHeatMap
          data={generateData()}
          margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
          valueFormat=">-.2s"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: '',
            legendOffset: 46
          }}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: '',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: -40
          }}
          colors={{
            type: 'sequential',
            scheme: 'blues'
          }}
          emptyColor="#eeeeee"
          borderColor="#ffffff"
          legends={[
            {
              anchor: 'bottom',
              translateX: 0,
              translateY: 30,
              length: 400,
              thickness: 8,
              direction: 'row',
              tickPosition: 'after',
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              title: '訪問者数',
              titleAlign: 'start',
              titleOffset: 4
            }
          ]}
        />
      </div>
    </div>
  )
} 