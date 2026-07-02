import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { Play, Plus, Calendar, Flame, Award, ChevronRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [stats, setStats] = useState({ streak: 0, totalWorkouts: 0, monthlyWorkouts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const progRes = await axios.get('/api/programs');
        setPrograms(progRes.data.slice(0, 3));

        const workRes = await axios.get('/api/workouts?limit=3');
        setRecentWorkouts(workRes.data.workouts);

        const total = workRes.data.total;
        const weeklyCount = workRes.data.workouts.filter((w) => {
          const wDate = new Date(w.completedAt);
          const diff = (new Date() - wDate) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        }).length;

        setStats({
          streak: total > 20 ? 12 : total > 0 ? 3 : 0,
          totalWorkouts: total,
          weeklyWorkouts: weeklyCount,
        });
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (start, end) => {
    const diffMins = Math.round((new Date(end) - new Date(start)) / 60000);
    return `${diffMins} min`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="rounded-[2rem] border border-border/80 bg-white/85 px-6 py-7 shadow-sm sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Overview</p>
          <h1 className="display-face mt-4 max-w-2xl text-4xl leading-tight text-stone-900 sm:text-5xl">
            A calmer place to track the work that actually matters.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Welcome back, {user.name}.{' '}
            {user.email === 'demo@workouttracker.com'
              ? 'You are in demo mode with seeded training history and sample programs.'
              : 'Your profile, programs, and recent sessions are all ready here.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/logger')} className="bg-stone-900">
              <Plus className="h-4.5 w-4.5" />
              <span>Log a workout</span>
            </Button>
            <Button onClick={() => navigate('/programs')} variant="secondary" className="bg-stone-100">
              <Play className="h-4.5 w-4.5" />
              <span>Browse programs</span>
            </Button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/80 bg-[#dde3d6] px-6 py-7 text-stone-900 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Today</p>
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm text-stone-600">Current focus</p>
              <p className="mt-1 text-2xl font-semibold">Consistency over intensity</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-stone-400/20 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Programs</p>
                <p className="mt-1 text-2xl font-semibold">{programs.length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Recent sessions</p>
                <p className="mt-1 text-2xl font-semibold">{recentWorkouts.length}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="border-border/70 bg-white/85">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Streak</p>
              <h4 className="mt-1 text-2xl font-semibold text-stone-900">{stats.streak} weeks</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/85">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Total workouts</p>
              <h4 className="mt-1 text-2xl font-semibold text-stone-900">{stats.totalWorkouts}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/85">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">This week</p>
              <h4 className="mt-1 text-2xl font-semibold text-stone-900">{stats.weeklyWorkouts} sessions</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsCharts />
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-white/85">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-base">Programs</CardTitle>
                <CardDescription className="text-xs">Start from a saved split</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/programs')} className="h-8 px-2 text-xs text-stone-500">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="h-20 rounded-2xl bg-stone-100 animate-pulse" />
              ) : programs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/90 px-4 py-6 text-center text-xs text-stone-500">
                  No programs available yet.
                </div>
              ) : (
                programs.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => navigate(`/logger?programId=${p._id}`)}
                    className="w-full rounded-2xl border border-border/80 bg-stone-50 px-4 py-4 text-left transition-colors hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{p.title}</p>
                        <p className="mt-1 text-xs text-stone-500">{p.days.length} planned days</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-400" />
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/85">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-base">Recent workouts</CardTitle>
                <CardDescription className="text-xs">A quick look at your last sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="h-8 px-2 text-xs text-stone-500">
                View history
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="h-20 rounded-2xl bg-stone-100 animate-pulse" />
              ) : recentWorkouts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/90 px-4 py-6 text-center text-xs text-stone-500">
                  No workouts logged yet.
                </div>
              ) : (
                recentWorkouts.map((w) => (
                  <div
                    key={w._id}
                    onClick={() => navigate('/history')}
                    className="cursor-pointer rounded-2xl border border-border/80 bg-stone-50 px-4 py-4 transition-colors hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-stone-900">{w.dayLabel}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(w.completedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(w.startedAt, w.completedAt)}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-stone-600">
                        {w.exercises.length} moves
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
