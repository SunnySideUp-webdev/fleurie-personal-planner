"use client";

import { createContext, createElement, ReactNode, useContext, useEffect, useState } from "react";

export type PlannerTask = {
  id: string;
  title: string;
  bucket: "Today" | "This week" | "Later";
  due: string;
  category: "Personal" | "University" | "Work" | "Wellness";
  priority: "Low" | "Medium" | "High";
  completed: boolean;
};

export type PlannerReminder = {
  id: string;
  title: string;
  group: "Today" | "Upcoming" | "Someday";
  date: string;
  time: string;
  repeat: string;
  enabled: boolean;
  completed: boolean;
};

export type PlannerGoal = {
  id: string;
  title: string;
  period: "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  category: string;
  progress: number;
  completed: boolean;
};

export type PlannerData = {
  tasks: PlannerTask[];
  reminders: PlannerReminder[];
  goals: PlannerGoal[];
  intention: string;
  planningNote: string;
  notificationSettings: {
    morning: boolean;
    evening: boolean;
    weekly: boolean;
  };
  weeklyReset: boolean[];
};

const initialData: PlannerData = {
  tasks: [
    { id: "task-1", title: "Finish university assignment", bucket: "Today", due: "Today, 11:00", category: "University", priority: "High", completed: false },
    { id: "task-2", title: "30 min walk", bucket: "Today", due: "Today, 17:30", category: "Wellness", priority: "Medium", completed: true },
    { id: "task-3", title: "Clean desk", bucket: "Today", due: "Today", category: "Personal", priority: "Low", completed: false },
    { id: "task-4", title: "Review Física 2 notes", bucket: "This week", due: "Thursday", category: "University", priority: "High", completed: false },
    { id: "task-5", title: "Reply to pending emails", bucket: "This week", due: "Friday", category: "Work", priority: "Medium", completed: false },
    { id: "task-6", title: "Plan next week", bucket: "This week", due: "Sunday", category: "Personal", priority: "Medium", completed: false },
    { id: "task-7", title: "Organize closet", bucket: "Later", due: "Oct 18", category: "Personal", priority: "Low", completed: false },
    { id: "task-8", title: "Update monthly budget", bucket: "Later", due: "Oct 25", category: "Personal", priority: "Medium", completed: false },
  ],
  reminders: [
    { id: "rem-1", title: "Take vitamins", group: "Today", date: "Today", time: "08:00", repeat: "Every day", enabled: true, completed: true },
    { id: "rem-2", title: "Call mom", group: "Today", date: "Today", time: "18:00", repeat: "None", enabled: true, completed: false },
    { id: "rem-3", title: "Submit statistics assignment", group: "Upcoming", date: "Oct 8", time: "23:59", repeat: "None", enabled: true, completed: false },
    { id: "rem-4", title: "Pay university tuition", group: "Upcoming", date: "Nov 5", time: "09:00", repeat: "Monthly", enabled: true, completed: false },
    { id: "rem-5", title: "Book dentist appointment", group: "Someday", date: "No date", time: "", repeat: "None", enabled: false, completed: false },
  ],
  goals: [
    { id: "goal-1", title: "Finish statistics project", period: "Weekly", category: "University", progress: 75, completed: false },
    { id: "goal-2", title: "Complete 3 workouts", period: "Weekly", category: "Wellness", progress: 67, completed: false },
    { id: "goal-3", title: "Read 80 pages", period: "Weekly", category: "Personal", progress: 50, completed: false },
    { id: "goal-4", title: "Save Q900 for headphones", period: "Monthly", category: "Money", progress: 69, completed: false },
    { id: "goal-5", title: "Create a calmer morning routine", period: "Monthly", category: "Lifestyle", progress: 40, completed: false },
    { id: "goal-6", title: "Pass every course", period: "Quarterly", category: "University", progress: 62, completed: false },
    { id: "goal-7", title: "Build a Q10,000 emergency fund", period: "Yearly", category: "Money", progress: 25, completed: false },
  ],
  intention: "Make space for what matters, without rushing myself.",
  planningNote: "Keep Thursday evening free and prepare everything for university on Wednesday night.",
  notificationSettings: { morning: true, evening: true, weekly: false },
  weeklyReset: [true, true, false, false],
};

const STORAGE_KEY = "noa-planner-data-v1";

