import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dumbbell, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      navigate('/');
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    const success = await login('demo@workouttracker.com', 'password123');
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-border/80 bg-[#e0e5db] px-7 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-stone-50">
            <Dumbbell className="h-5 w-5" />
          </div>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">RepRise</p>
          <h1 className="display-face mt-4 max-w-lg text-4xl leading-tight text-stone-900 sm:text-5xl">
            Training logs without the noise.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
            Keep programs, workout history, and progress charts in one quiet place built for regular gym life.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Focus</p>
              <p className="mt-2 text-sm font-semibold text-stone-900">Programs, logging, analytics</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Mood</p>
              <p className="mt-2 text-sm font-semibold text-stone-900">Minimal, calm, and practical</p>
            </div>
          </div>
        </section>

        <div className="flex items-center">
          <Card className="w-full border-border/80 bg-white/90">
            <form onSubmit={handleSubmit}>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>Use your account or try the seeded demo profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button type="submit" disabled={submitting} className="w-full justify-center bg-stone-900">
                  {submitting ? 'Signing in...' : 'Sign in'}
                  <LogIn className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDemoLogin}
                  disabled={submitting}
                  className="w-full justify-center bg-stone-100"
                >
                  <ShieldAlert className="h-4 w-4 text-stone-700" />
                  <span>Use demo account</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-stone-900 underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  );
}
