import type { ExerciseSuggestion, PlannedExercise, WorkoutPlanType } from './wgerService'

type LocalExercise = {
  id: number
  name: string
  category: string
  types: WorkoutPlanType[]
}

const LOCAL_EXERCISES: LocalExercise[] = [
  { id: 1001, name: 'Bench Press', category: 'Chest', types: ['push'] },
  { id: 1002, name: 'Incline Dumbbell Press', category: 'Chest', types: ['push'] },
  { id: 1003, name: 'Push-Up', category: 'Chest', types: ['push'] },
  { id: 1004, name: 'Chest Fly', category: 'Chest', types: ['push'] },
  { id: 1005, name: 'Shoulder Press', category: 'Shoulders', types: ['push'] },
  { id: 1006, name: 'Lateral Raise', category: 'Shoulders', types: ['push'] },
  { id: 1007, name: 'Front Raise', category: 'Shoulders', types: ['push'] },
  { id: 1008, name: 'Triceps Pushdown', category: 'Arms', types: ['push'] },
  { id: 1009, name: 'Overhead Triceps Extension', category: 'Arms', types: ['push'] },
  { id: 1010, name: 'Dips', category: 'Chest', types: ['push'] },

  { id: 1101, name: 'Pull-Up', category: 'Back', types: ['pull'] },
  { id: 1102, name: 'Lat Pulldown', category: 'Back', types: ['pull'] },
  { id: 1103, name: 'Bent-Over Row', category: 'Back', types: ['pull'] },
  { id: 1104, name: 'Seated Cable Row', category: 'Back', types: ['pull'] },
  { id: 1105, name: 'Single-Arm Dumbbell Row', category: 'Back', types: ['pull'] },
  { id: 1106, name: 'Face Pull', category: 'Shoulders', types: ['pull'] },
  { id: 1107, name: 'Rear Delt Fly', category: 'Shoulders', types: ['pull'] },
  { id: 1108, name: 'Barbell Curl', category: 'Arms', types: ['pull'] },
  { id: 1109, name: 'Hammer Curl', category: 'Arms', types: ['pull'] },
  { id: 1110, name: 'Preacher Curl', category: 'Arms', types: ['pull'] },

  { id: 1201, name: 'Back Squat', category: 'Legs', types: ['legs'] },
  { id: 1202, name: 'Front Squat', category: 'Legs', types: ['legs'] },
  { id: 1203, name: 'Romanian Deadlift', category: 'Legs', types: ['legs', 'pull'] },
  { id: 1204, name: 'Leg Press', category: 'Legs', types: ['legs'] },
  { id: 1205, name: 'Walking Lunge', category: 'Legs', types: ['legs'] },
  { id: 1206, name: 'Bulgarian Split Squat', category: 'Legs', types: ['legs'] },
  { id: 1207, name: 'Leg Curl', category: 'Legs', types: ['legs'] },
  { id: 1208, name: 'Leg Extension', category: 'Legs', types: ['legs'] },
  { id: 1209, name: 'Standing Calf Raise', category: 'Calves', types: ['legs'] },
  { id: 1210, name: 'Hip Thrust', category: 'Legs', types: ['legs'] },

  { id: 1301, name: 'Treadmill Run', category: 'Cardio', types: ['cardio'] },
  { id: 1302, name: 'Stationary Bike', category: 'Cardio', types: ['cardio'] },
  { id: 1303, name: 'Rowing Machine', category: 'Cardio', types: ['cardio', 'pull'] },
  { id: 1304, name: 'Elliptical', category: 'Cardio', types: ['cardio'] },
  { id: 1305, name: 'Jump Rope', category: 'Cardio', types: ['cardio'] },
  { id: 1306, name: 'Mountain Climbers', category: 'Cardio', types: ['cardio'] },
  { id: 1307, name: 'Burpees', category: 'Cardio', types: ['cardio', 'push'] },
  { id: 1308, name: 'High Knees', category: 'Cardio', types: ['cardio'] },
  { id: 1309, name: 'Battle Ropes', category: 'Cardio', types: ['cardio', 'pull'] },
  { id: 1310, name: 'Sled Push', category: 'Cardio', types: ['cardio', 'legs'] },

  { id: 1401, name: 'Worlds Greatest Stretch', category: 'Mobility', types: ['stretch'] },
  { id: 1402, name: 'Hip Flexor Stretch', category: 'Mobility', types: ['stretch'] },
  { id: 1403, name: 'Hamstring Stretch', category: 'Mobility', types: ['stretch'] },
  { id: 1404, name: 'Pigeon Pose', category: 'Mobility', types: ['stretch'] },
  { id: 1405, name: 'Childs Pose', category: 'Mobility', types: ['stretch'] },
  { id: 1406, name: 'Thoracic Rotation', category: 'Mobility', types: ['stretch'] },
  { id: 1407, name: 'Couch Stretch', category: 'Mobility', types: ['stretch'] },
  { id: 1408, name: 'Calf Wall Stretch', category: 'Mobility', types: ['stretch'] },
  { id: 1409, name: 'Shoulder Dislocates', category: 'Mobility', types: ['stretch', 'push'] },
  { id: 1410, name: 'Cat-Cow', category: 'Mobility', types: ['stretch'] },

  { id: 1501, name: 'Plank', category: 'Core', types: ['cardio', 'stretch'] },
  { id: 1502, name: 'Dead Bug', category: 'Core', types: ['stretch'] },
  { id: 1503, name: 'Hanging Knee Raise', category: 'Core', types: ['pull'] },
  { id: 1504, name: 'Russian Twist', category: 'Core', types: ['cardio'] },
  { id: 1505, name: 'Cable Crunch', category: 'Core', types: ['pull'] },
]

export function searchLocalExercises(query: string, limit = 10): ExerciseSuggestion[] {
  const normalized = query.trim().toLowerCase()
  if (normalized.length < 2) return []

  return LOCAL_EXERCISES.filter((exercise) => exercise.name.toLowerCase().includes(normalized))
    .slice(0, limit)
    .map((exercise) => ({ id: exercise.id, name: exercise.name }))
}

export function getLocalPlannedExercises(type: WorkoutPlanType, count: number): PlannedExercise[] {
  const matches = LOCAL_EXERCISES.filter((exercise) => exercise.types.includes(type))
  const pool = matches.length > 0 ? matches : LOCAL_EXERCISES

  return Array.from({ length: count }, (_, index) => {
    const exercise = pool[index % pool.length]
    return {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      imageUrl: null,
    }
  })
}
