"use client";

import { createContext, createElement, ReactNode, useContext, useEffect, useState } from "react";

export type MoneyCategory = "Comida" | "Transporte" | "Estudios" | "Personal" | "Ocio" | "Hogar" | "Suscripciones" | "Otros";
export type MoneyTransaction = { id: string; type: "expense" | "income"; title: string; amount: number; category: MoneyCategory; date: string; note: string; payment: string };
export type MoneyBudget = { id: string; category: MoneyCategory; limit: number; color: string };
export type SavingsGoal = { id: string; name: string; target: number; current: number; deadline: string; favorite: boolean; imageDataUrl?: string };

export const moneyCategories: MoneyCategory[] = ["Comida", "Transporte", "Estudios", "Personal", "Ocio", "Hogar", "Suscripciones", "Otros"];

const initialTransactions: MoneyTransaction[] = [
  { id: "salary", type: "income", title: "Salario", amount: 7500, category: "Otros", date: "2026-10-01", note: "Ingreso mensual", payment: "Transferencia" },
  { id: "market", type: "expense", title: "Supermercado", amount: 156, category: "Comida", date: "2026-10-06", note: "Compra semanal", payment: "Tarjeta" },
  { id: "uber", type: "expense", title: "Uber", amount: 25, category: "Transporte", date: "2026-10-06", note: "Viaje a la oficina", payment: "Tarjeta" },
  { id: "lunch", type: "expense", title: "Almuerzo", amount: 48, category: "Comida", date: "2026-10-05", note: "", payment: "Efectivo" },
  { id: "skincare", type: "expense", title: "Skincare", amount: 245, category: "Personal", date: "2026-10-03", note: "Reposición", payment: "Tarjeta" },
  { id: "coffee", type: "expense", title: "Café", amount: 28, category: "Comida", date: "2026-10-03", note: "", payment: "Efectivo" },
  { id: "tuition", type: "expense", title: "Universidad", amount: 580, category: "Estudios", date: "2026-10-02", note: "Mensualidad", payment: "Transferencia" },
  { id: "rent", type: "expense", title: "Renta", amount: 1200, category: "Hogar", date: "2026-10-01", note: "", payment: "Transferencia" },
  { id: "subscriptions", type: "expense", title: "Suscripciones", amount: 98, category: "Suscripciones", date: "2026-10-01", note: "Streaming y apps", payment: "Tarjeta" },
  { id: "trip", type: "expense", title: "Reserva de viaje", amount: 280, category: "Ocio", date: "2026-10-01", note: "", payment: "Tarjeta" },
  { id: "shopping", type: "expense", title: "Ropa", amount: 340, category: "Personal", date: "2026-10-01", note: "", payment: "Tarjeta" },
  { id: "utilities", type: "expense", title: "Servicios", amount: 420, category: "Hogar", date: "2026-10-01", note: "Internet, luz y agua", payment: "Transferencia" },
];

const initialBudgets: MoneyBudget[] = [
  { id: "food", category: "Comida", limit: 1500, color: "#cf8987" }, { id: "transport", category: "Transporte", limit: 600, color: "#9ca469" },
  { id: "studies", category: "Estudios", limit: 800, color: "#d69da0" }, { id: "personal", category: "Personal", limit: 900, color: "#aeb078" },
  { id: "fun", category: "Ocio", limit: 500, color: "#b46c72" }, { id: "home", category: "Hogar", limit: 1900, color: "#c7beb3" },
  { id: "subscriptions-budget", category: "Suscripciones", limit: 200, color: "#70702e" }, { id: "other-budget", category: "Otros", limit: 700, color: "#d8c8b6" },
];

const initialGoals: SavingsGoal[] = [
  { id: "headphones", name: "New headphones", target: 900, current: 620, deadline: "2026-12-15", favorite: true },
  { id: "sims", name: "The Sims 4 packs", target: 600, current: 150, deadline: "2027-01-10", favorite: false },
  { id: "emergency", name: "Fondo de emergencia", target: 10000, current: 2500, deadline: "2027-12-31", favorite: false },
];

type MoneyContextValue = {
  transactions: MoneyTransaction[]; budgets: MoneyBudget[]; goals: SavingsGoal[];
  addTransaction: (value: Omit<MoneyTransaction, "id">) => void;
  updateTransaction: (id: string, value: Partial<Omit<MoneyTransaction, "id">>) => void;
  removeTransaction: (id: string) => void;
  addBudget: (value: Omit<MoneyBudget, "id">) => void;
  updateBudget: (id: string, value: Partial<Omit<MoneyBudget, "id">>) => void;
  removeBudget: (id: string) => void;
  addGoal: (value: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, value: Partial<Omit<SavingsGoal, "id">>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
};

const MoneyContext = createContext<MoneyContextValue | null>(null);
const STORAGE_KEY = "noa-money-data-v1";

export function MoneyDataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [goals, setGoals] = useState(initialGoals);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) { const parsed = JSON.parse(saved) as { transactions?: MoneyTransaction[]; budgets?: MoneyBudget[]; goals?: SavingsGoal[] }; if (parsed.transactions) setTransactions(parsed.transactions); if (parsed.budgets) setBudgets(parsed.budgets); if (parsed.goals) setGoals(parsed.goals); } } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgets, goals })); } catch {} } }, [transactions, budgets, goals, ready]);
  const value: MoneyContextValue = {
    transactions, budgets, goals,
    addTransaction(value) { setTransactions((current) => [{ ...value, id: crypto.randomUUID() }, ...current]); },
    updateTransaction(id, value) { setTransactions((current) => current.map((item) => item.id === id ? { ...item, ...value } : item)); },
    removeTransaction(id) { setTransactions((current) => current.filter((item) => item.id !== id)); },
    addBudget(value) { setBudgets((current) => current.some((item) => item.category === value.category) ? current.map((item) => item.category === value.category ? { ...item, ...value } : item) : [...current, { ...value, id: crypto.randomUUID() }]); },
    updateBudget(id, value) { setBudgets((current) => current.filter((item) => item.id === id || !value.category || item.category !== value.category).map((item) => item.id === id ? { ...item, ...value } : item)); },
    removeBudget(id) { setBudgets((current) => current.filter((item) => item.id !== id)); },
    addGoal(value) { setGoals((current) => [{ ...value, id: crypto.randomUUID() }, ...current]); },
    updateGoal(id, value) { setGoals((current) => current.map((item) => { if (item.id !== id) return item; const next = { ...item, ...value }; return { ...next, current: Math.max(0, Math.min(next.target, next.current)) }; })); },
    removeGoal(id) { setGoals((current) => current.filter((item) => item.id !== id)); },
    contributeToGoal(id, amount) { setGoals((current) => current.map((item) => item.id === id ? { ...item, current: Math.max(0, Math.min(item.target, item.current + amount)) } : item)); },
  };
  return createElement(MoneyContext.Provider, { value }, children);
}

export function useMoneyData() { const context = useContext(MoneyContext); if (!context) throw new Error("useMoneyData must be used inside MoneyDataProvider"); return context; }
