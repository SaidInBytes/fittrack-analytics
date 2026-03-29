import { connectDB } from '@/backend/config/db'
import NutritionModel from '@/backend/models/Nutrition'
import type { Meal, NutritionTotals } from '@/types'

type UpdateNutritionInput = {
  date?: string | Date
  meals?: Meal[]
  goals?: NutritionTotals
}

function calculateNutritionTotals(meals: Meal[]): NutritionTotals {
  return meals.reduce(
    (totals, meal) => {
      for (const food of meal.foods) {
        const servings = Number(food.servings) || 0
        totals.calories += (Number(food.calories) || 0) * servings
        totals.protein += (Number(food.protein) || 0) * servings
        totals.carbs += (Number(food.carbs) || 0) * servings
        totals.fat += (Number(food.fat) || 0) * servings
      }

      return totals
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export async function getNutritionByUser(userId: string, limit = 30) {
  await connectDB()
  return NutritionModel.find({ userId }).sort({ date: -1 }).limit(limit)
}

export async function createNutrition(
  userId: string,
  data: {
    date: string | Date
    meals: Meal[]
    goals?: NutritionTotals
  }
) {
  await connectDB()
  const totals = calculateNutritionTotals(data.meals)

  return NutritionModel.create({
    ...data,
    userId,
    totals,
  })
}

export async function getNutritionByDate(userId: string, date: Date) {
  await connectDB()
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return NutritionModel.findOne({ userId, date: { $gte: start, $lte: end } })
}

export async function updateNutrition(id: string, userId: string, data: UpdateNutritionInput) {
  await connectDB()
  const updatePayload: UpdateNutritionInput & { totals?: NutritionTotals } = { ...data }

  if (Array.isArray(data.meals)) {
    updatePayload.totals = calculateNutritionTotals(data.meals)
  }

  return NutritionModel.findOneAndUpdate({ _id: id, userId }, updatePayload, { new: true })
}
