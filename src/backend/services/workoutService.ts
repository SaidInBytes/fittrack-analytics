import { connectDB } from '@/backend/config/db'
import WorkoutModel from '@/backend/models/Workout'
import type { Exercise, Weekday } from '@/types'

type CreateWorkoutInput = {
  name: string
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed'
  duration: number
  date: string | Date
  exercises: Exercise[]
  notes?: string
}

type CreateTemplateInput = Omit<CreateWorkoutInput, 'date'> & {
  scheduleDays: Weekday[]
  date?: string | Date
}

type UpdateWorkoutInput = Partial<CreateWorkoutInput>

export async function getWorkoutsByUser(userId: string, limit = 50) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: { $ne: true } }).sort({ date: -1 }).limit(limit)
}

export async function createWorkout(userId: string, data: CreateWorkoutInput) {
  await connectDB()
  return WorkoutModel.create({ ...data, userId, isTemplate: false })
}

export async function getWorkoutTemplatesByUser(userId: string) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: true }).sort({ createdAt: -1 })
}

export async function createWorkoutTemplate(userId: string, data: CreateTemplateInput) {
  await connectDB()
  return WorkoutModel.create({
    ...data,
    userId,
    isTemplate: true,
    date: data.date ?? new Date(),
  })
}

export async function deleteWorkoutTemplate(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOneAndDelete({ _id: id, userId, isTemplate: true })
}

export async function logTemplateAsWorkout(id: string, userId: string) {
  await connectDB()
  const template = await WorkoutModel.findOne({ _id: id, userId, isTemplate: true })
  if (!template) return null
  return WorkoutModel.create({
    userId,
    name: template.name,
    type: template.type,
    duration: template.duration,
    exercises: template.exercises,
    notes: template.notes,
    date: new Date(),
    isTemplate: false,
  })
}

export async function getWorkoutById(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOne({ _id: id, userId })
}

export async function updateWorkout(id: string, userId: string, data: UpdateWorkoutInput) {
  await connectDB()
  return WorkoutModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}

export async function deleteWorkout(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOneAndDelete({ _id: id, userId })
}
