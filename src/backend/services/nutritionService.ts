import { connectDB } from '@/backend/config/db'
import NutritionModel from '@/backend/models/Nutrition'

export async function getNutritionByUser(userId: string, limit = 30) {
  await connectDB()
  return NutritionModel.find({ userId }).sort({ date: -1 }).limit(limit)
}

export async function createNutrition(userId: string, data: any) {
  await connectDB()
  return NutritionModel.create({ ...data, userId })
}

export async function getNutritionByDate(userId: string, date: Date) {
  await connectDB()
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return NutritionModel.findOne({ userId, date: { $gte: start, $lte: end } })
}

export async function updateNutrition(id: string, userId: string, data: any) {
  await connectDB()
  return NutritionModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}
