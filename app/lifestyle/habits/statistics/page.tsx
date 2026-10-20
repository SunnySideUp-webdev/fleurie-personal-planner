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
  Home,
  Leaf,
  ListChecks,
  Menu,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { isHabitScheduledForDay, useHabitData } from "../../_data/use-habit-data";
import { HabitIcon } from "../../_components/habit-icon";

const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits", active: true },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const week = [
  { day: "W", date: 30 }, { day: "T", date: 1 }, { day: "F", date: 2 },
  { day: "S", date: 3 }, { day: "S", date: 4 }, { day: "M", date: 5 }, { day: "T", date: 6 },
];

export default function HabitStatisticsPage() {
  const [mobileNav, setMobileNav] = useState(false);
  const { habits, categories, toggleHabit } = useHabitData();
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const scheduledToday = habits.filter((habit) => isHabitScheduledForDay(habit, 6));
  const completed = scheduledToday.filter((habit) => habit.history[6]).length;
  const percentage = scheduledToday.length ? Math.round((completed / scheduledToday.length) * 100) : 0;
  const monthLabel = new Date(2026, 9 + monthOffset, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
  const categoryStats = categories.map((category) => {
    const items = habits.filter((habit) => habit.category === category.name);
    const done = items.reduce((sum, habit) => sum + habit.history.filter((checked, day) => checked && isHabitScheduledForDay(habit, day)).length, 0);
    const scheduled = items.reduce((sum, habit) => sum + habit.scheduleDays.length, 0);
    const value = scheduled ? Math.round(done / scheduled * 100) : 0;
    return { category: category.name, count: `${items.length} habits`, value, color: category.color };
  });

  return (
    <main className="app-shell habit-statistics-shell">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/daylily-logo.png`} alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, href, active }) => (
            <div key={label}>
              <Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>
              {label === "Lifestyle" && <div className="studio-subnav lifestyle-subnav"><Link href="/lifestyle/habits" className="active">Habits</Link><Link href="/lifestyle/mood">Mood</Link><Link href="/lifestyle/routines">Routines + Fitness</Link></div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-art-slot habit-statistics-sidebar-art" aria-hidden="true">Floral collage</div>
        <Link className="profile-button" href="/"><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></Link>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <section className="habit-statistics-workspace">
        <header className="habit-statistics-header">
          <button className="mobile-menu habit-statistics-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
          <div><h1>Lifestyle <Leaf size={32} /></h1><p>/ &nbsp;Habits</p></div>
          <div className="habit-statistics-actions"><Link className="add-button" href="/lifestyle/habits/all"><Plus size={20} /> Add habit</Link><Link className="icon-button" href="/lifestyle/habits/all" aria-label="Search"><Search size={20} /></Link><Link className="icon-button" href="/planner/reminders" aria-label="Notifications"><Bell size={20} /></Link><Link className="icon-button" href="/lifestyle/habits/categories" aria-label="Settings"><Settings size={20} /></Link></div>
        </header>

        <div className="lifestyle-tabs habit-module-tabs" role="tablist"><Link href="/lifestyle/habits">Today</Link><Link href="/lifestyle/habits/statistics" className="active">Statistics</Link><Link href="/lifestyle/habits/all">All habits</Link><Link href="/lifestyle/habits/categories">Categories</Link></div>

        <div className="statistics-layout">
          <div className="statistics-main-column">
            <section className="statistics-hero">
              <div className="statistics-floral-slot" aria-hidden="true">Floral banner</div>
              <div className="hero-paper-note">small habits<br />big changes ♡</div>
              <div className="hero-progress"><h2>Today’s progress</h2><div><span className="hero-ring"><i /></span><strong>{completed} / {scheduledToday.length}<small>{percentage}%</small></strong></div></div>
              <p>“Progress, not<br />perfection” ♡</p>
            </section>

            <section className="weekly-statistics-card">
              <div className="weekly-statistics-heading"><div><button onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft size={18} /></button><h2>{weekOffset === 0 ? "October 5–11, 2026" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}</h2><button onClick={() => setWeekOffset((value) => value + 1)}><ChevronRight size={18} /></button></div><div><button onClick={() => setWeekOffset(0)}>Today</button><Link href="/lifestyle/habits"><CalendarDays size={18} /></Link></div></div>
              <div className="habit-matrix">
                <div className="matrix-heading habit-name-heading">Habit</div>
                {week.map((item, index) => <div key={index} className={`matrix-heading ${index === 6 ? "today" : ""}`}><span>{item.day}</span><small>{item.date}</small></div>)}
                <div className="matrix-heading streak-heading">Streak</div><div className="matrix-heading" />
                {habits.map((habit) => (
                  <div className="matrix-row" key={habit.id}>
                    <div className="matrix-habit-name"><HabitIcon type={habit.icon} /><strong>{habit.label}</strong></div>
                    {habit.history.slice(0,7).map((checked, day) => { const scheduled = isHabitScheduledForDay(habit, day); return <div key={day} className={day === 6 ? "today-column" : ""}><button disabled={!scheduled} className={`matrix-check ${checked && scheduled ? "checked" : ""} ${!scheduled ? "unscheduled" : ""}`} onClick={() => toggleHabit(habit.id, day)} aria-label={`${habit.label}, day ${day + 1}`}>{checked && scheduled && <Check size={15} />}</button></div>; })}
                    <div className="matrix-streak"><span>{habit.streak} days</span>{habit.streak > 10 && <Flame size={15} />}</div><Link className="matrix-more" href="/lifestyle/habits/all"><Ellipsis size={17} /></Link>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="statistics-side-column">
            <section className="statistics-side-card streaks-overview"><div className="statistics-side-title"><h2>Current streaks</h2><Link href="/lifestyle/habits/all">View all →</Link></div><div className="streak-cards">{[...habits].sort((a,b) => b.streak - a.streak).slice(0,3).map((habit,index) => <article key={habit.id}><HabitIcon type={habit.icon} /><span>{habit.label}</span><strong>{habit.streak} days</strong>{index === 0 && <Flame />}</article>)}</div></section>

            <section className="statistics-side-card month-overview"><div className="statistics-side-title"><h2>This month</h2><div><span>{monthLabel}</span><button onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month"><ChevronLeft size={17} /></button><button onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month"><ChevronRight size={17} /></button></div></div><div className="month-dot-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="month-dot-grid">{Array.from({ length: 35 }, (_, index) => { const day = index - 3; const level = day > 0 && day <= 31 ? (day % 4) + 1 : 0; return <span key={index} className={`level-${level} ${monthOffset === 0 && day === 6 ? "selected" : ""}`}><i />{day > 0 && day <= 31 ? day : ""}</span>; })}</div></section>

            <section className="statistics-side-card categories-overview"><div className="statistics-side-title"><h2>Habit categories</h2><Link href="/lifestyle/habits/categories">View all →</Link></div>{categoryStats.map(({ category, count, value, color }) => <div className="category-progress-row" key={category}><i style={{ background: color }} /><span>{category}</span><div><b style={{ width: `${value}%`, background: color }} /></div><small>{count}</small></div>)}</section>
          </aside>
        </div>
      </section>
    </main>
  );
}
