'use client'
// components/ui/Cards.tsx
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ModelMetadata, RiskLevel } from '@/types/api'
import { RISK_CONFIG } from '@/types/api'

interface ConfidenceMeterProps {
  value: number
  label?: string
}

export function ConfidenceMeter({ value, label = 'Model Confidence' }: ConfidenceMeterProps) {
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>
  )
}

interface InsightCardProps {
  title: string
  children: ReactNode
  icon?: ReactNode
  className?: string
  delay?: number
}

export function InsightCard({ title, children, icon, className = '', delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-cyan-700">{icon}</div>}
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = RISK_CONFIG[level]
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${config.bg} ${config.border} ${config.text}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: config.color }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: config.color }}
        />
      </span>
      {level} RISK
    </motion.div>
  )
}

export function MetadataPanel({ metadata }: { metadata: ModelMetadata }) {
  const rows = [
    ['Model', metadata.model_type],
    ['Accuracy', metadata.accuracy],
    ['Precision', metadata.precision],
    ['Recall', metadata.recall],
    ['F1 Score', metadata.f1_score],
    ['Training Samples', String(metadata.training_samples)],
    ['Features', String(metadata.features)],
    ['Test Split', String(metadata.test_split)],
    ['Trained', metadata.training_date],
  ]

  return (
    <div className="space-y-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between py-1 border-b border-slate-200">
          <span className="text-xs text-slate-600">{k}</span>
          <span className="text-xs font-mono text-cyan-700">{v}</span>
        </div>
      ))}
    </div>
  )
}

