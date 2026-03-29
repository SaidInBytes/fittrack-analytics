import { connectDB } from '@/backend/config/db'
import NutritionModel from '@/backend/models/Nutrition'
import type { Meal, NutritionTotals } from '@/types'

type UpdateNutritionInput = {
  date?: string | Date
  meals?: Meal[]
  goals?: NutritionTotals
}

// Aggregates macro totals across all foods in all meals.
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

// Fetches recent nutrition logs for a user.
export async function getNutritionByUser(userId: string, limit = 30) {
  await connectDB()
  return NutritionModel.find({ userId }).sort({ date: -1 }).limit(limit)
}

// Creates a nutrition log and computes totals from the provided meals.
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

// Fetches a user's nutrition entry for a specific calendar date.
export async function getNutritionByDate(userId: string, date: Date) {
  await connectDB()
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return NutritionModel.findOne({ userId, date: { $gte: start, $lte: end } })
}

// Updates nutrition data and recalculates totals when meals are changed.
export async function updateNutrition(id: string, userId: string, data: UpdateNutritionInput) {
  await connectDB()
  const updatePayload: UpdateNutritionInput & { totals?: NutritionTotals } = { ...data }

  if (Array.isArray(data.meals)) {
    updatePayload.totals = calculateNutritionTotals(data.meals)
  }

  return NutritionModel.findOneAndUpdate({ _id: id, userId }, updatePayload, { new: true })
}
