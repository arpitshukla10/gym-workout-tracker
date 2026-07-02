import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { BarChart3, Activity, CalendarDays, Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border/90 bg-white px-4 py-3 shadow-sm">
        <p className="mb-1 text-xs font-semibold text-stone-500">{label}</p>
        <p className="text-sm font-semibold text-stone-900">Volume: {payload[0].value.toLocaleString()} kg</p>
        {payload[1] && <p className="mt-1 text-sm text-stone-600">Workouts: {payload[1].value}</p>}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts() {
  const [timeframe, setTimeframe] = useState('weekly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalVolume: 0, totalWorkouts: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/analytics/${timeframe}`);
        setData(res.data);

        let vol = 0;
        let count = 0;
        res.data.forEach((item) => {
          vol += item.volume;
          count += item.count;
        });
        setStats({ totalVolume: vol, totalWorkouts: count });
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  return (
    <Card className="w-full border-border/80 bg-white/85">
      <CardHeader className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <BarChart3 className="h-5 w-5 text-stone-700" />
            <span>Training analytics</span>
          </CardTitle>
          <CardDescription>Simple trend lines for volume and training frequency.</CardDescription>
        </div>

        <div className="flex rounded-full border border-border/80 bg-stone-100 p-1 self-start sm:self-center">
          {['weekly', 'monthly', 'yearly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                timeframe === tf ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-[1.4rem] border border-border/80 bg-stone-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Total volume</p>
              <h4 className="mt-1 text-2xl font-semibold text-stone-900">
                {stats.totalVolume.toLocaleString()} <span className="text-sm font-medium text-stone-500">kg</span>
              </h4>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-stone-700">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.4rem] border border-border/80 bg-stone-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Workouts completed</p>
              <h4 className="mt-1 text-2xl font-semibold text-stone-900">{stats.totalWorkouts}</h4>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-stone-700">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-80 flex-col items-center justify-center gap-2 text-stone-500">
            <Loader2 className="h-8 w-8 animate-spin text-stone-700" />
            <p className="text-sm">Loading analytics...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-stone-50 text-sm text-stone-500">
            No workout data recorded in this timeframe yet.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="h-64 w-full sm:h-80">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Volume trend</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a433b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4a433b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dfd3" vertical={false} />
                  <XAxis dataKey="label" stroke="#8b7d6b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b7d6b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="volume" stroke="#4a433b" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-48 w-full sm:h-60">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Workout frequency</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dfd3" vertical={false} />
                  <XAxis dataKey="label" stroke="#8b7d6b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b7d6b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8f9a7c" radius={[8, 8, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
