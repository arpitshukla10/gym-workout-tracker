import express from 'express';
import Exercise from '../models/Exercise.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all standard and user custom exercises
// @route   GET /api/exercises
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find all exercises where creator is null (global) or creator is the user
    const exercises = await Exercise.find({
      $or: [{ creator: null }, { creator: req.user._id }]
    }).sort({ name: 1 });
    
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a custom exercise
// @route   POST /api/exercises
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, category, targetMuscleGroup } = req.body;

  if (!name || !category || !targetMuscleGroup) {
    return res.status(400).json({ message: 'Please provide name, category, and target muscle group.' });
  }

  try {
    // Check if exercise name exists for this user or globally
    const exists = await Exercise.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [{ creator: null }, { creator: req.user._id }]
    });

    if (exists) {
      return res.status(400).json({ message: 'An exercise with this name already exists.' });
    }

    const exercise = await Exercise.create({
      name,
      category,
      targetMuscleGroup,
      isCustom: true,
      creator: req.user._id
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
