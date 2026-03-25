import bcrypt from 'bcryptjs'
import { connectDB } from '@/backend/config/db'
import UserModel from '@/backend/models/User'

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

export async function updateUserProfile(id: string, profile: any) {
  await connectDB()
  return UserModel.findByIdAndUpdate(id, { profile }, { new: true })
}
