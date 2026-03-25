import mongoose, { Schema, models } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  profile: {
    age: Number,
    height: Number,
    currentWeight: Number,
    goalWeight: Number,
    activityLevel: String,
    goals: [String],
  },
  preferences: {
    unit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    darkMode: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
})

export default models.User || mongoose.model('User', UserSchema)
