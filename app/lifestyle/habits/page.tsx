"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Ellipsis,
  Flame,
  Flower2,
  Home,
  Leaf,
  ListChecks,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  TrendingUp,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { getScheduleDaysForFrequency, habitFrequencyOptions, isHabitScheduledForDay, LifestyleHabit, useHabitData } from "../_data/use-habit-data";
import { HabitIcon, HabitIconPicker } from "./_components/habit-icon-picker";
import { HabitDaysPicker } from "./_components/habit-days-picker";

const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits", active: true },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HabitCheck({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return <button className={`habit-check ${checked ? "checked" : ""}`} onClick={onClick} aria-label={label} aria-pressed={checked}>{checked && <Check size={15} />}</button>;
}

export default function LifestyleHabitsPage() {
  const { habits, categories, toggleHabit, addHabit, updateHabit, removeHabit, resetHabits } = useHabitData();
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [period, setPeriod] = useState("This week");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [habitName, setHabitName] = useState("");
  const [habitIcon, setHabitIcon] = useState<LifestyleHabit["icon"]>("sparkles");
  const [habitCategory, setHabitCategory] = useState<LifestyleHabit["category"]>("Personal");
  const [habitFrequency, setHabitFrequency] = useState("Daily");
  const [habitDays, setHabitDays] = useState<number[]>(getScheduleDaysForFrequency("Daily"));

  const scheduledHabits = useMemo(() => habits.filter((habit) => isHabitScheduledForDay(habit, selectedDay)), [habits, selectedDay]);
  const completedToday = useMemo(() => scheduledHabits.filter((habit) => habit.history[selectedDay]).length, [scheduledHabits, selectedDay]);
  const totalChecks = useMemo(() => habits.reduce((total, habit) => total + habit.history.filter((checked, day) => checked && isHabitScheduledForDay(habit, day)).length, 0), [habits]);
  const totalScheduledSlots = useMemo(() => habits.reduce((total, habit) => total + habit.scheduleDays.length, 0), [habits]);
  const completion = totalScheduledSlots ? Math.round((totalChecks / totalScheduledSlots) * 100) : 0;
  const visibleHabits = habits.filter((habit) => habit.label.toLowerCase().includes(query.toLowerCase()));
  const todayHabits = visibleHabits.filter((habit) => isHabitScheduledForDay(habit, selectedDay));
  const selectedDate = new Date(2026, 9, 5 + selectedDay).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

  function openNewHabit() { setEditingId(null); setHabitName(""); setHabitIcon("sparkles"); setHabitCategory("Personal"); setHabitFrequency("Daily"); setHabitDays(getScheduleDaysForFrequency("Daily")); setShowForm(true); }
  function openEditHabit(habit: LifestyleHabit) { setEditingId(habit.id); setHabitName(habit.label); setHabitIcon(habit.icon); setHabitCategory(habit.category); setHabitFrequency(habit.frequency); setHabitDays(habit.scheduleDays); setShowForm(true); }
  function submitHabit(event: FormEvent) { event.preventDefault(); if (!habitName.trim() || (habitFrequency === "Custom" && !habitDays.length)) return; const scheduleDays = habitFrequency === "Custom" ? habitDays : getScheduleDaysForFrequency(habitFrequency); const habit = { label: habitName.trim(), icon: habitIcon, category: habitCategory, frequency: habitFrequency, scheduleDays, color: categories.find((category) => category.name === habitCategory)?.color ?? "#c7beb3" }; if (editingId) updateHabit(editingId, habit); else addHabit(habit); setShowForm(false); }

  return (
    <main className="app-shell lifestyle-shell">
      <aside className={`sidebar lifestyle-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src="/daylily-logo.png" alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, href, active }) => (
            <div key={label}>
              <Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>
              {label === "Lifestyle" && <div className="studio-subnav lifestyle-subnav"><Link href="/lifestyle/habits" className="active">Habits</Link><Link href="/lifestyle/mood">Mood</Link><Link href="/lifestyle/routines">Routines + Fitness</Link></div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-art-slot lifestyle-sidebar-art" aria-hidden="true">Floral collage</div>
        <Link className="profile-button" href="/"><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></Link>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <section className="lifestyle-workspace">
        <header className="lifestyle-header">
          <button className="mobile-menu lifestyle-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
          <div><h1>Lifestyle <Leaf size={32} /></h1><p>/ &nbsp;Habits</p></div>
          <p className="lifestyle-script">little steps,<br />lovely days ♡</p>
          <div className="lifestyle-actions"><button className="add-button" onClick={openNewHabit}><Plus size={20} /> New habit</button><button className="icon-button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Search size={20} /></button><Link className="icon-button" href="/planner/reminders" aria-label="Notifications"><Bell size={20} /></Link><button className="icon-button" onClick={() => { if (window.confirm("Reset the starter habit week?")) resetHabits(); }} aria-label="Reset habits"><Settings size={20} /></button></div>
        </header>

        <div className="lifestyle-tabs habit-module-tabs" role="tablist"><Link href="/lifestyle/habits" className="active">Today</Link><Link href="/lifestyle/habits/statistics">Statistics</Link><Link href="/lifestyle/habits/all">All habits</Link><Link href="/lifestyle/habits/categories">Categories</Link></div>
        {searchOpen && <label className="mood-search"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search habits..." /></label>}

        <div className="habits-dashboard">
          <section className="habits-main-card">
            <div className="habits-card-heading"><div><span className="section-kicker">{selectedDate}</span><h2>Habit tracker</h2></div><div className="heading-actions"><button onClick={() => setSelectedDay((day) => Math.max(0, day - 1))}><ChevronLeft size={18} /></button><button onClick={() => setSelectedDay(1)}>Today</button><button onClick={() => setSelectedDay((day) => Math.min(6, day + 1))}><ChevronRight size={18} /></button><button onClick={() => setSearchOpen((value) => !value)}><Ellipsis size={19} /></button></div></div>

            <div className="daily-progress-row">
              <div className="daily-summary"><div className="large-progress-ring"><span>{completedToday}<small>/ {scheduledHabits.length}</small></span></div><div><strong>Today’s progress</strong><span>{completedToday === scheduledHabits.length ? "All done — beautiful work ♡" : `${scheduledHabits.length - completedToday} habits left for today`}</span></div></div>
              <div className="week-rings">{weekdays.map((day, index) => { const amount = habits.filter((habit) => isHabitScheduledForDay(habit, index) && habit.history[index]).length; return <button key={day} className={selectedDay === index ? "selected" : ""} onClick={() => setSelectedDay(index)}><span className="mini-progress-ring"><i>{amount}</i></span><small>{day}</small></button>; })}</div>
            </div>

            <div className="today-habit-list">
              {todayHabits.map((habit) => (
                <div className="today-habit-row" key={habit.id}>
                  <span className="habit-color-icon" style={{ color: habit.color, background: `${habit.color}22` }}><HabitIcon type={habit.icon} /></span>
                  <div><strong>{habit.label}</strong><small>{habit.history.filter((checked, day) => checked && isHabitScheduledForDay(habit, day)).length} of {habit.scheduleDays.length} planned days</small></div>
                  <div className="habit-streak"><Flame size={15} /><span>{habit.streak} days</span></div>
                  <HabitCheck checked={habit.history[selectedDay]} onClick={() => toggleHabit(habit.id, selectedDay)} label={`${habit.label} on ${weekdays[selectedDay]}`} />
                </div>
              ))}
            </div>
          </section>

          <aside className="habits-side-column">
            <section className="habit-side-card weekly-goal-card"><div className="side-card-heading"><h2>This week</h2><button onClick={() => setPeriod(period === "This week" ? "Last week" : "This week")}>{period}</button></div><div className="weekly-score"><strong>{completion}%</strong><span>overall completion</span></div><div className="wide-progress"><i style={{ width: `${completion}%` }} /></div><p>You’re building a gentle rhythm. Keep going ♡</p></section>

            <section className="habit-side-card streak-card"><div className="side-card-heading"><h2>Best streak</h2><Flame size={20} /></div><strong>{bestHabit?.streak ?? 0} days</strong><span>{bestHabit?.label ?? "No habits yet"}</span><div className="streak-dots">{Array.from({ length: 12 }, (_, index) => <i key={index} className={index < Math.min(bestHabit?.streak ?? 0, 12) ? "active" : ""} />)}</div></section>

            <section className="habit-side-card mini-calendar-card"><div className="side-card-heading"><h2>October 2026</h2><CalendarDays size={19} /></div><div className="habit-mini-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="habit-mini-days">{Array.from({ length: 35 }, (_, index) => { const day = index - 3; return <span key={index} className={day > 0 && day < 6 ? "tracked" : day === 5 ? "today" : ""}>{day > 0 && day <= 31 ? day : ""}</span>; })}</div></section>
          </aside>
        </div>

        <div className="habit-stats-grid">
          <section className="habit-stat-card"><span className="stat-icon rose"><Flame /></span><div><small>Current streak</small><strong>12 days</strong><p>Your longest rhythm yet</p></div></section>
          <section className="habit-stat-card"><span className="stat-icon green"><TrendingUp /></span><div><small>Completion</small><strong>{completion}%</strong><p>Across all habits this week</p></div></section>
          <section className="habit-stat-card"><span className="stat-icon sand"><Flower2 /></span><div><small>Perfect days</small><strong>2 days</strong><p>Every habit completed</p></div></section>
          <section className="habit-stat-card"><span className="stat-icon pink"><Sparkles /></span><div><small>Most consistent</small><strong>Skincare</strong><p>6 check-ins this week</p></div></section>
        </div>

        <section className="all-habits-card"><div className="all-habits-heading"><div><h2>All habits</h2><p>Your routines at a glance</p></div><button onClick={openNewHabit}><Plus size={18} /> Create habit</button></div><div className="all-habits-grid">{visibleHabits.map((habit) => <article key={habit.id}><span style={{ color: habit.color, background: `${habit.color}22` }}><HabitIcon type={habit.icon} size={23} /></span><div><strong>{habit.label}</strong><small>{habit.category} · {habit.streak} day streak</small></div><button onClick={() => openEditHabit(habit)} aria-label={`Edit ${habit.label}`}><Pencil size={15} /></button><button onClick={() => removeHabit(habit.id)} aria-label={`Delete ${habit.label}`}><Trash2 size={15} /></button></article>)}</div></section>
      </section>
      {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal habit-form-modal" onSubmit={submitHabit} onMouseDown={(event) => event.stopPropagation()}><div><h2>{editingId ? "Edit habit" : "New habit"}</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div><label>Habit name<input required autoFocus value={habitName} onChange={(event) => setHabitName(event.target.value)} placeholder="e.g. Morning stretch" /></label><HabitIconPicker value={habitIcon} onChange={setHabitIcon} /><div className="modal-field-grid"><label>Category<select value={habitCategory} onChange={(event) => setHabitCategory(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label><label>Frequency<select value={habitFrequency} onChange={(event) => { const frequency = event.target.value; setHabitFrequency(frequency); if (frequency !== "Custom") setHabitDays(getScheduleDaysForFrequency(frequency)); }}>{habitFrequencyOptions.map((frequency) => <option key={frequency}>{frequency}</option>)}</select></label></div>{habitFrequency === "Custom" && <HabitDaysPicker value={habitDays} onChange={setHabitDays} />}<button className="modal-submit" disabled={habitFrequency === "Custom" && !habitDays.length}>{editingId ? <Pencil size={17} /> : <Plus size={17} />}{editingId ? "Save habit" : "Create habit"}</button></form></div>}
    </main>
  );
}
