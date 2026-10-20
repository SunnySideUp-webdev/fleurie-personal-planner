"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import { createContext, createElement, ReactNode, useContext, useEffect, useState } from "react";

export type HabitIconType =
  | "sparkles" | "water" | "exercise" | "read" | "leaf" | "journal"
  | "walk" | "stretch" | "meditate" | "sleep" | "morning" | "nutrition"
  | "coffee" | "medicine" | "heart" | "selfcare" | "beauty" | "study"
  | "focus" | "work" | "clean" | "home" | "money" | "music"
  | "creative" | "write" | "calendar" | "tasks" | "time" | "rest"
  | "bike" | "meal" | "bath" | "pet" | "language" | "alarm"
  | "computer" | "shopping" | "personal";

export type LifestyleHabit = {
  id: string;
  label: string;
  icon: HabitIconType;
  color: string;
  history: boolean[];
  streak: number;
  category: string;
  frequency: string;
  scheduleDays: number[];
};

export const habitWeekdays = [
  { value: 0, short: "Mon", label: "Monday" },
  { value: 1, short: "Tue", label: "Tuesday" },
  { value: 2, short: "Wed", label: "Wednesday" },
  { value: 3, short: "Thu", label: "Thursday" },
  { value: 4, short: "Fri", label: "Friday" },
  { value: 5, short: "Sat", label: "Saturday" },
  { value: 6, short: "Sun", label: "Sunday" },
] as const;

export const habitFrequencyOptions = [
  "Daily",
  "Daily on weekdays",
  "Weekends",
  ...habitWeekdays.map((day) => `Every ${day.label}`),
  "Custom",
] as const;

export function getScheduleDaysForFrequency(frequency: string): number[] {
  if (frequency === "Daily") return [0, 1, 2, 3, 4, 5, 6];
  if (frequency === "Daily on weekdays") return [0, 1, 2, 3, 4];
  if (frequency === "Weekends") return [5, 6];
  const weekday = habitWeekdays.find((day) => `Every ${day.label}` === frequency);
  return weekday ? [weekday.value] : [0, 1, 2, 3, 4, 5, 6];
}

export function isHabitScheduledForDay(habit: Pick<LifestyleHabit, "frequency" | "scheduleDays">, day: number) {
  const days = habit.scheduleDays?.length ? habit.scheduleDays : getScheduleDaysForFrequency(habit.frequency);
  return days.includes(day);
}

export function formatHabitFrequency(habit: Pick<LifestyleHabit, "frequency" | "scheduleDays">) {
  if (habit.frequency !== "Custom") return habit.frequency;
  const labels = habitWeekdays.filter((day) => habit.scheduleDays.includes(day.value)).map((day) => day.short);
  return labels.length ? labels.join(", ") : "Custom";
}

export type LifestyleHabitCategory = {
  id: string;
  name: string;
  color: string;
};

export const initialHabitCategories: LifestyleHabitCategory[] = [
  { id: "self-care", name: "Self care", color: "#9ca469" },
  { id: "health", name: "Health", color: "#b46c72" },
  { id: "productivity", name: "Productivity", color: "#70702e" },
  { id: "personal", name: "Personal", color: "#c7beb3" },
];

