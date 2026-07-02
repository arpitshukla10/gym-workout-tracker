import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, Trash2, ChevronDown, ChevronUp, History, Dumbbell, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/workouts?page=${page}&limit=10`);
      setWorkouts(res.data.workouts);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching workout history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workout log?')) return;

    try {
      await axios.delete(`/api/workouts/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Error deleting workout log', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffMins = Math.round((e - s) / 60000);
    return `${diffMins} mins`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          <span>Workout History</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your past workout logs and training progress
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-950/40 rounded-xl border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">You haven't logged any workouts yet.</p>
          <Button onClick={() => window.location.href = '/'}>Start Logging</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => {
            const isExpanded = expandedId === w._id;
            
            // Calculate total exercises & sets
            const exercisesCount = w.exercises.length;
            let totalSets = 0;
            w.exercises.forEach(ex => totalSets += ex.sets.length);

            return (
              <Card 
                key={w._id} 
                className={`border-border/60 hover:border-border cursor-pointer transition-all duration-200 ${
                  isExpanded ? 'ring-1 ring-primary/40 border-primary/20' : ''
                }`}
                onClick={() => toggleExpand(w._id)}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Summary row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base leading-tight">{w.dayLabel}</span>
                        {w.program && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase bg-slate-900/60">
                            Template
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {formatDate(w.completedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          {formatDuration(w.startedAt, w.completedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/20 pt-3 sm:pt-0 sm:border-0">
                      <div className="text-right text-xs font-semibold text-muted-foreground hidden sm:block">
                        <p>{exercisesCount} Exercises</p>
                        <p>{totalSets} Sets Completed</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleDelete(w._id, e)} 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-white rounded-md"
                        >
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-border/20 space-y-4 animate-in fade-in duration-200">
                      {w.notes && (
                        <div className="p-3 bg-slate-950/40 border border-border/40 rounded-lg text-sm italic text-muted-foreground">
                          <span className="font-bold not-italic text-xs block uppercase tracking-wider text-muted-foreground/70 mb-1">Notes</span>
                          "{w.notes}"
                        </div>
                      )}

                      <div className="space-y-4">
                        {w.exercises.map((item, idx) => {
                          const exName = item.exercise?.name || 'Deleted Exercise';
                          const isCardio = item.exercise?.category === 'Cardio';

                          return (
                            <div key={idx} className="space-y-2">
                              <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                                <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                                <span>{exName}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  ({item.exercise?.category})
                                </span>
                              </h4>

                              <div className="overflow-x-auto rounded-lg border border-border/40 bg-slate-950/20">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-border/40 bg-slate-950/45 text-[10px] uppercase font-bold text-muted-foreground">
                                      <th className="px-4 py-2 w-16 text-center">Set</th>
                                      {isCardio ? (
                                        <>
                                          <th className="px-4 py-2">Duration</th>
                                          <th className="px-4 py-2">Distance</th>
                                        </>
                                      ) : (
                                        <>
                                          <th className="px-4 py-2">Weight</th>
                                          <th className="px-4 py-2">Reps</th>
                                        </>
                                      )}
                                      <th className="px-4 py-2 w-20 text-center">RPE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.sets.map((set, setIdx) => (
                                      <tr key={setIdx} className="border-b border-border/10 text-xs">
                                        <td className="px-4 py-2 text-center text-muted-foreground font-semibold">{setIdx + 1}</td>
                                        {isCardio ? (
                                          <>
                                            <td className="px-4 py-2 text-white">
                                              {Math.floor(set.duration / 60)}m {set.duration % 60}s
                                            </td>
                                            <td className="px-4 py-2 text-white">{set.distance ? `${set.distance} km` : '—'}</td>
                                          </>
                                        ) : (
                                          <>
                                            <td className="px-4 py-2 text-white">{set.weight} kg</td>
                                            <td className="px-4 py-2 text-white">{set.reps} reps</td>
                                          </>
                                        )}
                                        <td className="px-4 py-2 text-center text-white">{set.rpe || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(p - 1, 1)); }}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(p + 1, pages)); }}
                disabled={page === pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
