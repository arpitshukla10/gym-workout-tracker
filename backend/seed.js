import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Exercise from './models/Exercise.js';
import Program from './models/Program.js';
import Workout from './models/Workout.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

const standardExercises = [
  // Strength
  { name: 'Barbell Bench Press', category: 'Strength', targetMuscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', category: 'Strength', targetMuscleGroup: 'Chest' },
  { name: 'Barbell Back Squat', category: 'Strength', targetMuscleGroup: 'Legs' },
  { name: 'Leg Press', category: 'Strength', targetMuscleGroup: 'Legs' },
  { name: 'Leg Extension', category: 'Strength', targetMuscleGroup: 'Legs' },
  { name: 'Seated Leg Curl', category: 'Strength', targetMuscleGroup: 'Legs' },
  { name: 'Barbell Deadlift', category: 'Strength', targetMuscleGroup: 'Back' },
  { name: 'Lat Pulldown', category: 'Strength', targetMuscleGroup: 'Back' },
  { name: 'Seated Cable Row', category: 'Strength', targetMuscleGroup: 'Back' },
  { name: 'Overhead Barbell Press', category: 'Strength', targetMuscleGroup: 'Shoulders' },
  { name: 'Dumbbell Lateral Raise', category: 'Strength', targetMuscleGroup: 'Shoulders' },
  { name: 'Dumbbell Bicep Curl', category: 'Strength', targetMuscleGroup: 'Arms' },
  { name: 'Tricep Rope Pushdown', category: 'Strength', targetMuscleGroup: 'Arms' },
  { name: 'Barbell Skull Crusher', category: 'Strength', targetMuscleGroup: 'Arms' },
  
  // Bodyweight
  { name: 'Pull-up', category: 'Bodyweight', targetMuscleGroup: 'Back' },
  { name: 'Push-up', category: 'Bodyweight', targetMuscleGroup: 'Chest' },
  { name: 'Chest Dips', category: 'Bodyweight', targetMuscleGroup: 'Arms' },
  { name: 'Plank', category: 'Bodyweight', targetMuscleGroup: 'Core' },
  { name: 'Hanging Leg Raise', category: 'Bodyweight', targetMuscleGroup: 'Core' },
  { name: 'Ab Wheel Rollout', category: 'Bodyweight', targetMuscleGroup: 'Core' },

  // Cardio
  { name: 'Treadmill Run', category: 'Cardio', targetMuscleGroup: 'Cardio' },
  { name: 'Stationary Cycling', category: 'Cardio', targetMuscleGroup: 'Cardio' },
  { name: 'Rowing Machine', category: 'Cardio', targetMuscleGroup: 'Cardio' },
  { name: 'Stair Climber', category: 'Cardio', targetMuscleGroup: 'Cardio' },
  { name: 'Elliptical Trainer', category: 'Cardio', targetMuscleGroup: 'Cardio' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym-tracker');
    console.log('MongoDB connection active for seeding...');

    // 1. Seed Exercises
    console.log('Seeding standard exercises...');
    await Exercise.deleteMany({ creator: null }); // clean default exercises
    const insertedExercises = await Exercise.insertMany(standardExercises);
    console.log(`Inserted ${insertedExercises.length} standard exercises.`);

    // Find exercises we need for the program
    const benchPress = insertedExercises.find(e => e.name === 'Barbell Bench Press');
    const inclinePress = insertedExercises.find(e => e.name === 'Incline Dumbbell Press');
    const squat = insertedExercises.find(e => e.name === 'Barbell Back Squat');
    const legPress = insertedExercises.find(e => e.name === 'Leg Press');
    const deadlift = insertedExercises.find(e => e.name === 'Barbell Deadlift');
    const latPulldown = insertedExercises.find(e => e.name === 'Lat Pulldown');
    const lateralRaise = insertedExercises.find(e => e.name === 'Dumbbell Lateral Raise');
    const bicepCurl = insertedExercises.find(e => e.name === 'Dumbbell Bicep Curl');
    const tricepPushdown = insertedExercises.find(e => e.name === 'Tricep Rope Pushdown');
    const pullup = insertedExercises.find(e => e.name === 'Pull-up');
    const plank = insertedExercises.find(e => e.name === 'Plank');
    const run = insertedExercises.find(e => e.name === 'Treadmill Run');

    // 2. Seed Demo User
    const demoEmail = 'demo@workouttracker.com';
    console.log(`Checking for demo user (${demoEmail})...`);
    await User.deleteMany({ email: demoEmail });
    
    const demoUser = new User({
      name: 'Showcase Demo User',
      email: demoEmail,
      password: 'password123', // will be hashed in pre-save middleware
    });
    await demoUser.save();
    console.log('Created Demo User.');

    // 3. Create a Program for Demo User (PPL Split + Cardio/Core Day)
    console.log('Creating standard program...');
    await Program.deleteMany({ creator: demoUser._id });

    const demoProgram = new Program({
      title: 'Hypertrophy & Cardio Split',
      description: 'A 4-day PPL & Cardio split designed for muscle growth and cardiovascular endurance.',
      creator: demoUser._id,
      days: [
        {
          dayLabel: 'Day 1: Push Day',
          exercises: [
            {
              exercise: benchPress._id,
              sets: [{ reps: 8, weight: 60 }, { reps: 8, weight: 60 }, { reps: 8, weight: 60 }]
            },
            {
              exercise: inclinePress._id,
              sets: [{ reps: 10, weight: 22 }, { reps: 10, weight: 22 }, { reps: 10, weight: 22 }]
            },
            {
              exercise: lateralRaise._id,
              sets: [{ reps: 12, weight: 10 }, { reps: 12, weight: 10 }, { reps: 12, weight: 10 }]
            },
            {
              exercise: tricepPushdown._id,
              sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }]
            }
          ]
        },
        {
          dayLabel: 'Day 2: Pull Day',
          exercises: [
            {
              exercise: deadlift._id,
              sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }, { reps: 5, weight: 100 }]
            },
            {
              exercise: pullup._id,
              sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 6, weight: 0 }]
            },
            {
              exercise: latPulldown._id,
              sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 10, weight: 50 }]
            },
            {
              exercise: bicepCurl._id,
              sets: [{ reps: 12, weight: 14 }, { reps: 12, weight: 14 }, { reps: 12, weight: 14 }]
            }
          ]
        },
        {
          dayLabel: 'Day 3: Legs & Core',
          exercises: [
            {
              exercise: squat._id,
              sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }, { reps: 8, weight: 80 }]
            },
            {
              exercise: legPress._id,
              sets: [{ reps: 10, weight: 140 }, { reps: 10, weight: 140 }, { reps: 10, weight: 140 }]
            },
            {
              exercise: plank._id,
              sets: [{ reps: 1, weight: 0, duration: 60 }, { reps: 1, weight: 0, duration: 60 }]
            }
          ]
        },
        {
          dayLabel: 'Day 4: Cardio Active Recovery',
          exercises: [
            {
              exercise: run._id,
              sets: [{ reps: 0, weight: 0, duration: 1800, distance: 5.0 }] // 30 min run, 5km
            }
          ]
        }
      ]
    });
    await demoProgram.save();
    console.log('Saved demo program.');

    // 4. Generate 1 Year of Workouts (150 workouts)
    console.log('Generating 1 year of historical workouts...');
    await Workout.deleteMany({ user: demoUser._id });

    const workouts = [];
    const now = new Date();
    const daysToGenerate = 365;
    
    // We want roughly 3 workouts per week, e.g., every 2.3 days.
    // We will cycle through the days of the program.
    let programDayIndex = 0;
    
    for (let i = daysToGenerate; i >= 0; i--) {
      // Determine date of workout
      const workoutDate = new Date(now);
      workoutDate.setDate(now.getDate() - i);
      
      // Let's decide if the user worked out on this date.
      // We will work out on average every Tuesday, Thursday, and Saturday
      const dayOfWeek = workoutDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const shouldWorkout = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
      
      if (!shouldWorkout) continue;

      // Progressive overload scaling factor: starts at 0.75, ends at 1.05 over 1 year
      const progressRatio = 0.75 + (0.3 * (daysToGenerate - i) / daysToGenerate);
      
      // Select which program day
      const currentDay = demoProgram.days[programDayIndex];
      programDayIndex = (programDayIndex + 1) % demoProgram.days.length;

      // Setup workout start/end times
      const startedAt = new Date(workoutDate);
      startedAt.setHours(17, 0, 0); // 5 PM
      const completedAt = new Date(startedAt);
      completedAt.setMinutes(startedAt.getMinutes() + 45 + Math.floor(Math.random() * 20)); // 45-65 mins

      const loggedExercises = currentDay.exercises.map(progEx => {
        const matchingEx = insertedExercises.find(e => e._id.toString() === progEx.exercise.toString());
        
        const loggedSets = progEx.sets.map(set => {
          // Adjust sets based on progressRatio
          let weight = 0;
          let reps = set.reps;
          let duration = set.duration;
          let distance = set.distance;
          let rpe = 7 + Math.floor(Math.random() * 3); // RPE 7-9

          if (matchingEx.category === 'Strength') {
            // Apply progressRatio to weight, round to nearest 2.5kg/5lbs
            weight = Math.round((set.weight * progressRatio) / 2.5) * 2.5;
            // Introduce slight reps variance
            reps = set.reps + (Math.random() > 0.8 ? 1 : Math.random() > 0.8 ? -1 : 0);
          } else if (matchingEx.category === 'Bodyweight') {
            // Reps increase over time
            reps = Math.round(set.reps * progressRatio);
            if (set.duration) {
              duration = Math.round(set.duration * progressRatio);
            }
          } else if (matchingEx.category === 'Cardio') {
            // Cardio improves duration/distance slightly
            duration = Math.round(set.duration * progressRatio);
            distance = Number((set.distance * progressRatio).toFixed(2));
          }

          return {
            reps,
            weight,
            duration,
            distance,
            rpe,
            completed: true
          };
        });

        return {
          exercise: progEx.exercise,
          sets: loggedSets
        };
      });

      const workoutLog = new Workout({
        user: demoUser._id,
        program: demoProgram._id,
        dayLabel: currentDay.dayLabel,
        startedAt,
        completedAt,
        exercises: loggedExercises,
        notes: `Feeling ${['great', 'strong', 'good', 'a bit tired but pushed through', 'energized'][Math.floor(Math.random() * 5)]}.`
      });

      workouts.push(workoutLog);
    }

    console.log(`Saving ${workouts.length} workouts to database...`);
    // Insert in batches to avoid mongo command size limit
    const batchSize = 50;
    for (let start = 0; start < workouts.length; start += batchSize) {
      const batch = workouts.slice(start, start + batchSize);
      await Workout.insertMany(batch);
    }
    console.log('Workout history successfully seeded!');

    await mongoose.connection.close();
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
