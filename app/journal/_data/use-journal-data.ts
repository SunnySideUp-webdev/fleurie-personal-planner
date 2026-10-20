"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import { createContext, createElement, ReactNode, useContext, useEffect, useState } from "react";

export type JournalEntryType = "Diary" | "Gratitude" | "Reflection" | "Memory";
export type JournalCanvasItem = {
  id: string;
  kind: "photo" | "sticker";
  src?: string;
  variant?: "flower" | "heart" | "sparkles";
  x: number;
  y: number;
  size: number;
  z: number;
  rotation: number;
  opacity?: number;
};
export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  type: JournalEntryType;
  tags: string[];
  content: string;
  mood: number;
  photos: string[];
  canvasItems?: JournalCanvasItem[];
  coverImage?: string;
  favorite: boolean;
  promptId?: string;
};
export type JournalTag = { id: string; label: string; color: "rose" | "sand" | "green" };
export type JournalPrompt = { id: string; text: string; category: string; favorite: boolean; custom?: boolean };

export const journalTypes: JournalEntryType[] = ["Diary", "Gratitude", "Reflection", "Memory"];

const initialEntries: JournalEntry[] = [
  { id: "calm-day", date: "2026-10-05", title: "Un día tranquilo", type: "Diary", tags: ["Daily life", "JJ", "Happiness", "Food"], mood: 3, favorite: true, photos: [], content: "Hoy fue un día bonito. Terminamos el parcial en la mañana y me siento un poco más tranquila, aunque todavía falta Física. En la tarde estuve con JJ, salimos a caminar y fue lindo. Me gusta cómo siempre hace esos planes sencillos pero que igual se sienten especiales.\n\nTambién horneamos galletas y quedaron riquísimas. Estos pequeños momentos me dan mucha paz, sobre todo en semanas pesadas.\n\nQuiero seguir haciendo más cosas que me hagan sentir bien. Voy poco a poco, pero voy ♡" },
  { id: "small-things", date: "2026-10-03", title: "Pequeñas cosas ♡", type: "Gratitude", tags: ["Personal", "Happiness"], mood: 4, favorite: false, photos: [], content: "Hoy agradezco las flores, una taza de café caliente y una conversación que necesitaba." },
  { id: "new-habits", date: "2026-10-01", title: "Nuevos hábitos", type: "Reflection", tags: ["Growth", "Goals"], mood: 3, favorite: false, photos: [], content: "Quiero construir hábitos pequeños que pueda sostener, sin intentar cambiar todo de una sola vez." },
  { id: "weekend", date: "2026-09-28", title: "Fin de semana", type: "Memory", tags: ["Personal", "Daily life"], mood: 4, favorite: true, photos: [], content: "Un fin de semana lento, con cielo bonito y tiempo para descansar." },
  { id: "wants", date: "2026-09-25", title: "Cosas que quiero", type: "Reflection", tags: ["Goals", "Personal"], mood: 2, favorite: false, photos: [], content: "Quiero una vida más intencional, con espacio para crear, descansar y cuidar de mí." },
  { id: "university", date: "2026-09-22", title: "Día en la U", type: "Diary", tags: ["University", "Daily life"], mood: 2, favorite: false, photos: [], content: "Fue un día largo de clases, pero avancé más de lo que esperaba." },
  { id: "better", date: "2026-09-18", title: "Me siento mejor", type: "Diary", tags: ["Personal", "Happiness"], mood: 3, favorite: false, photos: [], content: "Hoy mi mente se siente un poco más ligera." },
  { id: "reminders", date: "2026-09-14", title: "Recordatorios", type: "Reflection", tags: ["Notes", "Growth"], mood: 2, favorite: false, photos: [], content: "No tengo que hacerlo todo hoy. Descansar también forma parte del proceso." },
  { id: "things-love", date: "2026-09-10", title: "Cosas que amo", type: "Gratitude", tags: ["Personal", "Happiness"], mood: 4, favorite: true, photos: [], content: "Las mañanas tranquilas, los animales, las flores y sentirme en casa." },
];

const initialTags: JournalTag[] = [
  { id: "personal", label: "Personal", color: "rose" }, { id: "daily-life", label: "Daily life", color: "sand" },
  { id: "jj", label: "JJ", color: "sand" }, { id: "university", label: "University", color: "rose" },
  { id: "happiness", label: "Happiness", color: "rose" }, { id: "goals", label: "Goals", color: "green" },
  { id: "growth", label: "Growth", color: "green" }, { id: "food", label: "Food", color: "sand" },
  { id: "notes", label: "Notes", color: "sand" },
];

const initialPrompts: JournalPrompt[] = [
  { id: "p1", text: "¿Qué hizo que hoy se sintiera un poco más ligero?", category: "Daily reflection", favorite: true },
  { id: "p2", text: "Nombra tres pequeñas cosas por las que sientes gratitud.", category: "Gratitude", favorite: true },
  { id: "p3", text: "¿Qué necesitas más esta semana?", category: "Self care", favorite: false },
  { id: "p4", text: "Describe un recuerdo que nunca quieras olvidar.", category: "Memory", favorite: false },
  { id: "p5", text: "¿Qué avance reciente te hace sentir orgullo?", category: "Growth", favorite: true },
  { id: "p6", text: "Si mañana fuera un día tranquilo, ¿cómo sería?", category: "Daily reflection", favorite: false },
  { id: "p7", text: "Escribe una nota para tu yo del futuro.", category: "Growth", favorite: false },
  { id: "p8", text: "¿Qué límite haría que tu vida se sintiera más tranquila?", category: "Self care", favorite: false },
];

