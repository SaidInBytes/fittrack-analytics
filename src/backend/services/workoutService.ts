import { connectDB } from '@/backend/config/db'
import WorkoutModel from '@/backend/models/Workout'

export async function getWorkoutsByUser(userId: string, limit = 50) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: { $ne: true } }).sort({ date: -1 }).limit(limit)
}

export async function createWorkout(userId: string, data: any) {
  await connectDB()
  return WorkoutModel.create({ ...data, userId, isTemplate: false })
}

export async function getWorkoutTemplatesByUser(userId: string) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: true }).sort({ createdAt: -1 })
}

export async function createWorkoutTemplate(userId: string, data: any) {
  await connectDB()
  return WorkoutModel.create({
    ...data,
    userId,
    isTemplate: true,
    date: data.date ?? new Date(),
  })
}

export async function getWorkoutById(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOne({ _id: id, userId })
}

export async function updateWorkout(id: string, userId: string, data: any) {
  await connectDB()
  return WorkoutModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}

export async function deleteWorkout(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOneAndDelete({ _id: id, userId })
}
