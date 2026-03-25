import mongoose, { Schema, models } from 'mongoose'

const ExerciseSchema = new Schema({
  exerciseName: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  notes: String,
}, { _id: false })

const WorkoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['strength', 'cardio', 'flexibility', 'mixed'], required: true },
  duration: { type: Number, required: true },
  exercises: [ExerciseSchema],
  notes: String,
  createdAt: { type: Date, default: Date.now },
})

export default models.Workout || mongoose.model('Workout', WorkoutSchema)
