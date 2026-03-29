import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoist mocks so they are available when vi.mock factories run ───────────────
const { WorkoutModelMock } = vi.hoisted(() => {
  const WorkoutModelMock = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  }
  return { WorkoutModelMock }
})

// ── Mock DB connection so tests never touch MongoDB ───────────────────────────
vi.mock('@/backend/config/db', () => ({ connectDB: vi.fn() }))
vi.mock('@/backend/models/Workout', () => ({ default: WorkoutModelMock }))

// ── Shared helper for chainable Mongoose find ─────────────────────────────────
const makeFindChain = (result: unknown) => ({
  sort: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue(result),
})

import {
  getWorkoutsByUser,
  createWorkout,
  getWorkoutTemplatesByUser,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  logTemplateAsWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutById,
} from '@/backend/services/workoutService'

const USER_ID = 'user123'
const WORKOUT_ID = 'workout456'

const mockWorkout = {
  _id: WORKOUT_ID,
  userId: USER_ID,
  name: 'Bench day',
  type: 'strength',
  isTemplate: false,
  date: new Date('2026-03-29'),
  duration: 0,
  exercises: [{ exerciseName: 'Bench press', sets: 3, reps: 10, weight: 80 }],
}

const mockTemplate = {
  ...mockWorkout,
  _id: 'tpl001',
  isTemplate: true,
  scheduleDays: ['monday', 'thursday'],
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getWorkoutsByUser ────────────────────────────────────────────────────────

describe('getWorkoutsByUser', () => {
  it('queries non-template workouts for the user', async () => {
    WorkoutModelMock.find.mockReturnValue(makeFindChain([mockWorkout]))

    const result = await getWorkoutsByUser(USER_ID)

    expect(WorkoutModelMock.find).toHaveBeenCalledWith({
      userId: USER_ID,
      isTemplate: { $ne: true },
    })
    expect(result).toEqual([mockWorkout])
  })

  it('applies the default limit of 50', async () => {
    const chain = makeFindChain([])
    WorkoutModelMock.find.mockReturnValue(chain)

    await getWorkoutsByUser(USER_ID)

    expect(chain.limit).toHaveBeenCalledWith(50)
  })
})

// ─── createWorkout ────────────────────────────────────────────────────────────

describe('createWorkout', () => {
  it('creates a workout with isTemplate=false', async () => {
    WorkoutModelMock.create.mockResolvedValue(mockWorkout)

    const input = {
      name: 'Bench day',
      type: 'strength' as const,
      duration: 0,
      date: '2026-03-29',
      exercises: [{ exerciseName: 'Bench press', sets: 3, reps: 10, weight: 80 }],
    }

    const result = await createWorkout(USER_ID, input)

    expect(WorkoutModelMock.create).toHaveBeenCalledWith({
      ...input,
      userId: USER_ID,
      isTemplate: false,
    })
    expect(result).toEqual(mockWorkout)
  })
})

// ─── getWorkoutTemplatesByUser ────────────────────────────────────────────────

describe('getWorkoutTemplatesByUser', () => {
  it('queries template workouts for the user', async () => {
    WorkoutModelMock.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockTemplate]),
    })

    const result = await getWorkoutTemplatesByUser(USER_ID)

    expect(WorkoutModelMock.find).toHaveBeenCalledWith({
      userId: USER_ID,
      isTemplate: true,
    })
    expect(result).toEqual([mockTemplate])
  })
})

// ─── createWorkoutTemplate ────────────────────────────────────────────────────

describe('createWorkoutTemplate', () => {
  it('creates a template with isTemplate=true and a date fallback', async () => {
    WorkoutModelMock.create.mockResolvedValue(mockTemplate)

    const input = {
      name: 'Push day',
      type: 'strength' as const,
      duration: 0,
      exercises: [{ exerciseName: 'OHP', sets: 4, reps: 8, weight: 50 }],
      scheduleDays: ['monday', 'thursday'] as any,
    }

    await createWorkoutTemplate(USER_ID, input)

    const callArg = WorkoutModelMock.create.mock.calls[0][0]
    expect(callArg.isTemplate).toBe(true)
    expect(callArg.userId).toBe(USER_ID)
    expect(callArg.date).toBeInstanceOf(Date)
  })
})

