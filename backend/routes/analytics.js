import express from 'express';
import Workout from '../models/Workout.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get start of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get weekly analytics (last 7 days)
// @route   GET /api/analytics/weekly
// @access  Private
router.get('/weekly', protect, async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      user: req.user._id,
      completedAt: { $gte: sevenDaysAgo }
    }).populate('exercises.exercise');

    // Generate last 7 days list
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      daysData.push({ label, dateStr, volume: 0, count: 0, duration: 0 });
    }

    // Populate data
    workouts.forEach(w => {
      const wDateStr = new Date(w.completedAt).toISOString().split('T')[0];
      const targetDay = daysData.find(d => d.dateStr === wDateStr);
      
      if (targetDay) {
        targetDay.count += 1;
        // Calculate volume
        let workoutVolume = 0;
        let workoutDuration = 0;
        
        w.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            if (set.completed) {
              if (set.weight && set.reps) {
                workoutVolume += set.weight * set.reps;
              }
              if (set.duration) {
                workoutDuration += set.duration; // in seconds
              }
            }
          });
        });
        
        targetDay.volume += workoutVolume;
        targetDay.duration += Math.round(workoutDuration / 60); // minutes
      }
    });

    res.json(daysData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly analytics (last 30 days grouped into 4 weeks)
// @route   GET /api/analytics/monthly
// @access  Private
router.get('/monthly', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      user: req.user._id,
      completedAt: { $gte: thirtyDaysAgo }
    }).populate('exercises.exercise');

    // Create 4 weekly buckets
    const weeksData = [
      { label: 'Week 1', volume: 0, count: 0, duration: 0 },
      { label: 'Week 2', volume: 0, count: 0, duration: 0 },
      { label: 'Week 3', volume: 0, count: 0, duration: 0 },
      { label: 'Week 4', volume: 0, count: 0, duration: 0 }
    ];

    workouts.forEach(w => {
      const compDate = new Date(w.completedAt);
      const diffTime = Math.abs(today - compDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Categorize into week 1 (newest) to week 4 (oldest)
      let weekIndex = 0;
      if (diffDays < 7) {
        weekIndex = 3; // Week 4 (current week)
      } else if (diffDays < 14) {
        weekIndex = 2; // Week 3
      } else if (diffDays < 21) {
        weekIndex = 1; // Week 2
      } else {
        weekIndex = 0; // Week 1 (oldest)
      }

      // Add details
      let wVolume = 0;
      let wDuration = 0;

      w.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            if (set.weight && set.reps) wVolume += set.weight * set.reps;
            if (set.duration) wDuration += set.duration;
          }
        });
      });

      weeksData[weekIndex].count += 1;
      weeksData[weekIndex].volume += wVolume;
      weeksData[weekIndex].duration += Math.round(wDuration / 60);
    });

    res.json(weeksData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get yearly analytics (last 12 months)
// @route   GET /api/analytics/yearly
// @access  Private
router.get('/yearly', protect, async (req, res) => {
  try {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      user: req.user._id,
      completedAt: { $gte: twelveMonthsAgo }
    }).populate('exercises.exercise');

    // Create 12 months buckets
    const monthsData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsData.push({ label, yearMonth, volume: 0, count: 0, duration: 0 });
    }

    workouts.forEach(w => {
      const compDate = new Date(w.completedAt);
      const ym = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}`;
      const targetMonth = monthsData.find(m => m.yearMonth === ym);

      if (targetMonth) {
        targetMonth.count += 1;
        let wVolume = 0;
        let wDuration = 0;

        w.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            if (set.completed) {
              if (set.weight && set.reps) wVolume += set.weight * set.reps;
              if (set.duration) wDuration += set.duration;
            }
          });
        });

        targetMonth.volume += wVolume;
        targetMonth.duration += Math.round(wDuration / 60);
      }
    });

    res.json(monthsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
