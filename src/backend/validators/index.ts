import type { Workout } from '@/types'

export function validateWorkout(data: Partial<Workout>): string | null {
  if (!data.name || typeof data.name !== 'string') return 'Name is required'
  if (!data.type || !['strength', 'cardio', 'flexibility', 'mixed'].includes(data.type)) {
    return 'Valid type is required (strength, cardio, flexibility, mixed)'
  }
  if (!data.duration || typeof data.duration !== 'number' || data.duration <= 0) {
    return 'Duration must be a positive number'
  }
  if (!data.date) return 'Date is required'
  return null
}

export function validateNutrition(data: any): string | null {
  if (!data.date) return 'Date is required'
  if (!data.meals || !Array.isArray(data.meals)) return 'Meals must be an array'
  for (const meal of data.meals) {
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.mealType)) {
      return 'Invalid meal type'
    }
    if (!meal.foods || !Array.isArray(meal.foods)) return 'Foods must be an array'
  }
  return null
}

export function validateProgress(data: any): string | null {
  if (!data.date) return 'Date is required'
  if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight <= 0)) {
    return 'Weight must be a positive number'
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
