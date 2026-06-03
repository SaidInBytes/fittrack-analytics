import bcrypt from 'bcryptjs'
import { connectDB } from '@/backend/config/db'
import NutritionModel from '@/backend/models/Nutrition'
import ProgressModel from '@/backend/models/Progress'
import UserModel from '@/backend/models/User'
import WorkoutModel from '@/backend/models/Workout'

const demoAuthConfig = {
  email: process.env.DEMO_USER_EMAIL ?? 'shared-access@fittrack.app',
  password: process.env.DEMO_USER_PASSWORD ?? 'shared-access-only',
  name: process.env.DEMO_USER_NAME ?? 'Shared Access',
}

function buildDemoWorkoutSeed(now: Date) {
  const oneDay = 24 * 60 * 60 * 1000

  return [
    {
      name: 'Upper Body Strength',
      type: 'strength' as const,
      duration: 0,
      exercises: [
        { exerciseName: 'Bench Press', sets: 4, reps: 8, weight: 60 },
        { exerciseName: 'Bent-Over Row', sets: 4, reps: 10, weight: 45 },
      ],
      date: new Date(now.getTime() - oneDay),
      isTemplate: false,
    },
    {
      name: 'Tempo Run',
      type: 'cardio' as const,
      duration: 35,
      exercises: [],
      date: new Date(now.getTime() - 3 * oneDay),
      isTemplate: false,
    },
    {
      name: 'Mobility Flow',
      type: 'flexibility' as const,
      duration: 20,
      exercises: [],
      date: new Date(now.getTime() - 5 * oneDay),
      isTemplate: false,
    },
    {
      name: 'Push Day Template',
      type: 'strength' as const,
      duration: 0,
      exercises: [
        { exerciseName: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 22 },
        { exerciseName: 'Shoulder Press', sets: 3, reps: 10, weight: 18 },
      ],
      date: now,
      isTemplate: true,
      scheduleDays: ['monday', 'thursday'],
    },
    {
      name: 'Recovery Cardio Template',
      type: 'cardio' as const,
      duration: 30,
      exercises: [],
      date: now,
      isTemplate: true,
      scheduleDays: ['wednesday', 'saturday'],
    },
  ]
}

function buildDemoNutritionSeed(now: Date) {
  const oneDay = 24 * 60 * 60 * 1000

  return [
    {
      date: new Date(now.getTime() - oneDay),
      meals: [
        {
          mealType: 'breakfast' as const,
          foods: [
            { name: 'Greek Yogurt Bowl', calories: 220, protein: 20, carbs: 18, fat: 6, servings: 1 },
            { name: 'Blueberries', calories: 57, protein: 1, carbs: 14, fat: 0, servings: 1 },
          ],
        },
        {
          mealType: 'dinner' as const,
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
      date: new Date(now.getTime() - 2 * oneDay),
      meals: [
        {
          mealType: 'lunch' as const,
          foods: [
            { name: 'Chicken Wrap', calories: 430, protein: 35, carbs: 38, fat: 14, servings: 1 },
          ],
        },
        {
          mealType: 'snack' as const,
          foods: [
            { name: 'Protein Shake', calories: 180, protein: 30, carbs: 8, fat: 3, servings: 1 },
          ],
        },
      ],
      totals: { calories: 610, protein: 65, carbs: 46, fat: 17 },
      goals: { calories: 2200, protein: 170, carbs: 240, fat: 70 },
    },
  ]
}

function buildDemoProgressSeed(now: Date) {
  const oneDay = 24 * 60 * 60 * 1000

  return [
    {
      date: new Date(now.getTime() - 21 * oneDay),
      weight: 83.4,
      measurements: { chest: 102, waist: 87, hips: 96, arms: 35, legs: 58 },
      notes: 'Started demo cut phase.',
    },
    {
      date: new Date(now.getTime() - 14 * oneDay),
      weight: 82.7,
      measurements: { chest: 101, waist: 85, hips: 95, arms: 35, legs: 58 },
      notes: 'Energy steady and cardio improving.',
    },
    {
      date: new Date(now.getTime() - 7 * oneDay),
      weight: 82.1,
      measurements: { chest: 101, waist: 84, hips: 95, arms: 35, legs: 57 },
      notes: 'Recovery week kept intensity manageable.',
    },
  ]
}

async function seedDemoData(userId: string) {
  const now = new Date()
  const [workoutCount, nutritionCount, progressCount] = await Promise.all([
    WorkoutModel.countDocuments({ userId }),
    NutritionModel.countDocuments({ userId }),
    ProgressModel.countDocuments({ userId }),
  ])

  const writes: Promise<unknown>[] = []

  if (workoutCount === 0) {
    writes.push(
      WorkoutModel.insertMany(buildDemoWorkoutSeed(now).map((entry) => ({ ...entry, userId })))
    )
  }

  if (nutritionCount === 0) {
    writes.push(
      NutritionModel.insertMany(buildDemoNutritionSeed(now).map((entry) => ({ ...entry, userId })))
    )
  }

  if (progressCount === 0) {
    writes.push(
      ProgressModel.insertMany(buildDemoProgressSeed(now).map((entry) => ({ ...entry, userId })))
    )
  }

  if (writes.length > 0) {
    await Promise.all(writes)
  }
}

export async function ensureDemoUser() {
  await connectDB()

  const { email, name, password } = demoAuthConfig
  const hashedPassword = await bcrypt.hash(password, 12)
  let user = await UserModel.findOne({ email }).select('+password')

  if (!user) {
    user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
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
    })
  } else {
    user.name = user.name || name
    user.password = hashedPassword

    if (!user.profile) {
      user.profile = {
        age: 29,
        height: 178,
        currentWeight: 82,
        goalWeight: 78,
        activityLevel: 'moderate',
        goals: ['Lose fat', 'Build strength', 'Stay consistent'],
      }
    }

    await user.save()
  }

  await seedDemoData(user._id.toString())

  return user
}