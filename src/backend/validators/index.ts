import type { Nutrition, Progress, Workout } from '@/types'

export function validateWorkout(data: Partial<Workout>): string | null {
  if (!data.name || typeof data.name !== 'string') return 'Name is required'
  if (!data.type || !['strength', 'cardio', 'flexibility', 'mixed'].includes(data.type)) {
    return 'Valid type is required (strength, cardio, flexibility, mixed)'
  }
  if (data.type === 'strength') {
    if (!data.exercises || data.exercises.length === 0) {
      return 'At least one exercise is required for strength workouts'
    }

    const invalidExercise = data.exercises.some(
      (exercise) =>
        !exercise.exerciseName ||
        typeof exercise.sets !== 'number' ||
        exercise.sets <= 0 ||
        typeof exercise.reps !== 'number' ||
        exercise.reps <= 0
    )

    if (invalidExercise) {
      return 'Each strength exercise must have name, sets and reps'
    }
  } else if (typeof data.duration !== 'number' || data.duration <= 0) {
    return 'Duration must be a positive number for non-strength workouts'
  }
  if (!data.date) return 'Date is required'
  return null
}

export function validateNutrition(data: Partial<Nutrition>): string | null {
  if (!data.date) return 'Date is required'
  if (!data.meals || !Array.isArray(data.meals)) return 'Meals must be an array'
  if (data.meals.length === 0) return 'At least one meal is required'

  for (const meal of data.meals) {
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.mealType)) {
      return 'Invalid meal type'
    }
    if (!meal.foods || !Array.isArray(meal.foods)) return 'Foods must be an array'
    if (meal.foods.length === 0) return 'Each meal must contain at least one food'

    for (const food of meal.foods) {
      if (!food.name || typeof food.name !== 'string') {
        return 'Each food must have a valid name'
      }

      if (
        typeof food.calories !== 'number' ||
        typeof food.protein !== 'number' ||
        typeof food.carbs !== 'number' ||
        typeof food.fat !== 'number'
      ) {
        return 'Food nutrition values must be numbers'
      }

      if (typeof food.servings !== 'number' || food.servings <= 0) {
        return 'Food servings must be a positive number'
      }
    }
  }

  return null
}

export function validateProgress(data: Partial<Progress>): string | null {
  if (!data.date) return 'Date is required'

  if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight <= 0)) {
    return 'Weight must be a positive number'
  }

  if (data.measurements !== undefined) {
    const measurementValues = Object.values(data.measurements).filter(
      (value): value is number => value !== undefined
    )

    const hasInvalidMeasurement = measurementValues.some(
      (value) => typeof value !== 'number' || Number.isNaN(value) || value <= 0
    )

    if (hasInvalidMeasurement) {
      return 'Measurements must be positive numbers'
    }
  }

  return null
}

export function validateRegistration(data: any): string | null {
  if (!data.name || typeof data.name !== 'string') return 'Name is required'
  if (!data.email || typeof data.email !== 'string') return 'Email is required'
  if (!data.password || typeof data.password !== 'string') return 'Password is required'
  if (data.password.length < 8) return 'Password must be at least 8 characters'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) return 'Invalid email format'
  return null
}
