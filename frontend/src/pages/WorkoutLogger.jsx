import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Select } from '../components/ui/Select';
import { Play, Check, Plus, Trash2, Clock, Dumbbell, AlertTriangle, AlertCircle, X, ChevronRight } from 'lucide-react';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('programId');

  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [dayLabel, setDayLabel] = useState('Empty Session');
  
  // Active session data
  const [activeExercises, setActiveExercises] = useState([]); // [{ exercise: { _id, name, category }, sets: [{ weight, reps, duration, distance, rpe, completed }] }]
  const [notes, setNotes] = useState('');
  
  // Timer state
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Exercise Search Modal
  const [exercisesList, setExercisesList] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [targetRest, setTargetRest] = useState(90); // default 90s
  const restIntervalRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all exercises for searches
        const exRes = await axios.get('/api/exercises');
        setExercisesList(exRes.data);

        if (programId) {
          const progRes = await axios.get(`/api/programs/${programId}`);
          setProgram(progRes.data);
          
          // Select first day by default
          if (progRes.data.days && progRes.data.days.length > 0) {
            loadDayTemplate(progRes.data.days[0], exRes.data);
          }
        } else {
          setDayLabel('Ad-Hoc Workout');
          setActiveExercises([]);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [programId]);

  // Handle active session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((new Date() - startTime) / 1000);
      setElapsedTime(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Handle rest timer countdown
  useEffect(() => {
    if (isResting && restSeconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
      clearInterval(restIntervalRef.current);
    }

    return () => clearInterval(restIntervalRef.current);
  }, [isResting, restSeconds]);

  const loadDayTemplate = (dayTemplate, allExs) => {
    setDayLabel(dayTemplate.dayLabel);
    
    const mapped = dayTemplate.exercises.map(item => {
      // Find full exercise object from fetched list
      const matchedEx = allExs.find(ex => ex._id === (item.exercise?._id || item.exercise));
      return {
        exercise: matchedEx || { _id: item.exercise, name: 'Loading move...', category: 'Strength' },
        sets: item.sets.map(s => ({
          weight: s.weight || 0,
          reps: s.reps || 0,
          duration: s.duration || 0,
          distance: s.distance || 0,
          rpe: '',
          completed: false
        }))
      };
    });
    
    setActiveExercises(mapped);
  };

  const handleTemplateDayChange = (e) => {
    const idx = Number(e.target.value);
    setSelectedDayIdx(idx);
    loadDayTemplate(program.days[idx], exercisesList);
  };

  const startRestTimer = (seconds = 90) => {
    clearInterval(restIntervalRef.current);
    setTargetRest(seconds);
    setRestSeconds(seconds);
    setIsResting(true);
  };

  const handleToggleSetComplete = (exIdx, setIdx) => {
    const updated = [...activeExercises];
    const targetSet = updated[exIdx].sets[setIdx];
    const wasCompleted = targetSet.completed;
    
    targetSet.completed = !wasCompleted;
    setActiveExercises(updated);

    // If marked completed, start rest timer
    if (!wasCompleted) {
      startRestTimer(90);
    }
  };

  const handleSetFieldChange = (exIdx, setIdx, field, val) => {
    const updated = [...activeExercises];
    updated[exIdx].sets[setIdx][field] = Number(val);
    setActiveExercises(updated);
  };

  const handleSetRpeChange = (exIdx, setIdx, val) => {
    const updated = [...activeExercises];
    updated[exIdx].sets[setIdx].rpe = val;
    setActiveExercises(updated);
  };

  const handleAddSet = (exIdx) => {
    const updated = [...activeExercises];
    const targetEx = updated[exIdx];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || { weight: 20, reps: 10, duration: 0, distance: 0 };
    
    targetEx.sets.push({
      ...lastSet,
      rpe: '',
      completed: false
    });
    setActiveExercises(updated);
  };

  const handleRemoveSet = (exIdx, setIdx) => {
    const updated = [...activeExercises];
    updated[exIdx].sets.splice(setIdx, 1);
    setActiveExercises(updated);
  };

  const handleRemoveExercise = (exIdx) => {
    if (!window.confirm('Remove this exercise from active session?')) return;
    setActiveExercises(activeExercises.filter((_, idx) => idx !== exIdx));
  };

  const handleAddExerciseToActive = (ex) => {
    const defaultSet = ex.category === 'Cardio'
      ? { weight: 0, reps: 0, duration: 1200, distance: 0, rpe: '', completed: false }
      : { weight: 20, reps: 10, duration: 0, distance: 0, rpe: '', completed: false };

    setActiveExercises([
      ...activeExercises,
      {
        exercise: ex,
        sets: [ { ...defaultSet }, { ...defaultSet }, { ...defaultSet } ]
      }
    ]);
    setIsSearchOpen(false);
  };

  const handleFinishWorkout = async () => {
    // Basic validations
    if (activeExercises.length === 0) {
      alert('Please add at least one exercise to complete.');
      return;
    }

    // Convert data to backend schema
    const payload = {
      program: programId || null,
      dayLabel,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      notes,
      exercises: activeExercises.map(item => ({
        exercise: item.exercise._id,
        sets: item.sets.map(s => ({
          reps: s.reps,
          weight: s.weight,
          duration: s.duration,
          distance: s.distance,
          rpe: s.rpe ? Number(s.rpe) : null,
          completed: s.completed
        }))
      }))
    };

    try {
      await axios.post('/api/workouts', payload);
      navigate('/history');
    } catch (err) {
      console.error('Error saving workout', err);
      alert('Failed to save workout session. Please make sure all set fields are filled out correctly.');
    }
  };

  // Format Elapsed Time
  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Search filter
  const filteredSearchExercises = exercisesList.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Input
              value={dayLabel}
              onChange={(e) => setDayLabel(e.target.value)}
              className="font-bold text-white bg-transparent border-none text-2xl h-8 px-0 w-80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/20"
              placeholder="Workout Session Name"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-0.5">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-mono text-sm tracking-wide bg-slate-950 px-2 py-0.5 rounded border border-border/40">
              {formatTime(elapsedTime)}
            </span>
            <span>Elapsed time</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
          <Button onClick={handleFinishWorkout} className="shadow-lg shadow-primary/20">
            <Check className="h-4 w-4" />
            <span>Finish Workout</span>
          </Button>
        </div>
      </div>

      {/* Program Split Selector if using template */}
      {program && (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-border/40 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Template Day Split</span>
          <Select
            value={selectedDayIdx}
            onChange={handleTemplateDayChange}
            options={program.days.map((d, idx) => ({ label: d.dayLabel, value: idx }))}
            className="max-w-xs bg-slate-900"
          />
        </div>
      )}

      {/* Exercises logs */}
      <div className="space-y-6">
        {activeExercises.map((item, exIdx) => {
          const isCardio = item.exercise.category === 'Cardio';

          return (
            <Card key={exIdx} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-950/20">
                <div>
                  <CardTitle className="text-base text-white">{item.exercise.name}</CardTitle>
                  <CardDescription className="text-xs">{item.exercise.category} • {item.exercise.targetMuscleGroup}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="overflow-x-auto rounded-lg border border-border/30 bg-slate-950/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-slate-950/45 text-[10px] uppercase font-bold text-muted-foreground">
                        <th className="px-3 py-2 w-12 text-center">Set</th>
                        {isCardio ? (
                          <>
                            <th className="px-3 py-2">Duration (mins)</th>
                            <th className="px-3 py-2">Distance (km)</th>
                          </>
                        ) : (
                          <>
                            <th className="px-3 py-2 w-24">Weight (kg)</th>
                            <th className="px-3 py-2 w-24">Reps</th>
                          </>
                        )}
                        <th className="px-3 py-2 w-16 text-center">RPE</th>
                        <th className="px-3 py-2 w-16 text-center">Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.sets.map((set, setIdx) => (
                        <tr 
                          key={setIdx} 
                          className={`border-b border-border/10 transition-colors ${
                            set.completed ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="px-3 py-2 text-center text-muted-foreground font-semibold">{setIdx + 1}</td>
                          {isCardio ? (
                            <>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={Math.round(set.duration / 60)}
                                  onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'duration', e.target.value * 60)}
                                  disabled={set.completed}
                                  className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={set.distance}
                                  onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'distance', e.target.value)}
                                  disabled={set.completed}
                                  className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                  step="0.1"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'weight', e.target.value)}
                                  disabled={set.completed}
                                  className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'reps', e.target.value)}
                                  disabled={set.completed}
                                  className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                />
                              </td>
                            </>
                          )}
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={set.rpe}
                              onChange={(e) => handleSetRpeChange(exIdx, setIdx, e.target.value)}
                              disabled={set.completed}
                              placeholder="RPE"
                              className="h-7 w-14 bg-slate-950 border-border/60 text-xs text-center px-1"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              className={`h-5 w-5 rounded border flex items-center justify-center mx-auto transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'border-border/80 hover:border-emerald-500/50 bg-slate-950'
                              }`}
                            >
                              {set.completed && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSet(exIdx)}
                    className="text-xs h-7 px-2.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Set</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={item.sets.length === 1}
                    onClick={() => handleRemoveSet(exIdx, item.sets.length - 1)}
                    className="text-xs text-muted-foreground hover:text-red-500 h-7 px-2.5"
                  >
                    Remove Last Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add workout Notes and Add Exercise on Fly */}
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => setIsSearchOpen(true)} className="w-full border-dashed border-border py-4 bg-slate-950/20">
          <Plus className="h-4 w-4" />
          <span>Add Custom/Standard Exercise to Workout</span>
        </Button>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Session Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 rounded-md border border-border bg-slate-950/45 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none placeholder:text-muted-foreground"
              placeholder="e.g. Felt strong on Squats, lower back a bit tight during deadlifts."
            />
          </CardContent>
        </Card>
      </div>

      {/* Search exercises overlay modal */}
      <Dialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Add Exercise to Active Session</h3>
            <p className="text-xs text-muted-foreground">Select an exercise to add immediately</p>
          </div>

          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="max-h-72 overflow-y-auto border border-border/40 rounded-lg bg-slate-950/20 divide-y divide-border/20">
            {filteredSearchExercises.map(ex => (
              <button
                key={ex._id}
                onClick={() => handleAddExerciseToActive(ex)}
                className="w-full text-left px-4 py-2.5 text-xs text-muted-foreground hover:text-white hover:bg-slate-800/50 flex items-center justify-between transition-all"
              >
                <span className="font-semibold">{ex.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border">{ex.category}</span>
              </button>
            ))}
            {filteredSearchExercises.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">No matches found.</div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Rest Timer overlay alert */}
      {isResting && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-primary/20 bg-slate-900 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300 w-80">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rest Timer</p>
            <h5 className="text-xl font-bold text-white font-mono mt-0.5">
              {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
            </h5>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => startRestTimer(restSeconds + 30)}
              className="text-[10px] h-6 py-0.5 px-2 font-semibold"
            >
              +30s
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsResting(false)}
              className="text-[10px] h-6 py-0.5 px-2 text-muted-foreground hover:text-white"
            >
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