type PlannerDataContextValue = {
  data: PlannerData;
  addTask: (task: Omit<PlannerTask, "id" | "completed">) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, update: Partial<Omit<PlannerTask, "id">>) => void;
  removeTask: (id: string) => void;
  addReminder: (reminder: Omit<PlannerReminder, "id" | "completed">) => void;
  toggleReminder: (id: string) => void;
  toggleReminderEnabled: (id: string) => void;
  updateReminder: (id: string, update: Partial<Omit<PlannerReminder, "id">>) => void;
  removeReminder: (id: string) => void;
  addGoal: (goal: Omit<PlannerGoal, "id" | "completed">) => void;
  toggleGoal: (id: string) => void;
  updateGoal: (id: string, update: Partial<Omit<PlannerGoal, "id">>) => void;
  removeGoal: (id: string) => void;
  setIntention: (intention: string) => void;
  setPlanningNote: (planningNote: string) => void;
  toggleNotificationSetting: (setting: keyof PlannerData["notificationSettings"]) => void;
  toggleWeeklyReset: (index: number) => void;
};

const PlannerDataContext = createContext<PlannerDataContextValue | null>(null);

export function PlannerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlannerData>(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PlannerData>;
        setData({
          ...initialData,
          ...parsed,
          notificationSettings: { ...initialData.notificationSettings, ...parsed.notificationSettings },
          weeklyReset: parsed.weeklyReset ?? initialData.weeklyReset,
        });
      }
    } catch {
      // Keep the starter data when local storage is unavailable or invalid.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const value: PlannerDataContextValue = {
    data,
    addTask(task: Omit<PlannerTask, "id" | "completed">) {
      setData((current) => ({ ...current, tasks: [...current.tasks, { ...task, id: crypto.randomUUID(), completed: false }] }));
    },
    toggleTask(id: string) {
      setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) }));
    },
    updateTask(id: string, update: Partial<Omit<PlannerTask, "id">>) {
      setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, ...update } : task) }));
    },
    removeTask(id: string) {
      setData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
    },
    addReminder(reminder: Omit<PlannerReminder, "id" | "completed">) {
      setData((current) => ({ ...current, reminders: [...current.reminders, { ...reminder, id: crypto.randomUUID(), completed: false }] }));
    },
    toggleReminder(id: string) {
      setData((current) => ({ ...current, reminders: current.reminders.map((reminder) => reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder) }));
    },
    toggleReminderEnabled(id: string) {
      setData((current) => ({ ...current, reminders: current.reminders.map((reminder) => reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder) }));
    },
    updateReminder(id: string, update: Partial<Omit<PlannerReminder, "id">>) {
      setData((current) => ({ ...current, reminders: current.reminders.map((reminder) => reminder.id === id ? { ...reminder, ...update } : reminder) }));
    },
    removeReminder(id: string) {
      setData((current) => ({ ...current, reminders: current.reminders.filter((reminder) => reminder.id !== id) }));
    },
    addGoal(goal: Omit<PlannerGoal, "id" | "completed">) {
      setData((current) => ({ ...current, goals: [...current.goals, { ...goal, id: crypto.randomUUID(), completed: false }] }));
    },
    toggleGoal(id: string) {
      setData((current) => ({ ...current, goals: current.goals.map((goal) => goal.id === id ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 } : goal) }));
    },
    updateGoal(id: string, update: Partial<Omit<PlannerGoal, "id">>) {
      setData((current) => ({ ...current, goals: current.goals.map((goal) => goal.id === id ? { ...goal, ...update } : goal) }));
    },
    removeGoal(id: string) {
      setData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) }));
    },
    setIntention(intention: string) {
      setData((current) => ({ ...current, intention }));
    },
    setPlanningNote(planningNote: string) {
      setData((current) => ({ ...current, planningNote }));
    },
    toggleNotificationSetting(setting: keyof PlannerData["notificationSettings"]) {
      setData((current) => ({
        ...current,
        notificationSettings: { ...current.notificationSettings, [setting]: !current.notificationSettings[setting] },
      }));
    },
    toggleWeeklyReset(index: number) {
      setData((current) => ({
        ...current,
        weeklyReset: current.weeklyReset.map((value, itemIndex) => itemIndex === index ? !value : value),
      }));
    },
  };

  return createElement(PlannerDataContext.Provider, { value }, children);
}

export function usePlannerData() {
  const context = useContext(PlannerDataContext);
  if (!context) throw new Error("usePlannerData must be used inside PlannerDataProvider");
  return context;
}
