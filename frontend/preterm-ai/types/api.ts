// types/api.ts

export interface PredictionInput {
  count_contraction: number
  entropy: number
  contraction_times: number
  risk_factor: number
  minor_health: number
  lifestyle_factor: number
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH'
export type Confidence = 'High' | 'Moderate' | 'Low'

export interface ContributionPoint {
  feature: string
  pct: number
}

export interface TimelinePoint {
  week: string
  risk: number
}

export interface ModelComparison {
  name: string
  accuracy: number
}

export interface PredictionResult {
  prediction_label: 0 | 1
  prediction_text: string
  probability_pct: number
  inference_mode?: string
  risk_level: RiskLevel
  risk_color: string
  score: number
  confidence: Confidence
  confidence_pct: number
  top_factors: string[]
  ai_summary: string
  recommendations: string[]
  patient_report: string[]
  contribution_chart: ContributionPoint[]
  timeline: TimelinePoint[]
  interaction_value: number
}

export interface ModelMetadata {
  model_type: string
  training_samples: string | number
  features: string | number
  dataset_size: string | number
  accuracy: string
  precision: string
  recall: string
  f1_score: string
  test_split: string | number
  training_date: string
  model_comparison?: ModelComparison[]
}

export interface Artifacts {
  model_artifact_path: string
  scaler_artifact_path: string
  inference_mode?: string
}

export interface PredictionResponse {
  ok: true
  result: PredictionResult
  metadata: ModelMetadata
  artifacts: Artifacts
}

export interface ErrorResponse {
  ok: false
  error_type: 'validation_error' | 'internal_error'
  errors?: string[]
  message?: string
}

export type ApiResponse = PredictionResponse | ErrorResponse

export interface ValidationError {
  field: string
  message: string
}

export const FIELD_RANGES: Record<keyof PredictionInput, { min: number; max: number; label: string; unit?: string }> = {
  count_contraction: { min: 0, max: 100, label: 'Contraction Count', unit: 'per hour' },
  entropy: { min: 0, max: 5, label: 'Signal Entropy', unit: 'bits' },
  contraction_times: { min: 0, max: 50, label: 'Contraction Duration', unit: 'seconds' },
  risk_factor: { min: 0, max: 10, label: 'Clinical Risk Factor', unit: 'score' },
  minor_health: { min: 0, max: 10, label: 'Minor Health Indicators', unit: 'score' },
  lifestyle_factor: { min: 0, max: 10, label: 'Lifestyle Factor', unit: 'score' },
}

export const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; text: string; glow: string }> = {
  LOW: {
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  MODERATE: {
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  HIGH: {
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
}

