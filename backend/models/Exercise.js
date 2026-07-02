import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Bodyweight'],
    required: true,
  },
  targetMuscleGroup: {
    type: String,
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Other'],
    required: true,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means it's a global standard exercise
  },
});

// Avoid duplicate exercise names per user or globally
exerciseSchema.index({ name: 1, creator: 1 }, { unique: true });

export default mongoose.model('Exercise', exerciseSchema);
