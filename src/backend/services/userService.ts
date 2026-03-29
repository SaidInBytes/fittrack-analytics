import bcrypt from 'bcryptjs'
import { connectDB } from '@/backend/config/db'
import UserModel from '@/backend/models/User'
import type { User } from '@/types'

// Registers a new user after enforcing unique email and hashing password.
export async function registerUser(name: string, email: string, password: string) {
  await connectDB()

  const existingUser = await UserModel.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  return UserModel.create({ name, email, password: hashedPassword })
}

// Fetches a user by primary id.
export async function getUserById(id: string) {
  await connectDB()
  return UserModel.findById(id)
}

// Replaces profile fields for a user and returns the updated document.
export async function updateUserProfile(id: string, profile: User['profile']) {
  await connectDB()
  return UserModel.findByIdAndUpdate(id, { profile }, { new: true })
}

// Returns the user settings payload used by the settings screen.
export async function getUserSettings(id: string) {
  await connectDB()
  return UserModel.findById(id).select('name email profile preferences')
}

// Applies partial settings updates while preserving unspecified fields.
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
