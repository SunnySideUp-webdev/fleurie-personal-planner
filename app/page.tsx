"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import Link from "next/link";
import {
  Bell, BookOpen, CalendarDays, Check, CircleDollarSign, Dumbbell, Ellipsis,
  Flower2, Heart, Home, ImagePlus, Leaf, ListChecks, Menu, NotebookPen,
  PiggyBank, Plus, Settings, Shirt, Target, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isHabitScheduledForDay, useHabitData } from "./lifestyle/_data/use-habit-data";
import { HabitIcon } from "./lifestyle/_components/habit-icon";
import { useMoodData } from "./lifestyle/_data/use-mood-data";
import { useRoutineData } from "./lifestyle/_data/use-routine-data";
import { useMoneyData } from "./money/_data/use-money-data";
import { initialCalendarEvents, type CalendarEvent } from "./planner/_data/calendar-events";
import { usePlannerData } from "./planner/_data/use-planner-data";
import { OutfitMiniature, type OutfitMiniatureItem } from "./studio/_components/outfit-miniature";
import { type OutfitCanvasElement, type OutfitPlacement, useStudioData } from "./studio/_data/use-studio-data";

type MoodExpression = "awful" | "bad" | "okay" | "good" | "amazing";
type TodayOutfit = {
  name: string;
  occasion: string;
  notes: string;
  items: OutfitMiniatureItem[];
  placements: OutfitPlacement[];
  canvasElements: OutfitCanvasElement[];
};
type StoredTodayOutfit = Partial<TodayOutfit> & { outfitId?: string; assignedDate?: string; savedAt?: string };

