'use client'
// components/simulation/ResultsDashboard.tsx
import { motion } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, XCircle, Sparkles,
  Activity, BarChart2, Clock, Zap, Info
} from 'lucide-react'
import { RiskGauge } from '@/components/ui/RiskGauge'
import { ConfidenceMeter, InsightCard, RiskBadge, MetadataPanel } from '@/components/ui/Cards'
import { FeatureChart } from '@/components/charts/FeatureChart'
import { TimelineChart } from '@/components/charts/TimelineChart'
import { ModelComparisonChart } from '@/components/charts/ModelComparisonChart'
import type { PredictionResponse } from '@/types/api'
import { RISK_CONFIG } from '@/types/api'

interface Props { result: PredictionResponse }

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } }
}

export function ResultsDashboard({ result }: Props) {
  const { result: r, metadata } = result
  const config = RISK_CONFIG[r.risk_level]
  const RiskIcon = r.risk_level === 'LOW' ? CheckCircle2 : r.risk_level === 'MODERATE' ? AlertTriangle : XCircle

  return (
    <div className="space-y-4">
      {/* Top banner */}
      <motion.div {...fadeUp(0)} className={`glass-card rounded-2xl p-5 border ${config.border} ${config.bg}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
              <RiskIcon size={22} className={config.text} />
            </div>
            <div>
              <RiskBadge level={r.risk_level} />
              <p className="text-sm text-slate-700 mt-1">{r.prediction_text}</p>
              {r.inference_mode && (
                <p className="text-xs text-slate-600 mt-1">
                  Inference Mode: <span className="font-mono text-slate-800">{r.inference_mode}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className={`text-2xl font-bold ${config.text}`}>{r.probability_pct}%</div>
              <div className="text-xs text-slate-600">Probability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{r.score}</div>
              <div className="text-xs text-slate-600">Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-300">{r.confidence_pct}%</div>
              <div className="text-xs text-slate-600">Confidence</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gauge + Confidence */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-5 flex items-center justify-center">
          <RiskGauge score={r.score} riskLevel={r.risk_level} />
        </motion.div>
        <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-center">
          <ConfidenceMeter value={r.confidence_pct} label="Model Confidence" />
          <ConfidenceMeter value={r.probability_pct} label="Preterm Probability" />
          <div className="pt-2">
            <div className="text-xs text-slate-600 mb-1">Confidence Level</div>
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
              r.confidence === 'High' ? 'bg-emerald-500/15 text-emerald-400' :
              r.confidence === 'Moderate' ? 'bg-amber-500/15 text-amber-400' :
              'bg-red-500/15 text-red-400'
            }`}>{r.confidence}</div>
          </div>
        </motion.div>
      </div>

      {/* AI Summary */}
      <InsightCard title="AI Clinical Summary" icon={<Sparkles size={14} />} delay={0.2}>
        <p className="text-sm text-slate-700 leading-relaxed">{r.ai_summary}</p>
      </InsightCard>

      {/* Top factors + Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        <InsightCard title="Top Risk Factors" icon={<Activity size={14} />} delay={0.25}>
          <ul className="space-y-2">
            {r.top_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${config.bg} ${config.text}`}>
                  {i + 1}
                </span>
                {f}
              </li>
            ))}
          </ul>
        </InsightCard>

        <InsightCard title="Clinical Recommendations" icon={<CheckCircle2 size={14} />} delay={0.3}>
          <ul className="space-y-2">
            {r.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 size={12} className="text-cyan-700 flex-shrink-0 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </InsightCard>
      </div>

      {/* Feature Contribution Chart */}
      <InsightCard title="Feature Contribution Analysis" icon={<BarChart2 size={14} />} delay={0.35}>
        <FeatureChart data={r.contribution_chart} />
      </InsightCard>

      {/* Timeline */}
      <InsightCard title="Risk Timeline by Gestational Week" icon={<Clock size={14} />} delay={0.4}>
        <TimelineChart data={r.timeline} />
      </InsightCard>

      {/* Feature Interaction */}
      <motion.div {...fadeUp(0.45)} className="glass-card rounded-2xl p-5 border border-cyan-200">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-cyan-700" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Feature Interaction</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center glass-card rounded-xl p-3">
            <div className="text-xs text-slate-600 mb-1">Contractions × Entropy</div>
            <div className="text-2xl font-bold font-mono text-cyan-300">{r.interaction_value}</div>
          </div>
          <div className="text-slate-500 text-sm">=</div>
          <div className="flex-1 text-center glass-card rounded-xl p-3">
            <div className="text-xs text-slate-600 mb-1">Interaction Score</div>
            <div className={`text-lg font-bold ${r.interaction_value > 50 ? 'text-red-400' : r.interaction_value > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {r.interaction_value > 50 ? 'Critical' : r.interaction_value > 20 ? 'Elevated' : 'Normal'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Patient Report */}
      <InsightCard title="Patient Report Summary" icon={<Info size={14} />} delay={0.5}>
        <div className="grid grid-cols-2 gap-2">
          {r.patient_report.map((line, i) => {
            const [k, v] = line.split(': ')
            return (
              <div key={i} className="bg-slate-100 rounded-lg px-3 py-2">
                <div className="text-[10px] text-slate-500">{k}</div>
                <div className="text-xs font-medium text-slate-800 mt-0.5">{v}</div>
              </div>
            )
          })}
        </div>
      </InsightCard>

      {/* Model Metadata */}
      <InsightCard title="Model Metadata" icon={<Activity size={14} />} delay={0.55}>
        <div className="grid md:grid-cols-2 gap-6">
          <MetadataPanel metadata={metadata} />
          {metadata.model_comparison && (
            <div>
              <div className="text-xs text-slate-600 mb-2">Model Comparison</div>
              <ModelComparisonChart data={metadata.model_comparison} />
            </div>
          )}
        </div>
      </InsightCard>
    </div>
  )
}

