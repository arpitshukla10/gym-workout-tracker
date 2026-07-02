# RepRise - MERN Stack Gym Workout Tracker

RepRise is an end-to-end gym workout tracker inspired by **Boostcamp**. It allows users to build training splits (such as Push/Pull/Legs, Upper/Lower, or custom days), track strength and cardio progression, and visualize consistency using weekly, monthly, and yearly analytics charts.

---

## Key Features

1. **Custom Day Splits**: Schedule exercises using standard or custom Day labels. Add notes, reps, weight, or distance/durations for cardio exercises.
2. **Active Workout Player**: Real-time stopwatch tracker, Rest Timer popup notifications when completing a set, and on-the-fly exercise additions.
3. **Training Analytics**: Dynamic Recharts visualizers for Weekly Volume, Monthly Consistency, and Yearly lifting output.
4. **Prepopulated Exercises**: Search from a standard library of ~25 core gym movements, or create custom ones.
5. **Showcase Demo Account**: Automatically seeds a demo profile with **1 year of realistic historical logs** to preview long-term charts instantly.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (minimalistic shadcn style), Recharts, Lucide React, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS.

---

## Getting Started (Local Setup)

### Prerequisites
- Install [Node.js](https://nodejs.org/) (v18 or higher recommended).
- Install and start [MongoDB Local Community Server](https://www.mongodb.com/try/download/community) (defaults to `mongodb://localhost:27017`).

### 1. Database Seeding (Crucial for Showcase)
To pre-populate the database with standard exercises and a demo user with **1 year of historical lifting history**:

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Populate the `.env` file (already created for you):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/gym-tracker
   JWT_SECRET=supersecretgymkey123
   ```
3. Run the seed script:
   ```bash
   npm run seed
   ```
   *This creates the showcase user:*
   * **Email**: `demo@workouttracker.com`
   * **Password**: `password123`
   * **History**: ~150 completed sessions showing linear progressive overload progression.

### 2. Running the Backend
1. In the `backend` folder, start the dev server (automatically runs in watch mode):
   ```bash
   npm run dev
   ```
2. The API will start on `http://localhost:5000`.

### 3. Running the Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.
4. Click **Log In as Demo User** to explore the charts and workout history immediately, or create a brand new account!

---

## Deployment Guide

### Backend Deployment (e.g., Render, Railway, Heroku)
1. Push your backend code to a Git repository.
2. Link the repository to your hosting service (choose Web Service or Node.js environment).
3. Set the build command to `npm install` and start command to `npm start`.
4. Configure environment variables on the host dashboard:
   - `MONGO_URI`: MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret key.
   - `PORT`: Set automatically by hosting platforms.
   - `NODE_ENV`: `production`.

### Frontend Deployment (e.g., Vercel, Netlify)
1. Push your frontend code to a Git repository.
2. Link it to Vercel/Netlify.
3. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set up rewrite rules for Single Page Application (SPA) routing:
   - For **Vercel**, create a `vercel.json` in the frontend root:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - For **Netlify**, create a `_redirects` file in `public/` containing:
     ```text
     /*   /index.html   200
     ```
5. Ensure your API endpoint calls in Axios point to the deployed backend URL instead of localhost (e.g., configure `axios.defaults.baseURL = 'https://your-backend.onrender.com'`).
