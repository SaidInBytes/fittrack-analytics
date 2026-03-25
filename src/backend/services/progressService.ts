import { connectDB } from '@/backend/config/db'
import ProgressModel from '@/backend/models/Progress'

export async function getProgressByUser(userId: string, limit = 90) {
  await connectDB()
  return ProgressModel.find({ userId }).sort({ date: -1 }).limit(limit)
}

export async function createProgress(userId: string, data: any) {
  await connectDB()
  return ProgressModel.create({ ...data, userId })
}

export async function getLatestProgress(userId: string) {
  await connectDB()
  return ProgressModel.findOne({ userId }).sort({ date: -1 })
}

export async function updateProgress(id: string, userId: string, data: any) {
  await connectDB()
  return ProgressModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}
