'use client'
// components/ui/InputField.tsx
import { motion } from 'framer-motion'

interface InputFieldProps {
  name: string
  label: string
  value: string | number
  onChange: (val: string) => void
  min: number
  max: number
  unit?: string
  error?: string
  delay?: number
}

export function InputField({ name, label, value, onChange, min, max, unit, error, delay = 0 }: InputFieldProps) {
  const num = Number(value)
  const pct = isNaN(num) ? 0 : Math.max(0, Math.min(100, ((num - min) / (max - min)) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={name} className="text-xs font-medium text-slate-600 uppercase tracking-wide">
          {label}
        </label>
        {unit && (
          <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            {min}-{max} {unit}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          min={min}
          max={max}
          step={name === 'entropy' ? '0.1' : '1'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`medical-input w-full rounded-xl px-3.5 py-2.5 text-sm font-mono
            ${error ? 'border-red-500/50 focus:border-red-500' : ''}`}
          placeholder={`e.g. ${Math.round((min + max) / 2)}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
          {unit}
        </div>
      </div>

      <div className="mt-1.5 h-0.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full inline-block" />
          {error}
        </p>
      )}
    </motion.div>
  )
}

