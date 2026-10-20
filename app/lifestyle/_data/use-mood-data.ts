"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import { createContext, createElement, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type MoodValue = 0 | 1 | 2 | 3 | 4;
export type MoodEntry = { date: string; mood: MoodValue; note: string };

const seedEntries: MoodEntry[] = [
  { date: "2026-09-29", mood: 2, note: "A quiet day." },
  { date: "2026-09-30", mood: 1, note: "A little overwhelmed." },
  { date: "2026-10-01", mood: 3, note: "Feeling more grounded." },
  { date: "2026-10-02", mood: 3, note: "Productive and calm." },
  { date: "2026-10-03", mood: 4, note: "Such a lovely day ♡" },
  { date: "2026-10-04", mood: 2, note: "Taking things slowly." },
  { date: "2026-10-05", mood: 3, note: "Feeling a bit better today ♡" },
];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type MoodDataContextValue = {
  entries: MoodEntry[];
  todayKey: string;
  todayMood: MoodValue;
  todayNote: string;
  setMoodForDate: (date: string, mood: MoodValue) => void;
  setNoteForDate: (date: string, note: string) => void;
  removeEntry: (date: string) => void;
};

const MoodDataContext = createContext<MoodDataContextValue | null>(null);
const STORAGE_KEY = "noa-mood-data-v1";

export function MoodDataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(seedEntries);
  const [ready, setReady] = useState(false);
  const todayKey = localDateKey();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved) as MoodEntry[]);
      else {
        const legacy = window.localStorage.getItem("planner-today-v2");
        if (legacy) {
          const parsed = JSON.parse(legacy) as { mood?: number; moodNote?: string };
          if (typeof parsed.mood === "number") setEntries((current) => [...current.filter((entry) => entry.date !== todayKey), { date: todayKey, mood: parsed.mood as MoodValue, note: parsed.moodNote ?? "" }]);
        }
      }
    } catch {
      // Keep starter mood history when saved data is unavailable.
    }
    setReady(true);
  }, [todayKey]);

  useEffect(() => {
    if (ready) setLocalStorageItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, ready]);

  const todayEntry = useMemo(() => entries.find((entry) => entry.date === todayKey), [entries, todayKey]);

  function updateEntry(date: string, update: Partial<MoodEntry>) {
    setEntries((current) => current.some((entry) => entry.date === date)
      ? current.map((entry) => entry.date === date ? { ...entry, ...update } : entry)
      : [...current, { date, mood: 2 as MoodValue, note: "", ...update }].sort((a, b) => a.date.localeCompare(b.date)));
  }

  const value: MoodDataContextValue = {
    entries,
    todayKey,
    todayMood: todayEntry?.mood ?? 2,
    todayNote: todayEntry?.note ?? "",
    setMoodForDate(date, mood) { updateEntry(date, { mood }); },
    setNoteForDate(date, note) { updateEntry(date, { note }); },
    removeEntry(date) { setEntries((current) => current.filter((entry) => entry.date !== date)); },
  };

  return createElement(MoodDataContext.Provider, { value }, children);
}

export function useMoodData() {
  const context = useContext(MoodDataContext);
  if (!context) throw new Error("useMoodData must be used inside MoodDataProvider");
  return context;
}
