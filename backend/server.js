import dns from 'dns'
dns.setServers(['1.1.1.1', '8.8.8.8']);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import exercisesRoutes from './routes/exercises.js';
import programsRoutes from './routes/programs.js';
import workoutsRoutes from './routes/workouts.js';
import analyticsRoutes from './routes/analytics.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Gym Workout Tracker API is running.');
});

// Error handling middleware (fallback)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