type EntryInput = Omit<JournalEntry, "id">;
type JournalContextValue = {
  entries: JournalEntry[]; tags: JournalTag[]; prompts: JournalPrompt[];
  addEntry: (entry: EntryInput) => string;
  updateEntry: (id: string, value: Partial<EntryInput>) => void;
  removeEntry: (id: string) => void;
  addTag: (label: string, color: JournalTag["color"]) => void;
  renameTag: (id: string, label: string) => void;
  removeTag: (id: string) => void;
  addPrompt: (text: string, category: string) => void;
  togglePromptFavorite: (id: string) => void;
  removePrompt: (id: string) => void;
};

const JournalContext = createContext<JournalContextValue | null>(null);
const STORAGE_KEY = "noa-journal-data-v1";

function dedupeEntries(items: JournalEntry[]) {
  const seenIds = new Set<string>();
  const seenQuickEntries = new Set<string>();
  return items.filter((entry) => {
    if (seenIds.has(entry.id)) return false;
    seenIds.add(entry.id);

    if (entry.title === "Quick journal") {
      const quickEntryKey = `${entry.date}:${entry.content.trim()}`;
      if (seenQuickEntries.has(quickEntryKey)) return false;
      seenQuickEntries.add(quickEntryKey);
    }

    return true;
  });
}

export function JournalDataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(initialEntries);
  const [tags, setTags] = useState(initialTags);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<{ entries: JournalEntry[]; tags: JournalTag[]; prompts: JournalPrompt[] }>;
        if (parsed.entries) setEntries(dedupeEntries(parsed.entries));
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.prompts) setPrompts(parsed.prompts.map((prompt) => {
          const translated = initialPrompts.find((item) => item.id === prompt.id);
          return translated ? { ...prompt, text: translated.text } : prompt;
        }));
      } else {
        const quick = JSON.parse(window.localStorage.getItem("noa-quick-journal-v1") ?? "[]") as { id?: string; text?: string; mood?: string; createdAt?: string }[];
        if (quick.length) setEntries((current) => dedupeEntries([...quick.map((item, index) => ({ id: item.id ?? `quick-${index}`, date: item.createdAt?.slice(0, 10) ?? "2026-10-06", title: "Quick journal", type: "Diary" as const, tags: ["Daily life"], content: item.text ?? "", mood: 3, photos: [], favorite: false })), ...current]));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => { if (ready) { try { setLocalStorageItem(STORAGE_KEY, JSON.stringify({ entries, tags, prompts })); } catch {} } }, [entries, tags, prompts, ready]);
  useEffect(() => {
    function receiveQuickEntry(event: Event) {
      const item = (event as CustomEvent<{ id: string; text: string; createdAt: string }>).detail;
      if (!item) return;
      setEntries((current) => dedupeEntries([{ id: item.id, date: item.createdAt.slice(0, 10), title: "Quick journal", type: "Diary", tags: ["Daily life"], content: item.text, mood: 3, photos: [], favorite: false }, ...current]));
    }
    window.addEventListener("noa-quick-journal-added", receiveQuickEntry);
    return () => window.removeEventListener("noa-quick-journal-added", receiveQuickEntry);
  }, []);

  const value: JournalContextValue = {
    entries, tags, prompts,
    addEntry(entry) { const id = crypto.randomUUID(); setEntries((current) => [{ ...entry, id }, ...current]); return id; },
    updateEntry(id, value) { setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...value } : entry)); },
    removeEntry(id) { setEntries((current) => current.filter((entry) => entry.id !== id)); },
    addTag(label, color) { const clean = label.trim(); if (!clean) return; setTags((current) => current.some((tag) => tag.label.toLowerCase() === clean.toLowerCase()) ? current : [...current, { id: crypto.randomUUID(), label: clean, color }]); },
    renameTag(id, label) { const clean = label.trim(); const old = tags.find((tag) => tag.id === id)?.label; if (!clean || !old) return; setTags((current) => current.map((tag) => tag.id === id ? { ...tag, label: clean } : tag)); setEntries((items) => items.map((entry) => ({ ...entry, tags: entry.tags.map((tag) => tag === old ? clean : tag) }))); },
    removeTag(id) { const old = tags.find((tag) => tag.id === id)?.label; setTags((current) => current.filter((tag) => tag.id !== id)); if (old) setEntries((items) => items.map((entry) => ({ ...entry, tags: entry.tags.filter((tag) => tag !== old) }))); },
    addPrompt(text, category) { const clean = text.trim(); if (clean) setPrompts((current) => [{ id: crypto.randomUUID(), text: clean, category, favorite: false, custom: true }, ...current]); },
    togglePromptFavorite(id) { setPrompts((current) => current.map((prompt) => prompt.id === id ? { ...prompt, favorite: !prompt.favorite } : prompt)); },
    removePrompt(id) { setPrompts((current) => current.filter((prompt) => prompt.id !== id)); },
  };
  return createElement(JournalContext.Provider, { value }, children);
}

export function useJournalData() {
  const context = useContext(JournalContext);
  if (!context) throw new Error("useJournalData must be used inside JournalDataProvider");
  return context;
}
