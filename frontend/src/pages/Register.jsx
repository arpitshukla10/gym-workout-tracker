import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dumbbell, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, error, setError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      return setLocalError('Passwords do not match');
    }

    if (password.length < 6) {
      return setLocalError('Password must be at least 6 characters');
    }

    setSubmitting(true);
    const success = await register(name, email, password);
    setSubmitting(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center">
          <Card className="w-full border-border/80 bg-white/90">
            <form onSubmit={handleSubmit}>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Create account</CardTitle>
                <CardDescription>Set up your profile and start tracking your sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(error || localError) && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{localError || error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Full name
                  </label>
                  <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Email
                  </label>
                  <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Confirm
                    </label>
                    <Input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button type="submit" disabled={submitting} className="w-full justify-center bg-stone-900">
                  {submitting ? 'Creating account...' : 'Create account'}
                  <UserPlus className="h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <section className="rounded-[2rem] border border-border/80 bg-[#f0ebe0] px-7 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-stone-50">
            <Dumbbell className="h-5 w-5" />
          </div>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Start clean</p>
          <h1 className="display-face mt-4 max-w-lg text-4xl leading-tight text-stone-900 sm:text-5xl">
            A steady system beats a loud interface.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
            Build your training splits, log workouts as you go, and keep a clear record of progress without clutter.
          </p>
          <div className="mt-10 space-y-3">
            <div className="rounded-[1.5rem] bg-white/75 px-4 py-4 text-sm text-stone-700">
              Save reusable programs for repeatable weeks.
            </div>
            <div className="rounded-[1.5rem] bg-white/75 px-4 py-4 text-sm text-stone-700">
              Track recent sessions and long-term volume in one place.
            </div>
            <div className="rounded-[1.5rem] bg-white/75 px-4 py-4 text-sm text-stone-700">
              Keep the interface simple enough to use at the gym.
            </div>
          </div>
        </section>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-stone-900 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
