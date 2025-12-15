export interface User {
  _id: string
  name: string
  email: string
  password?: string
  createdAt: Date
  profile?: {
    age?: number
    height?: number
    currentWeight?: number
    goalWeight?: number
    activityLevel?: string
    goals?: string[]
  }
  preferences?: {
    unit: 'metric' | 'imperial'
    darkMode: boolean
  }
}

export interface Exercise {
  exerciseName: string
  sets: number
  reps: number
  weight: number
  notes?: string
}

export interface Workout {
  _id: string
  userId: string
  date: Date
  name: string
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed'
  duration: number
  exercises: Exercise[]
  notes?: string
  createdAt: Date
}

export interface Food {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servings: number
}

export interface Meal {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: Food[]
}

export interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Nutrition {
  _id: string
  userId: string
  date: Date
  meals: Meal[]
  totals: NutritionTotals
  goals: NutritionTotals
}

export interface Measurements {
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  legs?: number
}

export interface Progress {
  _id: string
  userId: string
  date: Date
  weight?: number
  measurements?: Measurements
  photos?: string[]
  notes?: string
}
