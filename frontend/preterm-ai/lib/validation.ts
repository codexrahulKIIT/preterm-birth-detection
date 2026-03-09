// lib/validation.ts
import type { PredictionInput, ValidationError } from '@/types/api'
import { FIELD_RANGES } from '@/types/api'

export function validateInput(input: Partial<PredictionInput>): ValidationError[] {
  const errors: ValidationError[] = []
  const fields = Object.keys(FIELD_RANGES) as Array<keyof PredictionInput>

  for (const field of fields) {
    const value = input[field]
    const range = FIELD_RANGES[field]

    if (value === undefined || value === null || (typeof value === 'string' && value === '')) {
      errors.push({ field, message: `${range.label} is required` })
      continue
    }

    const num = Number(value)
    if (isNaN(num)) {
      errors.push({ field, message: `${range.label} must be a number` })
      continue
    }

    if (num < range.min || num > range.max) {
      errors.push({ field, message: `${range.label} must be between ${range.min} and ${range.max}` })
    }
  }

  return errors
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

