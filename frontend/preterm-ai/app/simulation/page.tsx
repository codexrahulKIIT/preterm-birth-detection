'use client'
// app/simulation/page.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Shuffle, AlertCircle, Loader2, Download, RefreshCw } from 'lucide-react'
import { InputField } from '@/components/ui/InputField'
import { ResultsDashboard } from '@/components/simulation/ResultsDashboard'
import { predict, downloadPDFReport, SAMPLE_CASES } from '@/lib/api'
import { validateInput } from '@/lib/validation'
import type { PredictionInput, PredictionResponse } from '@/types/api'
import { FIELD_RANGES } from '@/types/api'

const DEFAULT_INPUT: PredictionInput = {
  count_contraction: 0,
  entropy: 0,
  contraction_times: 0,
  risk_factor: 0,
  minor_health: 0,
  lifestyle_factor: 0,
}

const FIELDS = Object.entries(FIELD_RANGES) as Array<[keyof PredictionInput, typeof FIELD_RANGES[keyof PredictionInput]]>

export default function SimulationPage() {
  const [input, setInput] = useState<Record<string, string>>(
    Object.fromEntries(Object.keys(DEFAULT_INPUT).map(k => [k, ''])) as Record<string, string>
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const setField = (key: string, val: string) => {
    setInput(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e })
  }

  const loadSample = (idx: number) => {
    const sample = SAMPLE_CASES[idx]
    setInput(Object.fromEntries(Object.entries(sample.input).map(([k, v]) => [k, String(v)])) as Record<string, string>)
    setErrors({})
    setResult(null)
    setApiError(null)
  }

  const handleSubmit = async () => {
    const parsed = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, Number(v)])
    ) as unknown as PredictionInput

    const validationErrors = validateInput(parsed)
    if (validationErrors.length > 0) {
      setErrors(Object.fromEntries(validationErrors.map(e => [e.field, e.message])))
      return
    }

    setLoading(true)
    setApiError(null)
    setResult(null)

    try {
      const res = await predict(parsed)
      if (res.ok) {
        setResult(res as PredictionResponse)
      } else {
        setApiError(res.message || res.errors?.join(', ') || 'An error occurred')
      }
    } catch (e) {
      setApiError('Failed to connect to AI backend. Check Flask server and NEXT_PUBLIC_API_BASE.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!result) return
    setDownloading(true)
    const parsed = Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, Number(v)])
    ) as unknown as PredictionInput
    try {
      const blob = await downloadPDFReport(parsed)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'preterm_ai_risk_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 text-xs text-cyan-700 font-semibold mb-4">
            <Brain size={12} />
            AI Risk Simulation Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Preterm Birth Risk Assessment
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Enter maternal clinical indicators below. The AI model will analyze the inputs
            and generate a comprehensive risk assessment with explainability.
          </p>
        </motion.div>

        <div className="grid xl:grid-cols-[420px_1fr] gap-6 items-start">
          {/* -- LEFT: INPUT FORM -- */}
          <div className="space-y-4">
            {/* Sample buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shuffle size={13} className="text-cyan-600" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Quick Load Sample</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_CASES.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => loadSample(i)}
                    className={`text-xs px-2 py-2 rounded-lg border transition-all font-medium
                      ${i === 0 ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' :
                        i === 1 ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' :
                          'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
                  >
                    {c.label.split(' ')[0]}<br />{c.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Form fields */}
            <div className="glass-card rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Clinical Parameters</span>
              </div>

              {FIELDS.map(([key, range], i) => (
                <InputField
                  key={key}
                  name={key}
                  label={range.label}
                  value={input[key]}
                  onChange={(v) => setField(key, v)}
                  min={range.min}
                  max={range.max}
                  unit={range.unit}
                  error={errors[key]}
                  delay={i * 0.05}
                />
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-xl p-3 border-red-500/20 flex items-start gap-2"
                >
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{apiError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl font-semibold text-white relative overflow-hidden
                bg-gradient-to-r from-cyan-600 to-teal-600 shadow-xl shadow-cyan-600/20
                disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  AI analyzing maternal health indicators...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Brain size={16} />
                  Generate Risk Assessment
                </span>
              )}
            </motion.button>

            {/* PDF Download */}
            {result && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleDownloadPDF}
                disabled={downloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-2xl font-medium text-sm glass-card border-cyan-200 hover:border-cyan-300 text-cyan-700 flex items-center justify-center gap-2 transition-all"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download PDF Report
              </motion.button>
            )}

            {result && (
              <button
                onClick={() => { setResult(null); setApiError(null) }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} /> Reset & Start Over
              </button>
            )}
          </div>

          {/* -- RIGHT: RESULTS -- */}
          <div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-3xl"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-2 border-cyan-200 rounded-full animate-spin border-t-cyan-600" />
                    <Brain size={24} className="text-cyan-600 absolute inset-0 m-auto" />
                  </div>
                  <h3 className="text-slate-900 font-semibold mb-2">Analyzing Clinical Data</h3>
                  <p className="text-slate-600 text-sm text-center max-w-xs">
                    AI is processing maternal health indicators and computing risk factors...
                  </p>
                  <div className="mt-6 flex gap-1">
                    {[0, 0.2, 0.4].map(d => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 bg-cyan-600 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ResultsDashboard result={result} />
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-3xl border-dashed"
                >
                  <Brain size={48} className="text-cyan-700/60 mb-4" />
                  <h3 className="text-slate-700 font-medium mb-1">No Assessment Yet</h3>
                  <p className="text-slate-600 text-sm text-center max-w-xs">
                    Fill in the clinical parameters and click "Generate Risk Assessment" to see AI-powered results.
                  </p>
                  <div className="mt-6 flex gap-2">
                    {SAMPLE_CASES.map((c, i) => (
                      <button key={i} onClick={() => loadSample(i)} className="text-xs text-cyan-700 hover:text-cyan-900 underline">
                        {c.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

