import { create } from 'zustand'
import type { Workout, Nutrition, Progress } from '@/types'

interface AppState {
  workouts: Workout[]
  nutrition: Nutrition[]
  progress: Progress[]
  isLoading: boolean

  setWorkouts: (workouts: Workout[]) => void
  addWorkout: (workout: Workout) => void
  setNutrition: (nutrition: Nutrition[]) => void
  addNutrition: (nutrition: Nutrition) => void
  setProgress: (progress: Progress[]) => void
  addProgress: (progress: Progress) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  workouts: [],
  nutrition: [],
  progress: [],
  isLoading: false,

  setWorkouts: (workouts) => set({ workouts }),
  addWorkout: (workout) => set((state) => ({ workouts: [workout, ...state.workouts] })),
  setNutrition: (nutrition) => set({ nutrition }),
  addNutrition: (nutrition) => set((state) => ({ nutrition: [nutrition, ...state.nutrition] })),
  setProgress: (progress) => set({ progress }),
  addProgress: (progress) => set((state) => ({ progress: [progress, ...state.progress] })),
  setLoading: (isLoading) => set({ isLoading }),
}))
