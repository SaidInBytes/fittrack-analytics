import mongoose, { Schema, models } from 'mongoose'

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  weight: Number,
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    legs: Number,
  },
  photos: [String],
  notes: String,
})

export default models.Progress || mongoose.model('Progress', ProgressSchema)
