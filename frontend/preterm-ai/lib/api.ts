// lib/api.ts
import type { PredictionInput, PredictionResponse, ApiResponse } from '@/types/api'

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000'

function generateMockResult(input: PredictionInput): PredictionResponse {
  const score = Math.round(
    input.count_contraction * 0.4 +
    input.entropy * 8 +
    input.contraction_times * 0.6 +
    input.risk_factor * 3 +
    input.minor_health * 2 +
    input.lifestyle_factor * 2
  )
  const clamped = Math.min(100, Math.max(0, score))
  const prob = Math.round(clamped * 0.9 + Math.random() * 5)
  const riskLevel = prob > 65 ? 'HIGH' : prob > 35 ? 'MODERATE' : 'LOW'
  const predLabel = prob > 50 ? 1 : 0

  return {
    ok: true,
    result: {
      prediction_label: predLabel as 0 | 1,
      prediction_text: predLabel === 1 ? 'High Risk of Preterm Birth' : 'Low Risk of Preterm Birth',
      probability_pct: prob,
      risk_level: riskLevel,
      risk_color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MODERATE' ? '#f59e0b' : '#10b981',
      score: clamped,
      confidence: clamped > 70 ? 'High' : clamped > 40 ? 'Moderate' : 'Low',
      confidence_pct: Math.round(70 + Math.random() * 25),
      top_factors: [
        `Contraction Count: ${input.count_contraction} (elevated)`,
        `Signal Entropy: ${input.entropy.toFixed(2)} bits`,
        `Clinical Risk Score: ${input.risk_factor}/10`,
        `Lifestyle Factor: ${input.lifestyle_factor}/10`,
      ],
      ai_summary:
        riskLevel === 'HIGH'
          ? `Based on the provided maternal health indicators, the AI model identifies a HIGH risk profile for preterm birth. Elevated uterine contraction frequency (${input.count_contraction}/hr) combined with high entropy values (${input.entropy.toFixed(2)}) suggest significant cervical stress. Immediate clinical review is recommended.`
          : riskLevel === 'MODERATE'
            ? `The patient presents with MODERATE risk indicators. Contraction patterns (${input.count_contraction}/hr) are within borderline ranges. The clinical risk score of ${input.risk_factor}/10 warrants monitoring. Enhanced prenatal surveillance is advised over the coming weeks.`
            : `Current indicators reflect LOW risk for preterm birth. Contraction frequency (${input.count_contraction}/hr) and entropy values (${input.entropy.toFixed(2)}) are within normal parameters. Standard prenatal care is appropriate with routine follow-up.`,
      recommendations: [
        riskLevel === 'HIGH' ? 'Immediate hospital admission for monitoring' : 'Continue standard prenatal visits',
        'Hydration: maintain 2-3L fluid intake daily',
        riskLevel !== 'LOW' ? 'Consider tocolytic therapy consultation' : 'Moderate physical activity as tolerated',
        'Cervical length ultrasound assessment',
        'Corticosteroid therapy evaluation if <34 weeks',
        'Reduce lifestyle stressors and optimize sleep',
      ],
      patient_report: [
        `Assessment Date: ${new Date().toLocaleDateString()}`,
        `Risk Classification: ${riskLevel}`,
        `Composite Risk Score: ${clamped}/100`,
        `Preterm Probability: ${prob}%`,
        `Primary Risk Driver: ${input.count_contraction > 20 ? 'Uterine Activity' : 'Clinical History'}`,
        'Model Confidence: High',
      ],
      contribution_chart: [
        { feature: 'Contractions', pct: Math.round(input.count_contraction * 0.45) },
        { feature: 'Entropy', pct: Math.round(input.entropy * 12) },
        { feature: 'Duration', pct: Math.round(input.contraction_times * 0.8) },
        { feature: 'Risk Factor', pct: Math.round(input.risk_factor * 4) },
        { feature: 'Minor Health', pct: Math.round(input.minor_health * 3) },
        { feature: 'Lifestyle', pct: Math.round(input.lifestyle_factor * 3) },
      ],
      timeline: [
        { week: '24', risk: Math.max(5, prob - 20 + Math.round(Math.random() * 10)) },
        { week: '28', risk: Math.max(5, prob - 10 + Math.round(Math.random() * 8)) },
        { week: '32', risk: prob },
        { week: '36', risk: Math.max(5, prob - 15 + Math.round(Math.random() * 12)) },
      ],
      interaction_value: parseFloat((input.count_contraction * input.entropy).toFixed(2)),
    },
    metadata: {
      model_type: 'Gradient Boosting Classifier (XGBoost)',
      training_samples: 12847,
      features: 6,
      dataset_size: '14,200 records',
      accuracy: '94.7%',
      precision: '93.2%',
      recall: '95.1%',
      f1_score: '94.1%',
      test_split: '20%',
      training_date: '2024-11-15',
      model_comparison: [
        { name: 'XGBoost', accuracy: 94.7 },
        { name: 'Random Forest', accuracy: 92.3 },
        { name: 'Logistic Regression', accuracy: 87.1 },
        { name: 'SVM', accuracy: 89.4 },
      ],
    },
    artifacts: {
      model_artifact_path: 'models/preterm_xgb_v2.pkl',
      scaler_artifact_path: 'models/standard_scaler_v2.pkl',
    },
  }
}

async function fetchRealPrediction(input: PredictionInput): Promise<ApiResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      error_type: 'internal_error',
      message:
        (data && typeof data.message === 'string' && data.message) ||
        `Backend error (${res.status})`,
      errors: Array.isArray(data?.errors) ? data.errors : undefined,
    }
  }
  return data as ApiResponse
}

export async function predict(input: PredictionInput): Promise<ApiResponse> {
  if (USE_REAL_API) {
    return fetchRealPrediction(input)
  }
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 800))
  return generateMockResult(input)
}

export async function downloadPDFReport(input: PredictionInput): Promise<Blob> {
  if (USE_REAL_API) {
    const res = await fetch('/api/report-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return res.blob()
  }
  const content = `PreTermAI Risk Assessment Report\n\nGenerated: ${new Date().toISOString()}\nPatient Risk Profile: Mock Report\n\nThis is a mock PDF placeholder. Connect backend for real reports.`
  return new Blob([content], { type: 'application/pdf' })
}

export const SAMPLE_CASES: Array<{ label: string; description: string; input: PredictionInput }> = [
  {
    label: 'High Risk Case',
    description: 'Elevated contractions, high entropy',
    input: { count_contraction: 45, entropy: 3.8, contraction_times: 32, risk_factor: 8, minor_health: 7, lifestyle_factor: 6 },
  },
  {
    label: 'Moderate Risk Case',
    description: 'Borderline indicators',
    input: { count_contraction: 22, entropy: 2.1, contraction_times: 18, risk_factor: 5, minor_health: 4, lifestyle_factor: 5 },
  },
  {
    label: 'Low Risk Case',
    description: 'Normal healthy indicators',
    input: { count_contraction: 5, entropy: 0.8, contraction_times: 6, risk_factor: 1, minor_health: 1, lifestyle_factor: 2 },
  },
]
