'use client'
// app/architecture/page.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Cpu, BarChart2, Brain, FileText, ChevronRight,
  Database, Shield, Layers, Zap, Code2, Activity
} from 'lucide-react'

const PIPELINE = [
  {
    id: 1, icon: Upload, label: 'Clinical Input', color: '#2dd4bf',
    desc: 'Patient biomarkers entered via validated clinical form: contraction frequency, entropy, duration, risk scores.',
    tech: ['React Form', 'TypeScript', 'Input Validation'],
    detail: 'Six carefully selected maternal health indicators form the basis of the risk assessment. Each field is validated against clinical ranges before processing.',
  },
  {
    id: 2, icon: Shield, label: 'Feature Engineering', color: '#22d3ee',
    desc: 'Raw inputs are cleaned, validated and domain-specific interaction features computed (e.g., Contractions × Entropy).',
    tech: ['Python', 'NumPy', 'Pandas'],
    detail: 'Feature engineering extracts meaningful patterns from raw clinical data. Interaction terms capture non-linear relationships between contraction patterns and signal entropy.',
  },
  {
    id: 3, icon: Layers, label: 'StandardScaler', color: '#38bdf8',
    desc: 'Features normalized using StandardScaler (µ=0, s=1) to ensure equal contribution regardless of unit scale.',
    tech: ['Scikit-learn', 'StandardScaler', 'Pickle'],
    detail: 'The fitted scaler is persisted and reloaded at inference time, ensuring training and serving distributions are identical — preventing data leakage and scale bias.',
  },
  {
    id: 4, icon: Cpu, label: 'XGBoost Model', color: '#60a5fa',
    desc: 'Gradient-boosted ensemble model with 94.7% accuracy trained on 12,847 clinical records.',
    tech: ['XGBoost', 'Gradient Boosting', 'Ensemble Learning'],
    detail: 'XGBoost outperformed Random Forest (92.3%), SVM (89.4%), and Logistic Regression (87.1%) across accuracy, recall, and F1 score on held-out test data.',
  },
  {
    id: 5, icon: BarChart2, label: 'Explainability', color: '#a78bfa',
    desc: 'Feature importance scores and contribution charts generated for every prediction for clinical transparency.',
    tech: ['SHAP Values', 'Feature Importance', 'Recharts'],
    detail: 'Each prediction is accompanied by feature contribution percentages, enabling clinicians to understand which indicators are driving the risk assessment.',
  },
  {
    id: 6, icon: Brain, label: 'AI Summary', color: '#f472b6',
    desc: 'Natural language clinical summary generated from prediction context for patient-friendly communication.',
    tech: ['Template Engine', 'Risk Contextualization'],
    detail: 'Dynamic NLP-style summaries translate raw model outputs into actionable clinical narratives, tailored to LOW, MODERATE, or HIGH risk profiles.',
  },
  {
    id: 7, icon: FileText, label: 'Risk Report', color: '#fb923c',
    desc: 'Comprehensive JSON + PDF risk report with recommendations, timeline, and patient record data.',
    tech: ['ReportLab', 'PDF Generation', 'JSON API'],
    detail: 'Structured output covers prediction label, probability, feature contributions, gestational week timeline, clinical recommendations, and patient report summary.',
  },
]

