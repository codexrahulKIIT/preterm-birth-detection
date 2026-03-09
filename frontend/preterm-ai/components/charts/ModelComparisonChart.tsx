'use client'
// components/charts/ModelComparisonChart.tsx
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ModelComparison } from '@/types/api'

interface ModelComparisonChartProps {
  data: ModelComparison[]
}

const COLORS = ['#2dd4bf', '#22d3ee', '#818cf8', '#f472b6']

export function ModelComparisonChart({ data }: ModelComparisonChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      style={{ width: '100%', height: 220 }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,212,191,0.06)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(7,20,40,0.95)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
            formatter={(val: number) => [`${val}%`, 'Accuracy']}
          />
          <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

