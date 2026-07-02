import express from 'express';
import Workout from '../models/Workout.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user workout history (paginated)
// @route   GET /api/workouts
// @access  Private
router.get('/', protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const total = await Workout.countDocuments({ user: req.user._id });
    const workouts = await Workout.find({ user: req.user._id })
      .populate('exercises.exercise')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      workouts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Save a completed workout log
// @route   POST /api/workouts
// @access  Private
router.post('/', protect, async (req, res) => {
  const { program, dayLabel, startedAt, completedAt, exercises, notes } = req.body;

  if (!dayLabel || !completedAt || !exercises || exercises.length === 0) {
    return res.status(400).json({ message: 'Missing required workout data (dayLabel, completedAt, or exercises)' });
  }

  try {
    const workout = new Workout({
      user: req.user._id,
      program: program || null,
      dayLabel,
      startedAt: startedAt || Date.now(),
      completedAt,
      exercises,
      notes
    });

    const createdWorkout = await workout.save();
    
    // Fetch populated version to return
    const populated = await Workout.findById(createdWorkout._id).populate('exercises.exercise');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a workout log
// @route   DELETE /api/workouts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      return res.status(404).json({ message: 'Workout log not found or unauthorized' });
    }

    res.json({ message: 'Workout log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
