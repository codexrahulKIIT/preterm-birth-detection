'use client'
// app/page.tsx
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Brain, BarChart3 } from 'lucide-react'
import { NeuralBackground } from '@/components/three/NeuralBackground'

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-24 overflow-hidden">
      <NeuralBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 text-xs text-cyan-700 font-semibold mb-5">
            <Brain size={12} />
            AI Powered Maternal Risk Screening
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            PreTermAI
          </h1>
          <p className="text-slate-700 mt-3 text-lg">
            Early preterm birth risk detection with explainable machine learning.
          </p>
          <p className="text-slate-600 text-sm mt-4">
            This system is an AI-based screening tool and does not replace clinical diagnosis.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Link
              href="/simulation"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-cyan-600/20"
            >
              Launch AI Simulation <ArrowRight size={14} />
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 glass-card text-slate-700 px-5 py-3 rounded-xl font-semibold"
            >
              View Architecture
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="glass-card rounded-2xl p-5">
            <ShieldCheck size={18} className="text-emerald-400 mb-2" />
            <h3 className="text-slate-900 font-semibold">Clinical Validation</h3>
            <p className="text-slate-600 text-sm mt-1">Input ranges are validated before inference.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <Brain size={18} className="text-cyan-400 mb-2" />
            <h3 className="text-slate-900 font-semibold">Risk Intelligence</h3>
            <p className="text-slate-600 text-sm mt-1">Probability, risk level, confidence, and AI summary.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <BarChart3 size={18} className="text-violet-400 mb-2" />
            <h3 className="text-slate-900 font-semibold">Explainability</h3>
            <p className="text-slate-600 text-sm mt-1">Feature contribution, timeline, and metadata transparency.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

