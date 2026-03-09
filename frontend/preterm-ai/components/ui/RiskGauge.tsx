'use client'
// components/ui/RiskGauge.tsx
import { motion } from 'framer-motion'
import type { RiskLevel } from '@/types/api'
import { RISK_CONFIG } from '@/types/api'

interface RiskGaugeProps {
  score: number
  riskLevel: RiskLevel
  label?: string
}

export function RiskGauge({ score, riskLevel, label = 'Risk Score' }: RiskGaugeProps) {
  const config = RISK_CONFIG[riskLevel]
  const radius = 80
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const pct = Math.min(100, Math.max(0, score))
  // Only draw 270deg arc (not full circle)
  const arcLength = circumference * 0.75
  const dashOffset = arcLength - (pct / 100) * arcLength

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(135deg)' }}>
          {/* Background arc */}
          <circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none"
            stroke="rgba(45,212,191,0.1)"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none"
            stroke={config.color}
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${config.color}60)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={`text-3xl font-bold ${config.text}`}
          >
            {pct}
          </motion.div>
          <div className="text-xs text-slate-500 font-mono">/100</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-semibold mt-0.5 ${config.text}`}>{riskLevel} RISK</div>
      </div>
    </div>
  )
}

