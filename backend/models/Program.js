import mongoose from 'mongoose';

const programSetSchema = new mongoose.Schema({
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 }, // in kg or lbs
  duration: { type: Number, default: 0 }, // in seconds
  distance: { type: Number, default: 0 }, // in km or miles
  rpe: { type: Number, default: null }, // RPE (1-10)
});

const programExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: [programSetSchema],
});

const programDaySchema = new mongoose.Schema({
  dayLabel: {
    type: String,
    required: true,
    trim: true,
    // e.g. "Push Day", "Lower A", "Cardio Recovery"
  },
  exercises: [programExerciseSchema],
});

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  days: [programDaySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Program', programSchema);
