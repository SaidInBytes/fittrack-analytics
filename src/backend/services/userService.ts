import bcrypt from 'bcryptjs'
import { connectDB } from '@/backend/config/db'
import UserModel from '@/backend/models/User'
import type { User } from '@/types'

export async function registerUser(name: string, email: string, password: string) {
  await connectDB()

  const existingUser = await UserModel.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  return UserModel.create({ name, email, password: hashedPassword })
}

export async function getUserById(id: string) {
  await connectDB()
  return UserModel.findById(id)
}

export async function updateUserProfile(id: string, profile: User['profile']) {
  await connectDB()
  return UserModel.findByIdAndUpdate(id, { profile }, { new: true })
}

export async function getUserSettings(id: string) {
  await connectDB()
  return UserModel.findById(id).select('name email profile preferences')
}

export async function updateUserSettings(
  id: string,
  payload: {
    name?: string
    profile?: User['profile']
    preferences?: User['preferences']
  }
) {
  await connectDB()

  const updatePayload: {
    name?: string
    profile?: User['profile']
    preferences?: User['preferences']
  } = {}

  if (payload.name !== undefined) {
    updatePayload.name = payload.name
  }

  if (payload.profile !== undefined) {
    updatePayload.profile = payload.profile
  }

  if (payload.preferences !== undefined) {
    updatePayload.preferences = payload.preferences
  }

  return UserModel.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).select('name email profile preferences')
}
