import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Dumbbell, Plus, Trash2, Edit2, Play, Save, ChevronRight, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProgramCreator() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);

  // Designer Mode State
  const [isDesigning, setIsDesigning] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState([]); // array of { dayLabel, exercises: [{ exerciseId, sets: [{ reps, weight, duration, distance }] }] }

  // Exercise Search Modal State
  const [isExSearchOpen, setIsExSearchOpen] = useState(false);
  const [targetDayIndex, setTargetDayIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/programs');
      setPrograms(res.data);
    } catch (err) {
      console.error('Error fetching programs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await axios.get('/api/exercises');
      setExercises(res.data);
    } catch (err) {
      console.error('Error fetching exercises', err);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchExercises();
  }, []);

  const handleStartDesignNew = () => {
    setTitle('');
    setDescription('');
    setDays([{ dayLabel: 'Day 1: Push', exercises: [] }]);
    setEditingProgramId(null);
    setIsDesigning(true);
  };

  const handleEditProgram = (prog) => {
    setTitle(prog.title);
    setDescription(prog.description || '');
    
    // Map database program schema back to designer state
    const mappedDays = prog.days.map(d => ({
      dayLabel: d.dayLabel,
      exercises: d.exercises.map(e => ({
        exerciseId: e.exercise._id || e.exercise, // populated or ID
        sets: e.sets.map(s => ({
          reps: s.reps,
          weight: s.weight,
          duration: s.duration,
          distance: s.distance
        }))
      }))
    }));
    
    setDays(mappedDays);
    setEditingProgramId(prog._id);
    setIsDesigning(true);
  };

  const handleDeleteProgram = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this program template? This will not affect your completed workout logs.')) return;
    try {
      await axios.delete(`/api/programs/${id}`);
      fetchPrograms();
    } catch (err) {
      console.error('Error deleting program', err);
    }
  };

  // Designer actions
  const handleAddDay = () => {
    setDays([...days, { dayLabel: `Day ${days.length + 1}`, exercises: [] }]);
  };

  const handleRemoveDay = (dayIdx) => {
    setDays(days.filter((_, idx) => idx !== dayIdx));
  };

  const handleDayLabelChange = (dayIdx, label) => {
    const updated = [...days];
    updated[dayIdx].dayLabel = label;
    setDays(updated);
  };

  const handleOpenExerciseSearch = (dayIdx) => {
    setTargetDayIndex(dayIdx);
    setSearchTerm('');
    setIsExSearchOpen(true);
  };

  const handleAddExerciseToDay = (ex) => {
    const updated = [...days];
    // Default: 3 sets
    const defaultSet = ex.category === 'Cardio' 
      ? { reps: 0, weight: 0, duration: 1200, distance: 0 } // 20 mins
      : { reps: 10, weight: 20, duration: 0, distance: 0 }; // 10 reps, 20kg

    updated[targetDayIndex].exercises.push({
      exerciseId: ex._id,
      sets: [ { ...defaultSet }, { ...defaultSet }, { ...defaultSet } ]
    });
    setDays(updated);
    setIsExSearchOpen(false);
  };

  const handleRemoveExerciseFromDay = (dayIdx, exIdx) => {
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const handleAddSetToExercise = (dayIdx, exIdx) => {
    const updated = [...days];
    const targetEx = updated[dayIdx].exercises[exIdx];
    const category = exercises.find(e => e._id === targetEx.exerciseId)?.category;
    
    const newSet = category === 'Cardio'
      ? { reps: 0, weight: 0, duration: 600, distance: 0 }
      : { reps: 8, weight: 20, duration: 0, distance: 0 };

    targetEx.sets.push(newSet);
    setDays(updated);
  };

  const handleRemoveSetFromExercise = (dayIdx, exIdx, setIdx) => {
    const updated = [...days];
    updated[dayIdx].exercises[exIdx].sets.splice(setIdx, 1);
    setDays(updated);
  };

  const handleSetFieldChange = (dayIdx, exIdx, setIdx, field, val) => {
    const updated = [...days];
    updated[dayIdx].exercises[exIdx].sets[setIdx][field] = Number(val);
    setDays(updated);
  };

  const handleSaveProgram = async () => {
    if (!title) {
      alert('Program title is required!');
      return;
    }

    const payload = {
      title,
      description,
      // Map to correct backend API schema
      days: days.map(d => ({
        dayLabel: d.dayLabel,
        exercises: d.exercises.map(e => ({
          exercise: e.exerciseId,
          sets: e.sets
        }))
      }))
    };

    try {
      if (editingProgramId) {
        await axios.put(`/api/programs/${editingProgramId}`, payload);
      } else {
        await axios.post('/api/programs', payload);
      }
      setIsDesigning(false);
      fetchPrograms();
    } catch (err) {
      console.error('Error saving program', err);
    }
  };

  const getExerciseName = (id) => {
    return exercises.find(e => e._id === id)?.name || 'Loading exercise...';
  };

  const getExerciseCategory = (id) => {
    return exercises.find(e => e._id === id)?.category || 'Strength';
  };

  // Search filter
  const filteredSearchExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDesigning) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span>{editingProgramId ? 'Edit Program Template' : 'Design Custom Program'}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Build template splits (e.g. PPL, Upper/Lower) with targets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsDesigning(false)}>Cancel</Button>
            <Button onClick={handleSaveProgram}>
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/30 p-4 rounded-xl border border-border/40">
          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Program Title</label>
            <Input 
              placeholder="e.g. Push/Pull/Legs Split" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
            <Input 
              placeholder="e.g. 4-day intermediate hypertrophy routine" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </div>

        {/* Days Split builder */}
        <div className="space-y-6">
          {days.map((day, dayIdx) => (
            <Card key={dayIdx} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-950/20">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <Input 
                    value={day.dayLabel} 
                    onChange={(e) => handleDayLabelChange(dayIdx, e.target.value)} 
                    className="font-bold text-white bg-slate-900 border-none px-2 h-8 text-sm focus-visible:ring-1 focus-visible:ring-primary w-64"
                    placeholder="Day Name (e.g. Upper A)"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveDay(dayIdx)}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {day.exercises.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/40 rounded-lg text-xs text-muted-foreground">
                    No exercises added to this day split yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.exercises.map((ex, exIdx) => {
                      const category = getExerciseCategory(ex.exerciseId);
                      const isCardio = category === 'Cardio';

                      return (
                        <div key={exIdx} className="p-3.5 bg-slate-950/40 border border-border/40 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">
                              {exIdx + 1}. {getExerciseName(ex.exerciseId)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                              className="text-muted-foreground hover:text-red-500 h-6 px-1.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Sets Target Table */}
                          <div className="overflow-x-auto rounded-lg border border-border/30">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-border/40 bg-slate-950/45 text-[10px] uppercase font-bold text-muted-foreground">
                                  <th className="px-3 py-1.5 text-center w-12">Set</th>
                                  {isCardio ? (
                                    <>
                                      <th className="px-3 py-1.5">Duration (mins)</th>
                                      <th className="px-3 py-1.5">Distance (km)</th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="px-3 py-1.5 w-24">Weight (kg)</th>
                                      <th className="px-3 py-1.5 w-24">Reps</th>
                                    </>
                                  )}
                                  <th className="px-3 py-1.5 text-right w-16">Remove</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ex.sets.map((set, setIdx) => (
                                  <tr key={setIdx} className="border-b border-border/10">
                                    <td className="px-3 py-1.5 text-center text-muted-foreground font-semibold">{setIdx + 1}</td>
                                    {isCardio ? (
                                      <>
                                        <td className="px-3 py-1.5">
                                          <Input 
                                            type="number" 
                                            value={Math.round(set.duration / 60)} 
                                            onChange={(e) => handleSetFieldChange(dayIdx, exIdx, setIdx, 'duration', e.target.value * 60)}
                                            className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                          />
                                        </td>
                                        <td className="px-3 py-1.5">
                                          <Input 
                                            type="number" 
                                            value={set.distance} 
                                            onChange={(e) => handleSetFieldChange(dayIdx, exIdx, setIdx, 'distance', e.target.value)}
                                            className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                            step="0.1"
                                          />
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="px-3 py-1.5">
                                          <Input 
                                            type="number" 
                                            value={set.weight} 
                                            onChange={(e) => handleSetFieldChange(dayIdx, exIdx, setIdx, 'weight', e.target.value)}
                                            className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                          />
                                        </td>
                                        <td className="px-3 py-1.5">
                                          <Input 
                                            type="number" 
                                            value={set.reps} 
                                            onChange={(e) => handleSetFieldChange(dayIdx, exIdx, setIdx, 'reps', e.target.value)}
                                            className="h-7 w-20 bg-slate-950 border-border/60 text-xs px-2"
                                          />
                                        </td>
                                      </>
                                    )}
                                    <td className="px-3 py-1.5 text-right">
                                      <Button 
                                        variant="ghost" 
                                        onClick={() => handleRemoveSetFromExercise(dayIdx, exIdx, setIdx)}
                                        disabled={ex.sets.length === 1}
                                        className="h-5 px-1 text-muted-foreground hover:text-red-500 rounded"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleAddSetToExercise(dayIdx, exIdx)}
                            className="text-xs h-7 py-1 px-2.5"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Set</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-950/10 border-t border-border/20 pt-4 flex justify-start">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenExerciseSearch(dayIdx)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Exercise</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Button variant="secondary" onClick={handleAddDay} className="w-full border-dashed border-border py-4">
          <Plus className="h-4 w-4" />
          <span>Add Custom Training Day</span>
        </Button>

        {/* Exercise Selector Modal */}
        <Dialog isOpen={isExSearchOpen} onClose={() => setIsExSearchOpen(false)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Add Exercise to Day</h3>
              <p className="text-xs text-muted-foreground">Select an exercise from the database</p>
            </div>
            
            <Input 
              placeholder="Search moves..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />

            <div className="max-h-72 overflow-y-auto border border-border/40 rounded-lg bg-slate-950/20 divide-y divide-border/20">
              {filteredSearchExercises.map(ex => (
                <button
                  key={ex._id}
                  onClick={() => handleAddExerciseToDay(ex)}
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
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span>Workout Programs</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build and manage templates for your weekly gym routine
          </p>
        </div>
        <Button onClick={handleStartDesignNew} className="self-start sm:self-center">
          <Plus className="h-4 w-4" />
          <span>Create Program Template</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-950/40 rounded-xl border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No workout programs created yet.</p>
          <Button onClick={handleStartDesignNew}>Create Your First Program</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {programs.map((prog) => (
            <Card key={prog._id} className="border-border/60 hover:border-primary/30 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">{prog.title}</CardTitle>
                <CardDescription className="line-clamp-2">{prog.description || 'No description provided.'}</CardDescription>
              </CardHeader>

              <CardContent className="py-2 flex-grow space-y-3">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Training Split</span>
                <div className="flex flex-wrap gap-1.5">
                  {prog.days.map((d, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-semibold px-2.5 py-1 rounded bg-slate-950/80 border border-border text-slate-300"
                    >
                      {d.dayLabel}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/20 pt-4 flex justify-between bg-slate-950/10">
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEditProgram(prog)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => handleDeleteProgram(prog._id, e)}
                    className="h-8 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Active Player Link */}
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/logger?programId=${prog._id}`)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start program</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
