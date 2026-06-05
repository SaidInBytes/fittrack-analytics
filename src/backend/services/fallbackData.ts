import type { Nutrition, Progress, User, Workout } from '@/types'

const demoUserId = '000000000000000000000001'
const now = new Date()
const oneDay = 24 * 60 * 60 * 1000

export const fallbackUser: Omit<User, 'password'> = {
  _id: demoUserId,
  name: 'Shared Access',
  email: 'shared-access@fittrack.app',
  createdAt: now,
  profile: {
    age: 29,
    height: 178,
    currentWeight: 82,
    goalWeight: 78,
    activityLevel: 'moderate',
    goals: ['Lose fat', 'Build strength', 'Stay consistent'],
  },
  preferences: {
    unit: 'metric',
    darkMode: false,
  },
}

export const fallbackWorkouts: Workout[] = [
  {
    _id: 'demo-workout-1',
    userId: demoUserId,
    name: 'Upper Body Strength',
    type: 'strength',
    duration: 50,
    exercises: [
      { exerciseName: 'Bench Press', sets: 4, reps: 8, weight: 60 },
      { exerciseName: 'Bent-Over Row', sets: 4, reps: 10, weight: 45 },
    ],
    date: new Date(now.getTime() - oneDay),
    isTemplate: false,
    createdAt: now,
  },
  {
    _id: 'demo-workout-2',
    userId: demoUserId,
    name: 'Tempo Run',
    type: 'cardio',
    duration: 35,
    exercises: [],
    date: new Date(now.getTime() - 3 * oneDay),
    isTemplate: false,
    createdAt: now,
  },
  {
    _id: 'demo-workout-3',
    userId: demoUserId,
    name: 'Mobility Flow',
    type: 'flexibility',
    duration: 20,
    exercises: [],
    date: new Date(now.getTime() - 5 * oneDay),
    isTemplate: false,
    createdAt: now,
  },
]

export const fallbackWorkoutTemplates: Workout[] = [
  {
    _id: 'demo-template-1',
    userId: demoUserId,
    name: 'Push Day Template',
    type: 'strength',
    duration: 45,
    exercises: [
      { exerciseName: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 22 },
      { exerciseName: 'Shoulder Press', sets: 3, reps: 10, weight: 18 },
    ],
    date: now,
    isTemplate: true,
    scheduleDays: ['monday', 'thursday'],
    createdAt: now,
  },
  {
    _id: 'demo-template-2',
    userId: demoUserId,
    name: 'Recovery Cardio Template',
    type: 'cardio',
    duration: 30,
    exercises: [],
    date: now,
    isTemplate: true,
    scheduleDays: ['wednesday', 'saturday'],
    createdAt: now,
  },
]

export const fallbackNutrition: Nutrition[] = [
  {
    _id: 'demo-nutrition-1',
    userId: demoUserId,
    date: new Date(now.getTime() - oneDay),
    meals: [
      {
        mealType: 'breakfast',
        foods: [
          { name: 'Greek Yogurt Bowl', calories: 220, protein: 20, carbs: 18, fat: 6, servings: 1 },
          { name: 'Blueberries', calories: 57, protein: 1, carbs: 14, fat: 0, servings: 1 },
        ],
      },
      {
        mealType: 'dinner',
        foods: [
          { name: 'Salmon Fillet', calories: 280, protein: 34, carbs: 0, fat: 16, servings: 1 },
          { name: 'Rice', calories: 205, protein: 4, carbs: 45, fat: 0, servings: 1 },
        ],
      },
    ],
    totals: { calories: 762, protein: 59, carbs: 77, fat: 22 },
    goals: { calories: 2200, protein: 170, carbs: 240, fat: 70 },
  },
  {
    _id: 'demo-nutrition-2',
    userId: demoUserId,
    date: new Date(now.getTime() - 2 * oneDay),
    meals: [
      {
        mealType: 'lunch',
        foods: [{ name: 'Chicken Wrap', calories: 430, protein: 35, carbs: 38, fat: 14, servings: 1 }],
      },
      {
        mealType: 'snack',
        foods: [{ name: 'Protein Shake', calories: 180, protein: 30, carbs: 8, fat: 3, servings: 1 }],
      },
    ],
    totals: { calories: 610, protein: 65, carbs: 46, fat: 17 },
    goals: { calories: 2200, protein: 170, carbs: 240, fat: 70 },
  },
]

export const fallbackProgress: Progress[] = [
  {
    _id: 'demo-progress-1',
    userId: demoUserId,
    date: new Date(now.getTime() - 21 * oneDay),
    weight: 83.4,
    measurements: { chest: 102, waist: 87, hips: 96, arms: 35, legs: 58 },
    notes: 'Started demo cut phase.',
  },
  {
    _id: 'demo-progress-2',
    userId: demoUserId,
    date: new Date(now.getTime() - 14 * oneDay),
    weight: 82.7,
    measurements: { chest: 101, waist: 85, hips: 95, arms: 35, legs: 58 },
    notes: 'Energy steady and cardio improving.',
  },
  {
    _id: 'demo-progress-3',
    userId: demoUserId,
    date: new Date(now.getTime() - 7 * oneDay),
    weight: 82.1,
    measurements: { chest: 101, waist: 84, hips: 95, arms: 35, legs: 57 },
    notes: 'Recovery week kept intensity manageable.',
  },
]

export function isDatabaseConnectionError(error: unknown) {
  return error instanceof Error && ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].some((code) => error.message.includes(code))
}
