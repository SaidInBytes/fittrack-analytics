import { connectDB } from '@/backend/config/db'
import ProgressModel from '@/backend/models/Progress'
import type { Progress } from '@/types'

// Fetches recent progress entries for a user.
export async function getProgressByUser(userId: string, limit = 90) {
  await connectDB()
  return ProgressModel.find({ userId }).sort({ date: -1 }).limit(limit)
}

// Creates a new progress entry for a user.
export async function createProgress(userId: string, data: Partial<Progress>) {
  await connectDB()
  return ProgressModel.create({ ...data, userId })
}

// Returns the most recent progress entry for trend calculations.
export async function getLatestProgress(userId: string) {
  await connectDB()
  return ProgressModel.findOne({ userId }).sort({ date: -1 })
}

// Updates an existing progress entry and returns the updated document.
export async function updateProgress(id: string, userId: string, data: Partial<Progress>) {
  await connectDB()
  return ProgressModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}
