"use client";

import { createContext, createElement, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type RoutineStep = { id: string; label: string; done: boolean };
export type RoutineIconType =
  | "morning" | "night" | "coffee" | "shower" | "skincare" | "meal" | "sleep"
  | "read" | "study" | "focus" | "computer" | "work" | "home" | "clean"
  | "laundry" | "cook" | "shopping" | "exercise" | "stretch" | "walk" | "health"
  | "meditate" | "selfcare" | "journal" | "plan" | "tasks" | "time" | "alarm"
  | "music" | "creative" | "pet" | "family" | "medicine" | "drink" | "bath"
  | "desk" | "strength" | "reading" | "kitchen";
export type Routine = { id: string; name: string; time: string; tone: "rose" | "green" | "sand"; icon: RoutineIconType; steps: RoutineStep[] };
export type WorkoutExercise = { id: string; label: string; reps: string; done: boolean; minutes?: number; met?: number };
export type WorkoutRoutine = { id: string; name: string; focus: string; tone: "rose" | "green" | "sand"; exercises: WorkoutExercise[] };
export type FitnessProfile = { weightKg: number; heightCm: number; dailySteps: number; stepGoal: number; stepsDate: string };

const initialRoutines: Routine[] = [
  { id: "morning", name: "Soft morning", time: "07:00", tone: "green", icon: "morning", steps: [{ id: "water", label: "Drink water", done: true }, { id: "skincare", label: "Skincare", done: true }, { id: "breakfast", label: "Have breakfast", done: false }] },
  { id: "study", name: "Study reset", time: "14:00", tone: "sand", icon: "study", steps: [{ id: "desk", label: "Clear desk", done: true }, { id: "phone", label: "Put phone away", done: false }, { id: "timer", label: "Start focus timer", done: false }] },
  { id: "night", name: "Calm night", time: "21:00", tone: "rose", icon: "night", steps: [{ id: "prepare", label: "Prepare tomorrow", done: false }, { id: "journal", label: "Write in journal", done: false }, { id: "sleep", label: "No screens in bed", done: false }] },
];

const lowerBodyExercises: WorkoutExercise[] = [
  { id: "squats", label: "Squats", reps: "3 × 12", done: true }, { id: "rdl", label: "RDL", reps: "3 × 10", done: true },
  { id: "hip-thrust", label: "Hip thrust", reps: "3 × 10", done: false }, { id: "leg-press", label: "Leg press", reps: "3 × 12", done: false },
  { id: "abductors", label: "Abductors", reps: "3 × 15", done: false },
];

const initialWorkoutRoutines: WorkoutRoutine[] = [
  { id: "lower-body", name: "Lower body", focus: "Glutes & legs", tone: "green", exercises: lowerBodyExercises },
  { id: "upper-body", name: "Upper body", focus: "Back, shoulders & arms", tone: "rose", exercises: [
    { id: "lat-pulldown", label: "Lat pulldown", reps: "3 × 10", done: false }, { id: "shoulder-press", label: "Shoulder press", reps: "3 × 10", done: false }, { id: "rows", label: "Cable rows", reps: "3 × 12", done: false },
  ] },
  { id: "full-body", name: "Full body", focus: "Strength & mobility", tone: "sand", exercises: [
    { id: "goblet-squat", label: "Goblet squat", reps: "3 × 12", done: false }, { id: "push-ups", label: "Push-ups", reps: "3 × 8", done: false }, { id: "plank", label: "Plank", reps: "3 × 30 sec", done: false },
  ] },
];

type RoutineDataContextValue = {
  routines: Routine[];
  todayRoutineIds: string[];
  workoutRoutines: WorkoutRoutine[];
  activeWorkoutId: string;
  activeWorkout: WorkoutRoutine | null;
  exercises: WorkoutExercise[];
  fitnessProfile: FitnessProfile;
  workoutActive: boolean;
  toggleTodayRoutine: (id: string) => void;
  toggleRoutineStep: (routineId: string, stepId: string) => void;
  addRoutine: (name: string, time: string, tone: Routine["tone"], icon: RoutineIconType) => void;
  updateRoutine: (id: string, update: Partial<Pick<Routine, "name" | "time" | "tone" | "icon">>) => void;
  removeRoutine: (id: string) => void;
  addRoutineStep: (routineId: string, label: string) => void;
  updateRoutineStep: (routineId: string, stepId: string, label: string) => void;
  removeRoutineStep: (routineId: string, stepId: string) => void;
  selectWorkoutRoutine: (id: string) => void;
  addWorkoutRoutine: (name: string, focus: string, tone: WorkoutRoutine["tone"]) => string;
  updateWorkoutRoutine: (id: string, update: Partial<Pick<WorkoutRoutine, "name" | "focus" | "tone">>) => void;
  removeWorkoutRoutine: (id: string) => void;
  toggleExercise: (id: string) => void;
  addExercise: (label: string, reps: string, minutes: number, met: number) => void;
  updateExercise: (id: string, update: Partial<Pick<WorkoutExercise, "label" | "reps" | "minutes" | "met">>) => void;
  removeExercise: (id: string) => void;
  toggleWorkout: () => void;
  resetWorkout: () => void;
  updateFitnessProfile: (update: Partial<FitnessProfile>) => void;
};

const RoutineDataContext = createContext<RoutineDataContextValue | null>(null);
const STORAGE_KEY = "noa-routines-data-v1";
const initialFitnessProfile: FitnessProfile = { weightKg: 0, heightCm: 0, dailySteps: 0, stepGoal: 8000, stepsDate: "" };

function normalizeExercises(exercises: WorkoutExercise[] = []) {
  return exercises.map((exercise) => ({ ...exercise, id: exercise.id || crypto.randomUUID(), minutes: exercise.minutes ?? 6, met: exercise.met ?? 5 }));
}

function normalizeRoutines(routines: Array<Partial<Routine>>): Routine[] {
  return routines.map((routine, index) => {
    const fallback = initialRoutines.find((item) => item.id === routine.id) ?? initialRoutines[index % initialRoutines.length];
    const hour = Number((routine.time ?? fallback.time).split(":")[0]);
    const inferredIcon: RoutineIconType = routine.name?.toLowerCase().includes("study") ? "study" : hour >= 18 ? "night" : hour < 11 ? "morning" : "tasks";
    return { ...fallback, ...routine, icon: routine.icon ?? inferredIcon } as Routine;
  });
}

export function RoutineDataProvider({ children }: { children: ReactNode }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [todayRoutineIds, setTodayRoutineIds] = useState(initialRoutines.map((routine) => routine.id));
  const [workoutRoutines, setWorkoutRoutines] = useState(initialWorkoutRoutines);
  const [activeWorkoutId, setActiveWorkoutId] = useState(initialWorkoutRoutines[0].id);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [fitnessProfile, setFitnessProfile] = useState(initialFitnessProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { routines?: Routine[]; todayRoutineIds?: string[]; workoutRoutines?: WorkoutRoutine[]; activeWorkoutId?: string; exercises?: WorkoutExercise[]; workoutActive?: boolean; fitnessProfile?: Partial<FitnessProfile> };
        if (parsed.routines) {
          const normalizedRoutines = normalizeRoutines(parsed.routines);
          setRoutines(normalizedRoutines);
          setTodayRoutineIds(parsed.todayRoutineIds ?? normalizedRoutines.map((routine) => routine.id));
        }
        if (parsed.workoutRoutines?.length) {
          const normalized = parsed.workoutRoutines.map((routine) => ({ ...routine, exercises: normalizeExercises(routine.exercises) }));
          setWorkoutRoutines(normalized);
          setActiveWorkoutId(normalized.some((routine) => routine.id === parsed.activeWorkoutId) ? parsed.activeWorkoutId! : normalized[0].id);
        } else if (parsed.exercises) {
          setWorkoutRoutines([{ ...initialWorkoutRoutines[0], exercises: normalizeExercises(parsed.exercises) }]);
          setActiveWorkoutId(initialWorkoutRoutines[0].id);
        }
        if (typeof parsed.workoutActive === "boolean") setWorkoutActive(parsed.workoutActive);
        if (parsed.fitnessProfile) {
          const today = new Date().toISOString().slice(0, 10);
          const storedProfile = { ...initialFitnessProfile, ...parsed.fitnessProfile };
          setFitnessProfile({ ...storedProfile, dailySteps: storedProfile.stepsDate === today ? storedProfile.dailySteps : 0, stepsDate: today });
        }
      } else {
        const legacy = window.localStorage.getItem("planner-today-v2");
        if (legacy) {
          const parsed = JSON.parse(legacy) as { exercises?: WorkoutExercise[] };
          if (parsed.exercises) setWorkoutRoutines([{ ...initialWorkoutRoutines[0], exercises: normalizeExercises(parsed.exercises) }]);
        }
      }
    } catch {
      // Keep starter data when saved data is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ routines, todayRoutineIds, workoutRoutines, activeWorkoutId, workoutActive, fitnessProfile }));
  }, [routines, todayRoutineIds, workoutRoutines, activeWorkoutId, workoutActive, fitnessProfile, ready]);

  const activeWorkout = useMemo(() => workoutRoutines.find((routine) => routine.id === activeWorkoutId) ?? workoutRoutines[0] ?? null, [workoutRoutines, activeWorkoutId]);
  const exercises = activeWorkout?.exercises ?? [];
  const updateActiveExercises = (updater: (current: WorkoutExercise[]) => WorkoutExercise[]) => {
    if (!activeWorkout) return;
    setWorkoutRoutines((current) => current.map((routine) => routine.id === activeWorkout.id ? { ...routine, exercises: updater(routine.exercises) } : routine));
  };

  const value: RoutineDataContextValue = {
    routines, todayRoutineIds, workoutRoutines, activeWorkoutId: activeWorkout?.id ?? "", activeWorkout, exercises, workoutActive, fitnessProfile,
    toggleTodayRoutine(id) { setTodayRoutineIds((current) => current.includes(id) ? current.filter((routineId) => routineId !== id) : [...current, id]); },
    toggleRoutineStep(routineId, stepId) { setRoutines((current) => current.map((routine) => routine.id === routineId ? { ...routine, steps: routine.steps.map((step) => step.id === stepId ? { ...step, done: !step.done } : step) } : routine)); },
    addRoutine(name, time, tone, icon) { setRoutines((current) => [...current, { id: crypto.randomUUID(), name, time, tone, icon, steps: [{ id: crypto.randomUUID(), label: "First step", done: false }] }]); },
    updateRoutine(id, update) { setRoutines((current) => current.map((routine) => routine.id === id ? { ...routine, ...update } : routine)); },
    removeRoutine(id) { setRoutines((current) => current.filter((routine) => routine.id !== id)); setTodayRoutineIds((current) => current.filter((routineId) => routineId !== id)); },
    addRoutineStep(routineId, label) { setRoutines((current) => current.map((routine) => routine.id === routineId ? { ...routine, steps: [...routine.steps, { id: crypto.randomUUID(), label, done: false }] } : routine)); },
    updateRoutineStep(routineId, stepId, label) { setRoutines((current) => current.map((routine) => routine.id === routineId ? { ...routine, steps: routine.steps.map((step) => step.id === stepId ? { ...step, label } : step) } : routine)); },
    removeRoutineStep(routineId, stepId) { setRoutines((current) => current.map((routine) => routine.id === routineId ? { ...routine, steps: routine.steps.filter((step) => step.id !== stepId) } : routine)); },
    selectWorkoutRoutine(id) { if (workoutRoutines.some((routine) => routine.id === id)) { setActiveWorkoutId(id); setWorkoutActive(false); } },
    addWorkoutRoutine(name, focus, tone) { const id = crypto.randomUUID(); setWorkoutRoutines((current) => [...current, { id, name, focus, tone, exercises: [] }]); setActiveWorkoutId(id); setWorkoutActive(false); return id; },
    updateWorkoutRoutine(id, update) { setWorkoutRoutines((current) => current.map((routine) => routine.id === id ? { ...routine, ...update } : routine)); },
    removeWorkoutRoutine(id) { if (workoutRoutines.length <= 1) return; const remaining = workoutRoutines.filter((routine) => routine.id !== id); setWorkoutRoutines(remaining); if (activeWorkout?.id === id) setActiveWorkoutId(remaining[0].id); setWorkoutActive(false); },
    toggleExercise(id) { updateActiveExercises((current) => current.map((exercise) => exercise.id === id ? { ...exercise, done: !exercise.done } : exercise)); },
    addExercise(label, reps, minutes, met) { updateActiveExercises((current) => [...current, { id: crypto.randomUUID(), label, reps, minutes, met, done: false }]); },
    updateExercise(id, update) { updateActiveExercises((current) => current.map((exercise) => exercise.id === id ? { ...exercise, ...update } : exercise)); },
    removeExercise(id) { updateActiveExercises((current) => current.filter((exercise) => exercise.id !== id)); },
    toggleWorkout() { if (activeWorkout) setWorkoutActive((current) => !current); },
    resetWorkout() { updateActiveExercises((current) => current.map((exercise) => ({ ...exercise, done: false }))); setWorkoutActive(false); },
    updateFitnessProfile(update) { setFitnessProfile((current) => ({ ...current, ...update, ...("dailySteps" in update ? { stepsDate: new Date().toISOString().slice(0, 10) } : {}) })); },
  };

  return createElement(RoutineDataContext.Provider, { value }, children);
}

export function useRoutineData() {
  const context = useContext(RoutineDataContext);
  if (!context) throw new Error("useRoutineData must be used inside RoutineDataProvider");
  return context;
}
