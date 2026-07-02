import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { Search, Plus, Library, Flame, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Strength');
  const [newMuscle, setNewMuscle] = useState('Chest');
  const [modalError, setModalError] = useState('');

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/exercises');
      setExercises(res.data);
    } catch (err) {
      console.error('Error fetching exercises', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newName) return;

    try {
      await axios.post('/api/exercises', {
        name: newName,
        category: newCategory,
        targetMuscleGroup: newMuscle,
      });
      setNewName('');
      setIsOpen(false);
      fetchExercises();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create exercise');
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? ex.category === categoryFilter : true;
    const matchesMuscle = muscleFilter ? ex.targetMuscleGroup === muscleFilter : true;
    return matchesSearch && matchesCategory && matchesMuscle;
  });

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Other'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-face text-4xl text-stone-900 flex items-center gap-3">
            <Library className="h-8 w-8 text-stone-700" />
            <span>Exercise library</span>
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Browse standard movements or save your own custom exercise list.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="self-start sm:self-center bg-stone-900">
          <Plus className="h-4 w-4" />
          <span>Add custom exercise</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-[1.6rem] border border-border/80 bg-white/85 p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="All Categories"
          options={[
            { label: 'All Categories', value: '' },
            { label: 'Strength', value: 'Strength' },
            { label: 'Cardio', value: 'Cardio' },
            { label: 'Bodyweight', value: 'Bodyweight' },
          ]}
        />

        <Select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          placeholder="All Muscle Groups"
          options={[
            { label: 'All Muscle Groups', value: '' },
            ...muscleGroups.map((m) => ({ label: m, value: m })),
          ]}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-[1.4rem] border border-border/70 bg-white/70 animate-pulse" />
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-border bg-white/75 py-16 text-center">
          <p className="text-stone-500">No exercises found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((ex) => (
            <Card key={ex._id} className="border-border/70 bg-white/85">
              <CardContent className="flex h-full flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-stone-900">{ex.name}</h3>
                  {ex.isCustom ? (
                    <span className="rounded-full border border-stone-300 bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase text-stone-700 shrink-0">
                      Custom
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 shrink-0">
                      Standard
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 border-t border-border/70 pt-3 text-xs font-semibold text-stone-600">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-stone-500" />
                    {ex.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                    {ex.targetMuscleGroup}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleCreateExercise} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">Create custom exercise</h3>
            <p className="mt-1 text-xs text-stone-500">Add a movement with a category and target muscle group.</p>
          </div>

          {modalError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Exercise Name</label>
            <Input
              placeholder="e.g. Dumbbell Hammer Curl"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Category</label>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                options={[
                  { label: 'Strength', value: 'Strength' },
                  { label: 'Cardio', value: 'Cardio' },
                  { label: 'Bodyweight', value: 'Bodyweight' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Muscle Group</label>
              <Select
                value={newMuscle}
                onChange={(e) => setNewMuscle(e.target.value)}
                options={muscleGroups.map((m) => ({ label: m, value: m }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-stone-900">Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
