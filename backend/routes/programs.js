import express from 'express';
import Program from '../models/Program.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all user programs
// @route   GET /api/programs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single program by ID
// @route   GET /api/programs/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const program = await Program.findOne({ _id: req.params.id, creator: req.user._id })
      .populate('days.exercises.exercise');
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new program
// @route   POST /api/programs
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, days } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Please include a program title.' });
  }

  try {
    const program = new Program({
      title,
      description,
      creator: req.user._id,
      days: days || []
    });

    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an existing program
// @route   PUT /api/programs/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, days } = req.body;

  try {
    const program = await Program.findOne({ _id: req.params.id, creator: req.user._id });

    if (!program) {
      return res.status(404).json({ message: 'Program not found or unauthorized' });
    }

    program.title = title || program.title;
    program.description = description !== undefined ? description : program.description;
    if (days) {
      program.days = days;
    }

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const program = await Program.findOneAndDelete({ _id: req.params.id, creator: req.user._id });

    if (!program) {
      return res.status(404).json({ message: 'Program not found or unauthorized' });
    }

    res.json({ message: 'Program removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