const navItems = [
  { label: "Today", icon: Home, href: "/", active: true },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const moodOptions: { label: string; expression: MoodExpression }[] = [
  { label: "Awful", expression: "awful" }, { label: "Bad", expression: "bad" },
  { label: "Okay", expression: "okay" }, { label: "Good", expression: "good" },
  { label: "Amazing", expression: "amazing" },
];

const reminderLabels = ["Be proud of how far you’ve come", "Small steps still count", "You are doing enough"];

function CardTitle({ icon: Icon, children }: { icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) {
  return <div className="card-title"><Icon size={22} /><h2>{children}</h2></div>;
}

function MoodFace({ expression }: { expression: MoodExpression }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    {expression === "awful" && <><path d="M12 17.5 17 15M31 15l5 2.5" {...common} /><path d="M15 21v1M33 21v1" {...common} /><path d="M15 36c1.8-6 6.1-9 9-9s7.2 3 9 9" {...common} /></>}
    {expression === "bad" && <><circle cx="16" cy="20" r="2.2" fill="currentColor" /><circle cx="32" cy="20" r="2.2" fill="currentColor" /><path d="M14.5 35c2.6-5.1 6.4-7.4 9.5-7.4s6.9 2.3 9.5 7.4" {...common} /></>}
    {expression === "okay" && <><circle cx="16" cy="19.5" r="2.2" fill="currentColor" /><circle cx="32" cy="19.5" r="2.2" fill="currentColor" /><path d="M16 32h16" {...common} /></>}
    {expression === "good" && <><circle cx="16" cy="19" r="2.2" fill="currentColor" /><circle cx="32" cy="19" r="2.2" fill="currentColor" /><path d="M14.5 28c2.7 5.2 6.5 7.2 9.5 7.2s6.8-2 9.5-7.2" {...common} /></>}
    {expression === "amazing" && <><path d="M12.5 19c1.6-2.3 5.4-2.3 7 0M28.5 19c1.6-2.3 5.4-2.3 7 0" {...common} /><path d="M13.5 27.5c2 6.4 6.2 9.4 10.5 9.4s8.5-3 10.5-9.4Z" fill="#27251f" stroke="#27251f" strokeWidth="1.6" strokeLinejoin="round" /><path d="M19 33.8c3.2-1.4 6.8-1.4 10 0" stroke="#ebb4b2" strokeWidth="2" strokeLinecap="round" /></>}
  </svg>;
}

function RoundCheck({ checked, onClick, label, disabled = false }: { checked: boolean; onClick?: () => void; label: string; disabled?: boolean }) {
  return <button disabled={disabled} className={`round-check ${checked ? "is-checked" : ""} ${disabled ? "unscheduled" : ""}`} onClick={onClick} aria-label={label} aria-pressed={checked}>{checked && !disabled && <Check size={14} strokeWidth={2.4} />}</button>;
}

function CardMenu({ name, open, setOpen, children }: { name: string; open: string | null; setOpen: (name: string | null) => void; children: React.ReactNode }) {
  return <div className="module-menu-wrap today-card-menu"><button className="row-action" onClick={() => setOpen(open === name ? null : name)} aria-label="Card options"><Ellipsis size={20} /></button>{open === name && <div className="module-popover today-card-popover">{children}</div>}</div>;
}

function formatEventTime(value: number) {
  const hour = Math.floor(value); const minute = value % 1 ? "30" : "00";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export default function TodayPage() {
  const { data, addTask, toggleTask, toggleNotificationSetting } = usePlannerData();
  const { habits, toggleHabit, resetHabits } = useHabitData();
  const { todayKey, todayMood, todayNote, setMoodForDate, setNoteForDate } = useMoodData();
  const { activeWorkout, exercises, workoutActive, toggleExercise, toggleWorkout } = useRoutineData();
  const { goals, updateGoal } = useMoneyData();
  const { closet: studioCloset, outfits: studioOutfits } = useStudioData();
  const [littleReminders, setLittleReminders] = useState([false, false, false]);
  const [journal, setJournal] = useState("");
  const [journalImage, setJournalImage] = useState("");
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [assignedTodayOutfit, setAssignedTodayOutfit] = useState<StoredTodayOutfit | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [headerPanel, setHeaderPanel] = useState<"notifications" | "settings" | null>(null);
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null);
  const [taskModal, setTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const journalSaveLock = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("planner-today-v2");
      if (stored) {
        const savedToday = JSON.parse(stored);
        if (Array.isArray(savedToday.littleReminders)) setLittleReminders(savedToday.littleReminders);
        if (typeof savedToday.journal === "string") setJournal(savedToday.journal);
        if (typeof savedToday.journalImage === "string") setJournalImage(savedToday.journalImage);
      }
      const savedCalendar = window.localStorage.getItem("noa-calendar-data-v1");
      if (savedCalendar) {
        const parsed = JSON.parse(savedCalendar) as { events?: CalendarEvent[] };
        if (parsed.events) setCalendarEvents(parsed.events);
      }
      const savedOutfit = window.localStorage.getItem("noa-today-outfit-v1");
      if (savedOutfit) {
        const parsedOutfit = JSON.parse(savedOutfit) as StoredTodayOutfit;
        const assignmentDate = parsedOutfit.assignedDate;
        if (!assignmentDate || assignmentDate === todayKey) setAssignedTodayOutfit(parsedOutfit);
      }
    } catch {
      // Keep the friendly starter state when saved data is unavailable.
    }
    setReady(true);
  }, [todayKey]);

  useEffect(() => {
    if (!ready) return;
    setLocalStorageItem("planner-today-v2", JSON.stringify({ littleReminders, journal, journalImage }));
  }, [ready, littleReminders, journal, journalImage]);

  const currentDate = new Date();
  const weekday = ((currentDate.getDay() + 6) % 7) + 1;
  const dateLabel = currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();
  const greeting = currentDate.getHours() < 12 ? "Good morning" : currentDate.getHours() < 18 ? "Good afternoon" : "Good evening";
  const todayTasks = data.tasks.filter((task) => task.bucket === "Today").slice(0, 4);
  const agenda = calendarEvents.filter((event) => event.week === 0 && event.day === weekday).sort((a, b) => a.start - b.start);
  const scheduledTodayHabits = useMemo(() => habits.filter((habit) => isHabitScheduledForDay(habit, weekday - 1)), [habits, weekday]);
  const habitProgress = useMemo(() => scheduledTodayHabits.filter((habit) => habit.history[weekday - 1]).length, [scheduledTodayHabits, weekday]);
  const exerciseProgress = exercises.filter((exercise) => exercise.done).length;
  const activeReminders = data.reminders.filter((item) => item.enabled && !item.completed);
  const todayOutfit = useMemo<TodayOutfit | null>(() => {
    const outfitPreview = (outfit: (typeof studioOutfits)[number]): TodayOutfit => ({
      name: outfit.name,
      occasion: outfit.occasion,
      notes: outfit.notes,
      placements: outfit.placements,
      canvasElements: outfit.canvasElements ?? [],
      items: outfit.itemIds
        .map((itemId) => studioCloset.find((item) => item.id === itemId))
        .filter((item): item is (typeof studioCloset)[number] => Boolean(item))
        .map(({ id, label, kind, color, imageDataUrl }) => ({ id, label, kind, color, imageDataUrl })),
    });

    if (assignedTodayOutfit?.outfitId) {
      const assigned = studioOutfits.find((outfit) => outfit.id === assignedTodayOutfit.outfitId);
      if (assigned) return outfitPreview(assigned);
    }

    if (assignedTodayOutfit && typeof assignedTodayOutfit.name === "string" && Array.isArray(assignedTodayOutfit.items)) {
      return {
        name: assignedTodayOutfit.name,
        occasion: assignedTodayOutfit.occasion ?? "Everyday",
        notes: assignedTodayOutfit.notes ?? "",
        items: assignedTodayOutfit.items,
        placements: assignedTodayOutfit.placements ?? [],
        canvasElements: assignedTodayOutfit.canvasElements ?? [],
      };
    }

    const datedOutfit = studioOutfits
      .filter((outfit) => outfit.date === todayKey)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))[0];
    return datedOutfit ? outfitPreview(datedOutfit) : null;
  }, [assignedTodayOutfit, studioCloset, studioOutfits, todayKey]);
  const featuredGoal = goals.find((goal) => goal.favorite) ?? goals[0];
  const featuredGoalProgress = featuredGoal
    ? Math.min(100, Math.round((featuredGoal.current / featuredGoal.target) * 100))
    : 0;

  function submitQuickTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({ title: taskTitle.trim(), bucket: "Today", due: "Today", category: "Personal", priority: "Medium" });
    setTaskTitle(""); setTaskModal(false); setAddOpen(false);
  }

  function saveJournal() {
    if (journalSaveLock.current || (!journal.trim() && !journalImage)) return;
    journalSaveLock.current = true;
    const entries = JSON.parse(window.localStorage.getItem("noa-quick-journal-v1") ?? "[]") as unknown[];
    const quickEntry = { id: crypto.randomUUID(), text: journal.trim(), imageName: journalImage, mood: moodOptions[todayMood].label, createdAt: new Date().toISOString() };
    entries.push(quickEntry);
    setLocalStorageItem("noa-quick-journal-v1", JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent("noa-quick-journal-added", { detail: quickEntry }));
    setJournal(""); setJournalImage(""); setSaved(true);
    window.setTimeout(() => { setSaved(false); journalSaveLock.current = false; }, 1800);
  }

  return (
    <main className="app-shell today-functional">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/daylily-logo.png`} alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Main navigation">{navItems.map(({ label, icon: Icon, href, active }) => <Link key={label} href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>)}</nav>
        <div className="sidebar-art-slot" aria-hidden="true"><span>Floral collage</span></div>
        <div className="profile-menu-wrap"><button className="profile-button" onClick={() => setProfileOpen((value) => !value)}><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></button>{profileOpen && <div className="profile-popover"><strong>Sunny’s planner</strong><small>Your changes are saved automatically on this device.</small><Link href="/planner/planning">Open planning</Link></div>}</div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <section className="workspace">
        <header className="page-header">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
          <div className="greeting"><p className="eyebrow">{dateLabel}</p><h1>{greeting},<br /><strong>Sunny</strong> <Heart className="headline-heart" /></h1></div>
          <p className="handwritten header-note">same girl<br />brighter days ♡</p><div className="header-art-slot" aria-hidden="true" />
          <div className="header-actions">
            <div className="add-wrapper"><button className="add-button" onClick={() => setAddOpen((open) => !open)} aria-expanded={addOpen}><Plus size={21} /> Add</button>{addOpen && <div className="add-menu"><button onClick={() => setTaskModal(true)}>Task</button><Link href="/planner/calendar">Event</Link><Link href="/money">Expense</Link><Link href="/lifestyle/habits">Habit</Link><Link href="/journal">Journal entry</Link><Link href="/studio/outfits">Outfit</Link><Link href="/planner/reminders">Reminder</Link></div>}</div>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "notifications" ? null : "notifications")} aria-label="Notifications"><Bell size={21} /></button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "settings" ? null : "settings")} aria-label="Settings"><Settings size={21} /></button>
            {headerPanel === "notifications" && <div className="calendar-header-panel notifications today-header-panel"><strong>Notifications</strong>{activeReminders.slice(0, 4).map((item) => <Link href="/planner/reminders" key={item.id}><Bell size={15} /><span>{item.title}<small>{item.date}{item.time ? ` · ${item.time}` : ""}</small></span></Link>)}{!activeReminders.length && <small>You’re all caught up.</small>}<Link href="/planner/reminders">View all reminders</Link></div>}
            {headerPanel === "settings" && <div className="calendar-header-panel settings today-header-panel"><strong>Today settings</strong><label><span>Morning summary</span><button className={`reminder-toggle ${data.notificationSettings.morning ? "on" : ""}`} onClick={() => toggleNotificationSetting("morning")}><i /></button></label><label><span>Evening check-in</span><button className={`reminder-toggle ${data.notificationSettings.evening ? "on" : ""}`} onClick={() => toggleNotificationSetting("evening")}><i /></button></label><Link href="/planner/reminders">Manage reminders</Link></div>}
          </div>
        </header>

        <div className="dashboard-grid">
          <article className="card mood-card"><div className="card-heading"><CardTitle icon={Flower2}>How are you feeling today?</CardTitle><CardMenu name="mood" open={openCardMenu} setOpen={setOpenCardMenu}><Link href="/lifestyle/mood">Open mood history</Link><button onClick={() => { setMoodForDate(todayKey, 2); setNoteForDate(todayKey, ""); setOpenCardMenu(null); }}>Reset mood</button></CardMenu></div><div className="moods" role="group" aria-label="Choose today’s mood">{moodOptions.map((option, index) => <button key={option.label} className={`mood-choice ${todayMood === index ? "selected" : ""}`} onClick={() => setMoodForDate(todayKey, index as 0 | 1 | 2 | 3 | 4)} aria-label={option.label} aria-pressed={todayMood === index}><span className={`mood-face mood-${index}`}><MoodFace expression={option.expression} /></span><span className="mood-label">{option.label}</span></button>)}</div><label className="mood-note handwritten"><textarea value={todayNote} onChange={(event) => setNoteForDate(todayKey, event.target.value)} aria-label="Mood note" placeholder="Add a little note..." /><NotebookPen size={17} /></label></article>

          <article className="card focus-card"><div className="card-heading"><CardTitle icon={Target}>Today’s focus</CardTitle><CardMenu name="focus" open={openCardMenu} setOpen={setOpenCardMenu}><button onClick={() => { setTaskModal(true); setOpenCardMenu(null); }}>Add task</button><Link href="/planner/tasks">View all tasks</Link></CardMenu></div><div className="task-list">{todayTasks.length ? todayTasks.map((task) => <div className="task-row" key={task.id}><RoundCheck checked={task.completed} onClick={() => toggleTask(task.id)} label={`${task.completed ? "Uncheck" : "Check"} ${task.title}`} /><span className={task.completed ? "task-done" : ""}>{task.title}</span></div>) : <p className="today-empty-copy">Nothing urgent today ♡</p>}<button className="inline-add" onClick={() => setTaskModal(true)}><Plus size={19} /> Add task</button></div></article>

          <article className="card agenda-card"><div className="card-heading"><CardTitle icon={CalendarDays}>Today</CardTitle><CardMenu name="agenda" open={openCardMenu} setOpen={setOpenCardMenu}><Link href="/planner/calendar">Open calendar</Link></CardMenu></div><div className="agenda-list">{agenda.length ? agenda.map((item) => <Link href="/planner/calendar" className="agenda-row" key={item.id}><time>{formatEventTime(item.start)}</time><span className={`event-dot ${item.tone === "pink" ? "rose" : "olive"}`} /><span>{item.title}</span></Link>) : <div className="agenda-empty"><span>No events today.</span><Link href="/planner/calendar">Add one</Link></div>}</div></article>

          <article className="card habits-card"><div className="card-heading"><CardTitle icon={Leaf}>Habit tracker</CardTitle><CardMenu name="habits" open={openCardMenu} setOpen={setOpenCardMenu}><Link href="/lifestyle/habits">Open Lifestyle</Link><button onClick={() => { resetHabits(); setOpenCardMenu(null); }}>Reset week</button></CardMenu></div><div className="habit-head"><span>{habitProgress} / {scheduledTodayHabits.length}</span>{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="habit-list">{habits.map((habit) => <div className="habit-row" key={habit.id}><span className="habit-name"><span className="habit-icon"><HabitIcon type={habit.icon} /></span>{habit.label}</span>{habit.history.map((checked, day) => <RoundCheck key={day} checked={checked} disabled={!isHabitScheduledForDay(habit, day)} onClick={() => toggleHabit(habit.id, day)} label={`${habit.label}, day ${day + 1}`} />)}</div>)}</div></article>

          <article className="card outfit-card"><div className="card-heading"><CardTitle icon={Shirt}>Today’s outfit</CardTitle><div className="outfit-heading-actions">{assignedTodayOutfit && todayOutfit && <button onClick={() => { window.localStorage.removeItem("noa-today-outfit-v1"); setAssignedTodayOutfit(null); }} aria-label="Remove today’s outfit">×</button>}<Link href="/studio/outfits" aria-label="Open Studio">↗</Link></div></div>{todayOutfit ? <Link href="/studio/outfits" className="today-outfit-preview"><OutfitMiniature className="today-outfit-canvas" items={todayOutfit.items} placements={todayOutfit.placements} canvasElements={todayOutfit.canvasElements} /><strong>{todayOutfit.name}</strong><span>{todayOutfit.occasion} · {todayOutfit.items.length} pieces</span>{todayOutfit.notes && <small>{todayOutfit.notes}</small>}</Link> : <div className="outfit-empty"><Shirt size={43} strokeWidth={1.35} /><strong>No outfit assigned yet</strong><span>Your look from Studio will appear here.</span><Link className="today-pill-link" href="/studio/outfits">Open Studio</Link></div>}</article>

          <article className={`card workout-card ${workoutActive ? "active-workout" : ""}`}><div className="card-heading"><CardTitle icon={Dumbbell}>Workout</CardTitle><div className="workout-heading-actions"><Link href="/lifestyle/routines" aria-label="Open fitness">↗</Link><button className="play-button" onClick={toggleWorkout} aria-label={workoutActive ? "Pause workout" : "Start workout"}>{workoutActive ? "Ⅱ" : "▶"}</button></div></div><div className="workout-summary"><strong>{activeWorkout?.name ?? "Workout"}</strong><span>{exerciseProgress} / {exercises.length} exercises</span></div><div className="progress"><span style={{ width: `${exercises.length ? exerciseProgress / exercises.length * 100 : 0}%` }} /></div><div className="exercise-list">{exercises.length ? exercises.map((exercise) => <div className="exercise-row" key={exercise.id}><RoundCheck checked={exercise.done} onClick={() => toggleExercise(exercise.id)} label={exercise.label} /><span>{exercise.label}</span><small>{exercise.reps}</small></div>) : <p className="today-empty-copy">Add exercises from Routines + Fitness.</p>}</div></article>

          <article className="card savings-card"><div className="card-heading"><CardTitle icon={PiggyBank}>Savings</CardTitle>{featuredGoal && <button className={`favorite-button ${featuredGoal.favorite ? "active" : ""}`} onClick={() => updateGoal(featuredGoal.id, { favorite: !featuredGoal.favorite })} aria-label={featuredGoal.favorite ? "Remove savings goal from favorites" : "Add savings goal to favorites"} title={featuredGoal.favorite ? "Remove from favorites" : "Add to favorites"}><Heart size={19} fill={featuredGoal.favorite ? "currentColor" : "none"} /></button>}</div>{featuredGoal ? <Link href="/money/savings" className="savings-content"><div className={`product-placeholder ${featuredGoal.imageDataUrl ? "with-image" : ""}`}>{featuredGoal.imageDataUrl ? <img src={featuredGoal.imageDataUrl} alt={featuredGoal.name} /> : <CircleDollarSign size={29} />}</div><div className="savings-detail"><strong>{featuredGoal.name}</strong><span>Q{featuredGoal.current.toLocaleString()} / Q{featuredGoal.target.toLocaleString()}</span><div className="savings-line"><div className="progress"><span style={{ width: `${featuredGoalProgress}%` }} /></div><small>{featuredGoalProgress}%</small></div></div></Link> : <Link href="/money/savings" className="savings-empty">Create a savings goal</Link>}</article>

          <article className="card journal-card"><div className="card-heading"><CardTitle icon={NotebookPen}>Quick journal</CardTitle><CardMenu name="journal" open={openCardMenu} setOpen={setOpenCardMenu}><Link href="/journal">Open Journal</Link><button onClick={() => { setJournal(""); setJournalImage(""); setOpenCardMenu(null); }}>Clear draft</button></CardMenu></div><div className="journal-entry"><textarea value={journal} onChange={(event) => setJournal(event.target.value)} placeholder="What’s on your mind today?" aria-label="Quick journal entry" /><div><label className="journal-image-button" htmlFor="quick-journal-image" title={journalImage || "Attach image"}><ImagePlus size={20} />{journalImage && <small>{journalImage}</small>}</label><input id="quick-journal-image" type="file" accept="image/*" hidden onChange={(event) => setJournalImage(event.target.files?.[0]?.name ?? "")} /><button onClick={saveJournal} aria-label="Save journal entry">{saved ? <Check size={19} /> : "→"}</button></div></div></article>

          <article className="reminder-note"><div className="card-heading"><CardTitle icon={Flower2}>Little reminder</CardTitle><CardMenu name="little-reminder" open={openCardMenu} setOpen={setOpenCardMenu}><Link href="/planner/reminders">Open reminders</Link><button onClick={() => { setLittleReminders([false, false, false]); setOpenCardMenu(null); }}>Clear checks</button></CardMenu></div>{reminderLabels.map((label, index) => <label key={label}><input type="checkbox" checked={littleReminders[index]} onChange={() => setLittleReminders((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} /> {label}</label>)}<div className="reminder-art-slot" aria-hidden="true" /></article>
        </div>
      </section>

      {taskModal && <div className="planner-modal-backdrop" onMouseDown={() => setTaskModal(false)}><form className="planner-modal" onSubmit={submitQuickTask} onMouseDown={(event) => event.stopPropagation()}><div><h2>Quick task</h2><button type="button" onClick={() => setTaskModal(false)}>×</button></div><label>Task name<input autoFocus value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="What needs to be done today?" /></label><button className="modal-submit"><Plus size={17} /> Add to Today</button></form></div>}
    </main>
  );
}
