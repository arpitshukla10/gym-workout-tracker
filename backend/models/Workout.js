import mongoose from 'mongoose';

const workoutSetSchema = new mongoose.Schema({
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // in seconds
  distance: { type: Number, default: 0 }, // in km/miles
  rpe: { type: Number, default: null },
  completed: { type: Boolean, default: true },
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: [workoutSetSchema],
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null, // can be logged without a template
  },
  dayLabel: {
    type: String,
    required: true,
    trim: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    required: true,
  },
  exercises: [workoutExerciseSchema],
  notes: {
    type: String,
    trim: true,
  },
});

export default mongoose.model('Workout', workoutSchema);
