import { describe, it, expect } from 'vitest'
import {
  validateWorkout,
  validateWorkoutTemplate,
  validateNutrition,
  validateProgress,
  validateRegistration,
} from '@/backend/validators'

// ─── validateWorkout ─────────────────────────────────────────────────────────

describe('validateWorkout', () => {
  const baseStrength = {
    name: 'Bench day',
    type: 'strength' as const,
    date: '2026-03-29',
    exercises: [{ exerciseName: 'Bench press', sets: 3, reps: 10, weight: 80 }],
  }

  const baseCardio = {
    name: 'Morning run',
    type: 'cardio' as const,
    date: '2026-03-29',
    duration: 30,
    exercises: [],
  }

  it('returns null for a valid strength workout', () => {
    expect(validateWorkout(baseStrength)).toBeNull()
  })

  it('returns null for a valid cardio workout', () => {
    expect(validateWorkout(baseCardio)).toBeNull()
  })

  it('requires name', () => {
    expect(validateWorkout({ ...baseStrength, name: '' })).toBe('Name is required')
  })

  it('requires valid type', () => {
    // @ts-expect-error intentional bad type
    expect(validateWorkout({ ...baseStrength, type: 'yoga' })).toMatch(/valid type/i)
  })

  it('requires exercises for strength', () => {
    expect(validateWorkout({ ...baseStrength, exercises: [] })).toMatch(/exercise/i)
  })

  it('requires positive sets and reps for strength exercise', () => {
    const badExercise = { exerciseName: 'Squat', sets: 0, reps: 10, weight: 0 }
    expect(validateWorkout({ ...baseStrength, exercises: [badExercise] })).toMatch(/sets and reps/i)
  })

  it('requires positive duration for cardio', () => {
    expect(validateWorkout({ ...baseCardio, duration: 0 })).toMatch(/duration/i)
  })

  it('requires date', () => {
    expect(validateWorkout({ ...baseStrength, date: undefined })).toBe('Date is required')
  })
})

// ─── validateWorkoutTemplate ─────────────────────────────────────────────────

describe('validateWorkoutTemplate', () => {
  const baseTemplate = {
    name: 'Push day',
    type: 'strength' as const,
    scheduleDays: ['monday', 'thursday'] as any,
    exercises: [{ exerciseName: 'Overhead press', sets: 4, reps: 8, weight: 50 }],
  }

  it('returns null for a valid strength template', () => {
    expect(validateWorkoutTemplate(baseTemplate)).toBeNull()
  })

  it('returns null for a valid cardio template', () => {
    expect(
      validateWorkoutTemplate({
        name: 'Cardio plan',
        type: 'cardio',
        scheduleDays: ['tuesday'] as any,
        duration: 45,
        exercises: [],
      })
    ).toBeNull()
  })

  it('requires name', () => {
    expect(validateWorkoutTemplate({ ...baseTemplate, name: '' })).toBe('Name is required')
  })

  it('requires at least one schedule day', () => {
    expect(validateWorkoutTemplate({ ...baseTemplate, scheduleDays: [] })).toMatch(/schedule day/i)
  })

  it('rejects invalid weekday strings', () => {
    expect(
      validateWorkoutTemplate({ ...baseTemplate, scheduleDays: ['funday'] as any })
    ).toMatch(/valid weekday/i)
  })

  it('requires exercises for strength templates', () => {
    expect(validateWorkoutTemplate({ ...baseTemplate, exercises: [] })).toMatch(/exercise/i)
  })

  it('requires positive duration for cardio templates', () => {
    expect(
      validateWorkoutTemplate({
        name: 'Run',
        type: 'cardio',
        scheduleDays: ['friday'] as any,
        duration: -5,
        exercises: [],
      })
    ).toMatch(/duration/i)
  })
})

// ─── validateNutrition ───────────────────────────────────────────────────────

describe('validateNutrition', () => {
  const validFood = {
    name: 'Oatmeal',
    calories: 300,
    protein: 10,
    carbs: 50,
    fat: 5,
    servings: 1,
    servingSize: '100g',
  }

  const validMeal = { mealType: 'breakfast' as const, foods: [validFood] }

  it('returns null for valid nutrition data', () => {
    expect(validateNutrition({ date: '2026-03-29', meals: [validMeal] })).toBeNull()
  })

  it('requires date', () => {
    expect(validateNutrition({ meals: [validMeal] })).toBe('Date is required')
  })

  it('requires at least one meal', () => {
    expect(validateNutrition({ date: '2026-03-29', meals: [] })).toMatch(/meal/i)
  })

  it('rejects invalid meal type', () => {
    const badMeal = { ...validMeal, mealType: 'supper' as any }
    expect(validateNutrition({ date: '2026-03-29', meals: [badMeal] })).toMatch(/meal type/i)
  })

  it('requires at least one food per meal', () => {
    expect(
      validateNutrition({ date: '2026-03-29', meals: [{ ...validMeal, foods: [] }] })
    ).toMatch(/food/i)
  })

  it('requires numeric nutrition values', () => {
    const badFood = { ...validFood, calories: 'lots' as any }
    expect(
      validateNutrition({ date: '2026-03-29', meals: [{ ...validMeal, foods: [badFood] }] })
    ).toMatch(/number/i)
  })

  it('requires positive servings', () => {
    const badFood = { ...validFood, servings: 0 }
    expect(
      validateNutrition({ date: '2026-03-29', meals: [{ ...validMeal, foods: [badFood] }] })
    ).toMatch(/servings/i)
  })
})

// ─── validateProgress ────────────────────────────────────────────────────────

describe('validateProgress', () => {
  it('returns null for valid progress data', () => {
    expect(validateProgress({ date: '2026-03-29', weight: 75 })).toBeNull()
  })

  it('returns null when optional fields are absent', () => {
    expect(validateProgress({ date: '2026-03-29' })).toBeNull()
  })

  it('requires date', () => {
    expect(validateProgress({ weight: 75 })).toBe('Date is required')
  })

  it('rejects non-positive weight', () => {
    expect(validateProgress({ date: '2026-03-29', weight: 0 })).toMatch(/weight/i)
  })

  it('rejects non-positive measurements', () => {
    expect(
      validateProgress({ date: '2026-03-29', measurements: { waist: -5 } })
    ).toMatch(/measurement/i)
  })
})

// ─── validateRegistration ────────────────────────────────────────────────────

describe('validateRegistration', () => {
  const valid = { name: 'Alice', email: 'alice@example.com', password: 'securepass' }

  it('returns null for valid registration data', () => {
    expect(validateRegistration(valid)).toBeNull()
  })

  it('requires name', () => {
    expect(validateRegistration({ ...valid, name: '' })).toBe('Name is required')
  })

  it('requires email', () => {
    expect(validateRegistration({ ...valid, email: '' })).toBe('Email is required')
  })

  it('requires valid email format', () => {
    expect(validateRegistration({ ...valid, email: 'not-an-email' })).toMatch(/email format/i)
  })

  it('requires password', () => {
    expect(validateRegistration({ ...valid, password: '' })).toBe('Password is required')
  })

  it('requires password of at least 8 characters', () => {
    expect(validateRegistration({ ...valid, password: 'short' })).toMatch(/8 characters/i)
  })
})