// ─── deleteWorkoutTemplate ────────────────────────────────────────────────────

describe('deleteWorkoutTemplate', () => {
  it('deletes a template scoped to userId and isTemplate=true', async () => {
    WorkoutModelMock.findOneAndDelete.mockResolvedValue(mockTemplate)

    const result = await deleteWorkoutTemplate('tpl001', USER_ID)

    expect(WorkoutModelMock.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'tpl001',
      userId: USER_ID,
      isTemplate: true,
    })
    expect(result).toEqual(mockTemplate)
  })

  it('returns null when template is not found', async () => {
    WorkoutModelMock.findOneAndDelete.mockResolvedValue(null)

    const result = await deleteWorkoutTemplate('missing', USER_ID)

    expect(result).toBeNull()
  })
})

// ─── logTemplateAsWorkout ─────────────────────────────────────────────────────

describe('logTemplateAsWorkout', () => {
  it('creates a new non-template workout from a template', async () => {
    WorkoutModelMock.findOne.mockResolvedValue(mockTemplate)
    WorkoutModelMock.create.mockResolvedValue({ ...mockTemplate, isTemplate: false, _id: 'new1' })

    const result = await logTemplateAsWorkout('tpl001', USER_ID)

    expect(WorkoutModelMock.findOne).toHaveBeenCalledWith({
      _id: 'tpl001',
      userId: USER_ID,
      isTemplate: true,
    })
    const createArg = WorkoutModelMock.create.mock.calls[0][0]
    expect(createArg.isTemplate).toBe(false)
    expect(createArg.date).toBeInstanceOf(Date)
    expect(result?._id).toBe('new1')
  })

  it('returns null when template does not exist', async () => {
    WorkoutModelMock.findOne.mockResolvedValue(null)

    const result = await logTemplateAsWorkout('missing', USER_ID)

    expect(result).toBeNull()
    expect(WorkoutModelMock.create).not.toHaveBeenCalled()
  })
})

// ─── updateWorkout ────────────────────────────────────────────────────────────

describe('updateWorkout', () => {
  it('calls findOneAndUpdate with the correct filter and returns the updated doc', async () => {
    const updated = { ...mockWorkout, name: 'Updated' }
    WorkoutModelMock.findOneAndUpdate.mockResolvedValue(updated)

    const result = await updateWorkout(WORKOUT_ID, USER_ID, { name: 'Updated' })

    expect(WorkoutModelMock.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: WORKOUT_ID, userId: USER_ID },
      { name: 'Updated' },
      { new: true }
    )
    expect(result?.name).toBe('Updated')
  })
})

// ─── deleteWorkout ────────────────────────────────────────────────────────────

describe('deleteWorkout', () => {
  it('deletes a workout scoped to userId', async () => {
    WorkoutModelMock.findOneAndDelete.mockResolvedValue(mockWorkout)

    const result = await deleteWorkout(WORKOUT_ID, USER_ID)

    expect(WorkoutModelMock.findOneAndDelete).toHaveBeenCalledWith({
      _id: WORKOUT_ID,
      userId: USER_ID,
    })
    expect(result).toEqual(mockWorkout)
  })
})

// ─── getWorkoutById ───────────────────────────────────────────────────────────

describe('getWorkoutById', () => {
  it('fetches a single workout by id and userId', async () => {
    WorkoutModelMock.findOne.mockResolvedValue(mockWorkout)

    const result = await getWorkoutById(WORKOUT_ID, USER_ID)

    expect(WorkoutModelMock.findOne).toHaveBeenCalledWith({ _id: WORKOUT_ID, userId: USER_ID })
    expect(result).toEqual(mockWorkout)
  })
})