export const initialHabits: LifestyleHabit[] = [
  { id: "skincare", label: "Skincare", icon: "sparkles", color: "#9ca469", history: [true, true, true, true, true, true, false], streak: 12, category: "Self care", frequency: "Daily", scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
  { id: "water", label: "Drink water", icon: "water", color: "#aeb078", history: [true, true, true, true, false, false, false], streak: 8, category: "Health", frequency: "Daily", scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
  { id: "exercise", label: "Exercise", icon: "exercise", color: "#b46c72", history: [true, true, false, false, false, false, false], streak: 3, category: "Health", frequency: "Custom", scheduleDays: [0, 1, 3, 5] },
  { id: "read", label: "Read", icon: "read", color: "#70702e", history: [true, true, false, false, false, false, false], streak: 6, category: "Productivity", frequency: "Daily", scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
  { id: "soda", label: "No soda", icon: "leaf", color: "#ebb4b2", history: [true, true, false, false, false, false, false], streak: 5, category: "Health", frequency: "Daily", scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
  { id: "journal", label: "Journal", icon: "journal", color: "#c7beb3", history: [true, true, false, false, false, false, false], streak: 4, category: "Personal", frequency: "Daily", scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
];

type HabitDataContextValue = {
  habits: LifestyleHabit[];
  categories: LifestyleHabitCategory[];
  toggleHabit: (habitId: string, day: number) => void;
  addHabit: (habit: Omit<LifestyleHabit, "id" | "history" | "streak">) => void;
  updateHabit: (id: string, update: Partial<Omit<LifestyleHabit, "id">>) => void;
  removeHabit: (id: string) => void;
  addCategory: (category: Omit<LifestyleHabitCategory, "id">) => void;
  updateCategory: (id: string, update: Partial<Omit<LifestyleHabitCategory, "id">>) => void;
  resetHabits: () => void;
};

const HabitDataContext = createContext<HabitDataContextValue | null>(null);
const STORAGE_KEY = "noa-habits-v1";
const CATEGORY_STORAGE_KEY = "noa-habit-categories-v1";

export function HabitDataProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState(initialHabits);
  const [categories, setCategories] = useState(initialHabitCategories);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LifestyleHabit>[];
        setHabits(parsed.map((habit, index) => {
          const fallback = initialHabits.find((item) => item.id === habit.id) ?? initialHabits[index % initialHabits.length];
          const legacyFrequency = habit.frequency === "4 days / week";
          const frequency = legacyFrequency ? "Custom" : habit.frequency ?? fallback.frequency;
          const scheduleDays = habit.scheduleDays ?? (legacyFrequency ? [0, 1, 3, 5] : getScheduleDaysForFrequency(frequency));
          return { ...fallback, ...habit, frequency, scheduleDays } as LifestyleHabit;
        }));
      }
      const savedCategories = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories) as LifestyleHabitCategory[];
        if (Array.isArray(parsedCategories) && parsedCategories.length) setCategories(parsedCategories);
      }
    } catch {
      // Keep starter habits when saved data is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      setLocalStorageItem(STORAGE_KEY, JSON.stringify(habits));
      setLocalStorageItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [habits, categories, ready]);

  const value: HabitDataContextValue = {
    habits,
    categories,
    toggleHabit(habitId, day) {
      setHabits((current) => current.map((habit) => habit.id === habitId ? { ...habit, history: habit.history.map((checked, index) => index === day ? !checked : checked) } : habit));
    },
    addHabit(habit) {
      setHabits((current) => [...current, { ...habit, id: crypto.randomUUID(), history: Array(7).fill(false), streak: 0 }]);
    },
    updateHabit(id, update) {
      setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, ...update } : habit));
    },
    removeHabit(id) {
      setHabits((current) => current.filter((habit) => habit.id !== id));
    },
    addCategory(category) {
      setCategories((current) => current.some((item) => item.name.toLowerCase() === category.name.toLowerCase()) ? current : [...current, { ...category, id: crypto.randomUUID() }]);
    },
    updateCategory(id, update) {
      const currentCategory = categories.find((category) => category.id === id);
      if (!currentCategory) return;
      const nextName = update.name?.trim() || currentCategory.name;
      const nextColor = update.color || currentCategory.color;
      setCategories((current) => current.map((category) => category.id === id ? { ...category, ...update, name: nextName, color: nextColor } : category));
      setHabits((current) => current.map((habit) => habit.category === currentCategory.name ? { ...habit, category: nextName, color: nextColor } : habit));
    },
    resetHabits() {
      setHabits(initialHabits);
    },
  };

  return createElement(HabitDataContext.Provider, { value }, children);
}

export function useHabitData() {
  const context = useContext(HabitDataContext);
  if (!context) throw new Error("useHabitData must be used inside HabitDataProvider");
  return context;
}