const TECH_STACK = [
  { layer: 'Frontend', items: ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Recharts', 'Three.js'] },
  { layer: 'Backend', items: ['Flask', 'Python 3.10', 'Flask-CORS', 'ReportLab'] },
  { layer: 'ML Pipeline', items: ['XGBoost', 'Scikit-learn', 'NumPy', 'Pandas', 'StandardScaler'] },
  { layer: 'API Contract', items: ['REST/JSON', '/api/predict-json', '/api/metadata', '/api/health', '/report/pdf'] },
]

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const runAnimation = () => {
    setAnimating(true)
    let i = 0
    const next = () => {
      setActiveStep(i)
      i++
      if (i < PIPELINE.length) setTimeout(next, 500)
      else setTimeout(() => { setAnimating(false); setActiveStep(null) }, 800)
    }
    next()
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-300 font-medium mb-4">
            <Code2 size={12} />
            System Architecture
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">ML Pipeline Architecture</h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mb-6">
            End-to-end pipeline from clinical input to explainable AI risk report.
            Built for transparency, reliability, and clinical integration.
          </p>
          <button
            onClick={runAnimation}
            disabled={animating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50"
          >
            <Zap size={14} />
            {animating ? 'Running Pipeline...' : 'Animate Pipeline'}
          </button>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="relative mb-16">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" style={{ zIndex: 0 }} />

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
            {PIPELINE.map((step, i) => {
              const Icon = step.icon
              const isActive = activeStep === i
              const isPast = activeStep !== null && i < activeStep

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className="cursor-pointer"
                >
                  <motion.div
                    animate={isActive ? { scale: 1.05 } : isPast ? { opacity: 0.7 } : { scale: 1 }}
                    className={`glass-card rounded-2xl p-4 text-center border transition-all
                      ${isActive ? 'border-opacity-60 shadow-lg' : 'border-transparent hover:border-slate-700'}`}
                    style={isActive ? { borderColor: step.color, boxShadow: `0 0 20px ${step.color}25` } : {}}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all"
                      style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                    >
                      <Icon size={18} style={{ color: step.color }} />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mb-1">step {String(step.id).padStart(2, '0')}</div>
                    <div className="text-xs font-semibold text-slate-800">{step.label}</div>
                  </motion.div>

                  {/* Connector arrow — not on last */}
                  {i < PIPELINE.length - 1 && (
                    <div className="hidden lg:flex justify-center mt-2">
                      <ChevronRight size={14} className="text-slate-500" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {activeStep !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div
                  className="glass-card rounded-2xl p-6 border"
                  style={{ borderColor: `${PIPELINE[activeStep].color}30` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${PIPELINE[activeStep].color}15` }}
                    >
                      {(() => { const Icon = PIPELINE[activeStep].icon; return <Icon size={22} style={{ color: PIPELINE[activeStep].color }} /> })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">{PIPELINE[activeStep].label}</h3>
                      <p className="text-sm text-slate-600 mb-3">{PIPELINE[activeStep].detail}</p>
                      <div className="flex flex-wrap gap-2">
                        {PIPELINE[activeStep].tech.map((t) => (
                          <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono border border-slate-200">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* API Contract */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-cyan-700" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-600">JSON API Endpoints</h3>
            </div>
            {[
              { method: 'GET', path: '/api/health', color: '#10b981', desc: 'Health check + model status' },
              { method: 'GET', path: '/api/metadata', color: '#22d3ee', desc: 'Model metadata & artifacts' },
              { method: 'POST', path: '/api/predict-json', color: '#2dd4bf', desc: 'Main prediction endpoint' },
              { method: 'POST', path: '/api/report-json', color: '#60a5fa', desc: 'JSON report payload' },
              { method: 'POST', path: '/report/pdf', color: '#a78bfa', desc: 'PDF download' },
            ].map(({ method, path, color, desc }) => (
              <div key={path} className="flex items-center gap-3 py-2.5 border-b border-slate-200">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ color, background: `${color}15` }}>{method}</span>
                <span className="text-xs font-mono text-slate-700">{path}</span>
                <span className="text-xs text-slate-500 ml-auto">{desc}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database size={14} className="text-cyan-400" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-600">CORS & Auth Config</h3>
            </div>
            <pre className="text-xs font-mono text-slate-700 leading-relaxed bg-slate-100 rounded-xl p-4 overflow-x-auto">
{`# Flask CORS
CORS(app, origins=[
  "http://localhost:3000",
  "http://127.0.0.1:3000"
])

# Frontend .env.local
NEXT_PUBLIC_USE_REAL_API=false
NEXT_PUBLIC_API_BASE=http://127.0.0.1:5000

# Toggle mock ? real
NEXT_PUBLIC_USE_REAL_API=true`}
            </pre>
          </motion.div>
        </div>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers size={14} className="text-cyan-700" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-600">Full Technology Stack</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TECH_STACK.map(({ layer, items }) => (
              <div key={layer}>
                <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-2">{layer}</div>
                <ul className="space-y-1">
                  {items.map(item => (
                    <li key={item} className="text-xs text-slate-700 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

