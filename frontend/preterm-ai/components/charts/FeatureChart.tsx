'use client'
// components/charts/FeatureChart.tsx
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import type { ContributionPoint } from '@/types/api'

interface FeatureChartProps {
  data: ContributionPoint[]
}

const COLORS = ['#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa']

export function FeatureChart({ data }: FeatureChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      style={{ width: '100%', height: 200 }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,212,191,0.06)" />
          <XAxis
            dataKey="feature"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(7,20,40,0.95)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: 8,
              fontSize: 12,
              color: '#e2e8f0',
            }}
            formatter={(val: number) => [`${val}%`, 'Contribution']}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

