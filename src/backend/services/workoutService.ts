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

// Fetches recent non-template workouts for a user.
export async function getWorkoutsByUser(userId: string, limit = 50) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: { $ne: true } }).sort({ date: -1 }).limit(limit)
}

// Creates a one-off workout entry for the user.
export async function createWorkout(userId: string, data: CreateWorkoutInput) {
  await connectDB()
  return WorkoutModel.create({ ...data, userId, isTemplate: false })
}

// Fetches recurring workout templates for a user.
export async function getWorkoutTemplatesByUser(userId: string) {
  await connectDB()
  return WorkoutModel.find({ userId, isTemplate: true }).sort({ createdAt: -1 })
}

// Creates a recurring workout template with optional schedule metadata.
export async function createWorkoutTemplate(userId: string, data: CreateTemplateInput) {
  await connectDB()
  return WorkoutModel.create({
    ...data,
    userId,
    isTemplate: true,
    date: data.date ?? new Date(),
  })
}

// Deletes a template only if it belongs to the current user.
export async function deleteWorkoutTemplate(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOneAndDelete({ _id: id, userId, isTemplate: true })
}

// Clones a template into a completed workout for today.
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

// Fetches a single workout by id, scoped to the current user.
export async function getWorkoutById(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOne({ _id: id, userId })
}

// Updates a workout and returns the updated document.
export async function updateWorkout(id: string, userId: string, data: UpdateWorkoutInput) {
  await connectDB()
  return WorkoutModel.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}

// Deletes a workout that belongs to the current user.
export async function deleteWorkout(id: string, userId: string) {
  await connectDB()
  return WorkoutModel.findOneAndDelete({ _id: id, userId })
}
