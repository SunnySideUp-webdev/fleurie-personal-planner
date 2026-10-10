"use client";

import Link from "next/link";
import {
  Bell, BookOpen, CalendarDays, CircleDollarSign, Flower2, Heart, Home, Leaf,
  ListChecks, Menu, NotebookPen, Plus, Search, Settings, Shirt, Sparkles, Trash2, X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { MoodValue, useMoodData } from "../_data/use-mood-data";
import { usePlannerData } from "../../planner/_data/use-planner-data";

const navigation = [
  { label: "Today", icon: Home, href: "/" }, { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits", active: true }, { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" }, { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];
const moodLabels = ["Awful", "Bad", "Okay", "Good", "Amazing"];
const moodColors = ["#e5d4c9", "#efc4c2", "#d8c3b3", "#aeb078", "#ced0b8"];

function MoodFace({ mood }: { mood: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    {mood === 0 && <><path d="M12 17.5 17 15M31 15l5 2.5" {...common} /><path d="M15 21v1M33 21v1" {...common} /><path d="M15 36c1.8-6 6.1-9 9-9s7.2 3 9 9" {...common} /></>}
    {mood === 1 && <><circle cx="16" cy="20" r="2.2" fill="currentColor" /><circle cx="32" cy="20" r="2.2" fill="currentColor" /><path d="M14.5 35c2.6-5.1 6.4-7.4 9.5-7.4s6.9 2.3 9.5 7.4" {...common} /></>}
    {mood === 2 && <><circle cx="16" cy="19.5" r="2.2" fill="currentColor" /><circle cx="32" cy="19.5" r="2.2" fill="currentColor" /><path d="M16 32h16" {...common} /></>}
    {mood === 3 && <><circle cx="16" cy="19" r="2.2" fill="currentColor" /><circle cx="32" cy="19" r="2.2" fill="currentColor" /><path d="M14.5 28c2.7 5.2 6.5 7.2 9.5 7.2s6.8-2 9.5-7.2" {...common} /></>}
    {mood === 4 && <><path d="M12.5 19c1.6-2.3 5.4-2.3 7 0M28.5 19c1.6-2.3 5.4-2.3 7 0" {...common} /><path d="M13.5 27.5c2 6.4 6.2 9.4 10.5 9.4s8.5-3 10.5-9.4Z" fill="#27251f" stroke="#27251f" strokeWidth="1.6" strokeLinejoin="round" /><path d="M19 33.8c3.2-1.4 6.8-1.4 10 0" stroke="#ebb4b2" strokeWidth="2" strokeLinecap="round" /></>}
  </svg>;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function MoodPage() {
  const { entries, todayKey, todayMood, todayNote, setMoodForDate, setNoteForDate, removeEntry } = useMoodData();
  const { data } = usePlannerData();
  const [mobileNav, setMobileNav] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [formDate, setFormDate] = useState(todayKey);
  const [formMood, setFormMood] = useState<MoodValue>(todayMood);
  const [formNote, setFormNote] = useState(todayNote);
  const [activeView, setActiveView] = useState<"overview" | "calendar" | "insights" | "history">("overview");

  const recentDays = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(2026, 9, 6 - (6 - index)); return { date, key: dateKey(date), entry: entries.find((item) => item.date === dateKey(date)) }; }), [entries]);
  const sortedEntries = useMemo(() => [...entries].filter((entry) => entry.note.toLowerCase().includes(query.toLowerCase()) || moodLabels[entry.mood].toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)), [entries, query]);
  const average = entries.length ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length : 2;
  const commonMood = entries.length ? [0,1,2,3,4].sort((a,b) => entries.filter((entry) => entry.mood === b).length - entries.filter((entry) => entry.mood === a).length)[0] : 2;
  const positiveDays = entries.filter((entry) => entry.mood >= 3).length;
  const activeReminders = data.reminders.filter((item) => item.enabled && !item.completed);

  function openCheckIn(date = todayKey) {
    const existing = entries.find((entry) => entry.date === date);
    setFormDate(date); setFormMood(existing?.mood ?? 2); setFormNote(existing?.note ?? ""); setShowForm(true);
  }

  function saveCheckIn(event: FormEvent) {
    event.preventDefault(); setMoodForDate(formDate, formMood); setNoteForDate(formDate, formNote.trim()); setShowForm(false);
  }

  return <main className="app-shell mood-shell">
    <aside className={`sidebar lifestyle-sidebar ${mobileNav ? "is-open" : ""}`}>
      <div className="brand-row"><img className="brand-logo" src="/daylily-logo.png" alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div>
      <nav aria-label="Main navigation">{navigation.map(({ label, icon: Icon, href, active }) => <div key={label}><Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>{label === "Lifestyle" && <div className="studio-subnav lifestyle-subnav"><Link href="/lifestyle/habits">Habits</Link><Link href="/lifestyle/mood" className="active">Mood</Link><Link href="/lifestyle/routines">Routines + Fitness</Link></div>}</div>)}</nav>
      <div className="sidebar-art-slot lifestyle-sidebar-art" aria-hidden="true">Floral collage</div><Link className="profile-button" href="/"><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></Link>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

    <section className="mood-workspace">
      <header className="lifestyle-header mood-header"><button className="mobile-menu lifestyle-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button><div><h1>Lifestyle <Flower2 size={32} /></h1><p>/ &nbsp;Mood</p></div><p className="lifestyle-script">make room for<br />every feeling ♡</p><div className="lifestyle-actions"><button className="add-button" onClick={() => openCheckIn()}><Plus size={20} /> Check in</button><button className="icon-button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Search size={20} /></button><button className="icon-button" onClick={() => setNotificationsOpen((value) => !value)} aria-label="Notifications"><Bell size={20} /></button><Link className="icon-button" href="/planner/reminders" aria-label="Settings"><Settings size={20} /></Link>{notificationsOpen && <div className="calendar-header-panel notifications mood-header-panel"><strong>Notifications</strong>{activeReminders.slice(0,3).map((item) => <Link href="/planner/reminders" key={item.id}><Bell size={14} /><span>{item.title}<small>{item.date} · {item.time}</small></span></Link>)}</div>}</div></header>
      <div className="lifestyle-tabs mood-module-tabs" role="tablist" aria-label="Mood views">
        {([['overview','Overview'],['calendar','Calendar'],['insights','Insights'],['history','History']] as const).map(([view,label]) => <button type="button" role="tab" aria-selected={activeView === view} className={activeView === view ? "active" : ""} onClick={() => setActiveView(view)} key={view}>{label}</button>)}
      </div>
      {searchOpen && <label className="mood-search"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes or moods..." /></label>}

      {(activeView === "overview" || activeView === "history") && <section className="mood-checkin-card lifestyle-panel">
        <div><span className="section-kicker">TODAY’S CHECK-IN</span><h2>How are you feeling?</h2><p>There is no wrong answer here.</p></div>
        <div className="mood-checkin-options">{moodLabels.map((label, mood) => <button className={todayMood === mood ? "selected" : ""} onClick={() => setMoodForDate(todayKey, mood as MoodValue)} key={label}><span style={{ background: moodColors[mood] }}><MoodFace mood={mood} /></span><small>{todayMood === mood ? label : ""}</small></button>)}</div>
        <label><NotebookPen size={18} /><textarea value={todayNote} onChange={(event) => setNoteForDate(todayKey, event.target.value)} placeholder="A little note about today..." /></label>
      </section>}

      <div className="mood-dashboard-grid">
        {(activeView === "overview" || activeView === "history") && <section className="lifestyle-panel mood-week-card"><div className="lifestyle-panel-heading"><h2><Heart size={19} /> This week</h2><span>{positiveDays} positive days</span></div><div className="mood-week-strip">{recentDays.map(({ date, key, entry }) => <button className={key === todayKey ? "today" : ""} onClick={() => openCheckIn(key)} key={key}><small>{date.toLocaleDateString("en", { weekday: "short" })}</small><span style={{ background: entry ? moodColors[entry.mood] : "#eee7dd" }}>{entry ? <MoodFace mood={entry.mood} /> : <Plus />}</span><b>{date.getDate()}</b></button>)}</div></section>}
        {(activeView === "overview" || activeView === "insights") && <section className="lifestyle-panel mood-patterns-card"><div className="lifestyle-panel-heading"><h2><Sparkles size={19} /> Gentle patterns</h2></div><div className="mood-pattern-grid"><article><strong>{average.toFixed(1)}</strong><span>average mood</span></article><article><strong>{moodLabels[commonMood]}</strong><span>most common</span></article><article><strong>{positiveDays}</strong><span>good days</span></article><article><strong>{entries.length}</strong><span>check-ins</span></article></div></section>}
        {(activeView === "overview" || activeView === "calendar") && <section className="lifestyle-panel mood-calendar-card"><div className="lifestyle-panel-heading"><h2><CalendarDays size={19} /> October 2026</h2><span>Monthly view</span></div><div className="mood-calendar-weekdays">{["S","M","T","W","T","F","S"].map((day,index) => <b key={`${day}-${index}`}>{day}</b>)}</div><div className="mood-calendar-days">{Array.from({ length: 35 }, (_, index) => { const day = index - 3; const key = day > 0 && day <= 31 ? `2026-10-${String(day).padStart(2,"0")}` : ""; const entry = entries.find((item) => item.date === key); return key ? <button onClick={() => openCheckIn(key)} key={key}><span>{day}</span>{entry && <i style={{ background: moodColors[entry.mood] }}><MoodFace mood={entry.mood} /></i>}</button> : <i key={index} />; })}</div></section>}
        {(activeView === "overview" || activeView === "history") && <section className="lifestyle-panel mood-history-card"><div className="lifestyle-panel-heading"><h2><BookOpen size={19} /> Mood history</h2><button onClick={() => openCheckIn()}><Plus size={15} /> Add</button></div><div className="mood-history-list">{sortedEntries.map((entry) => <article key={entry.date}><button className="history-mood" onClick={() => openCheckIn(entry.date)} style={{ background: moodColors[entry.mood] }}><MoodFace mood={entry.mood} /></button><div><strong>{moodLabels[entry.mood]}</strong><span>{new Date(`${entry.date}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span><p>{entry.note || "No note for this day."}</p></div><button className="row-action" onClick={() => removeEntry(entry.date)} aria-label={`Delete ${entry.date}`}><Trash2 size={15} /></button></article>)}</div></section>}
      </div>
    </section>

    {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal mood-modal" onSubmit={saveCheckIn} onMouseDown={(event) => event.stopPropagation()}><div><h2>Mood check-in</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div><label>Date<input type="date" value={formDate} onChange={(event) => { const date = event.target.value; const existing = entries.find((entry) => entry.date === date); setFormDate(date); setFormMood(existing?.mood ?? 2); setFormNote(existing?.note ?? ""); }} /></label><div className="modal-mood-options">{moodLabels.map((label,mood) => <button type="button" className={formMood === mood ? "selected" : ""} onClick={() => setFormMood(mood as MoodValue)} key={label}><span style={{ background: moodColors[mood] }}><MoodFace mood={mood} /></span><small>{label}</small></button>)}</div><label>Note<textarea value={formNote} onChange={(event) => setFormNote(event.target.value)} placeholder="How did this day feel?" /></label><button className="modal-submit"><CheckIcon /> Save check-in</button></form></div>}
  </main>;
}

function CheckIcon() { return <span aria-hidden="true">✓</span>; }
