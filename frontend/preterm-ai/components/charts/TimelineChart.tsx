'use client'
// components/charts/TimelineChart.tsx
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TimelinePoint } from '@/types/api'

interface TimelineChartProps {
  data: TimelinePoint[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      style={{ width: '100%', height: 220 }}
    >
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,212,191,0.06)" />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(7,20,40,0.95)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
            formatter={(val: number) => [`${val}%`, 'Risk']}
            labelFormatter={(label) => `Week ${label}`}
          />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2dd4bf' }}
            activeDot={{ r: 5, fill: '#22d3ee' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

