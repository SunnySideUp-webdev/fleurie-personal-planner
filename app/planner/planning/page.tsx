"use client";

import Link from "next/link";
import {
  BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Circle, Flag,
  Heart, Leaf, MoreHorizontal, Pencil, Plus, Sparkles, Target, Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PlannerFrame } from "../_components/planner-frame";
import { PlannerGoal, usePlannerData } from "../_data/use-planner-data";
import { initialCalendarEvents, type CalendarEvent } from "../_data/calendar-events";

const periods: PlannerGoal["period"][] = ["Weekly", "Monthly", "Quarterly", "Yearly"];
const categories = ["Personal", "University", "Wellness", "Money", "Lifestyle"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type CalendarSummaryEvent = Pick<CalendarEvent, "id" | "week" | "day" | "title">;

function weekDates(offset: number) {
  const base = new Date(2026, 9, 4 + offset * 7);
  return dayNames.map((day, index) => {
    const date = new Date(base); date.setDate(base.getDate() + index);
    return { day, date: date.getDate(), month: date.toLocaleString("en", { month: "short" }) };
  });
}

export default function PlannerPlanningPage() {
  const { data, addGoal, updateGoal, toggleGoal, removeGoal, setIntention, setPlanningNote, toggleWeeklyReset } = usePlannerData();
  const [period, setPeriod] = useState<PlannerGoal["period"]>("Weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState<CalendarSummaryEvent[]>(initialCalendarEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [goalPeriod, setGoalPeriod] = useState<PlannerGoal["period"]>("Weekly");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("noa-calendar-data-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as { events?: CalendarSummaryEvent[] };
        if (parsed.events) setCalendarEvents(parsed.events);
      }
    } catch {
      // Planning remains usable when calendar data is unavailable.
    }
  }, []);

  const goals = useMemo(() => data.goals.filter((goal) => goal.period === period), [data.goals, period]);
  const average = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;
  const dates = weekDates(weekOffset);
  const weekEvents = calendarEvents.filter((event) => event.week === weekOffset);
  const rangeLabel = `${dates[0].month} ${dates[0].date} – ${dates[6].month} ${dates[6].date}`;

  const balance = useMemo(() => ["University", "Wellness", "Personal", "Money"].map((label, index) => {
    const relatedTasks = data.tasks.filter((task) => task.category === label || (label === "Money" && task.title.toLowerCase().includes("budget")));
    const relatedGoals = data.goals.filter((goal) => goal.category === label);
    const taskScore = relatedTasks.length ? relatedTasks.filter((task) => task.completed).length / relatedTasks.length * 100 : 0;
    const goalScore = relatedGoals.length ? relatedGoals.reduce((sum, goal) => sum + goal.progress, 0) / relatedGoals.length : 0;
    const value = Math.round((taskScore + goalScore) / ((relatedTasks.length && relatedGoals.length) ? 2 : 1));
    return [label, value, ["rose", "green", "sand", "olive"][index]] as const;
  }), [data.goals, data.tasks]);

  function openNewGoal() {
    setEditingId(null); setTitle(""); setCategory("Personal"); setGoalPeriod(period); setProgress(0); setOpenMenu(null); setShowForm(true);
  }

  function openEditGoal(goal: PlannerGoal) {
    setEditingId(goal.id); setTitle(goal.title); setCategory(goal.category); setGoalPeriod(goal.period); setProgress(goal.progress); setOpenMenu(null); setShowForm(true);
  }

  function submitGoal(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const goal = { title: title.trim(), period: goalPeriod, category, progress };
    if (editingId) updateGoal(editingId, goal); else addGoal(goal);
    setPeriod(goalPeriod); setShowForm(false);
  }

  return (
    <PlannerFrame active="Planning" actionLabel="New goal" onAdd={openNewGoal}>
      <div className="planner-module-summary-row planning-title"><blockquote>“A soft plan can still move you forward.” ♡</blockquote><div className="period-switcher">{periods.map((item) => <button className={period === item ? "active" : ""} onClick={() => setPeriod(item)} key={item}>{item}</button>)}</div></div>

      <div className="planning-layout">
        <div className="planning-main-column">
          <section className="planning-hero planner-module-card">
            <div><div className="planning-intention-heading"><span><Sparkles size={17} /> {period} intention</span></div><textarea aria-label={`${period} intention`} placeholder={`Write your ${period.toLowerCase()} intention...`} value={data.intention} onChange={(event) => setIntention(event.target.value)} /></div>
            <div className="planning-progress-ring"><span><strong>{average}%</strong><small>on track</small></span></div>
          </section>

          <section className="planner-module-card week-at-glance">
            <div className="module-card-heading"><h3><CalendarDays size={20} /> Week at a glance</h3><span><button onClick={() => setWeekOffset((value) => value - 1)} aria-label="Previous week"><ChevronLeft size={17} /></button>{rangeLabel}<button onClick={() => setWeekOffset((value) => value + 1)} aria-label="Next week"><ChevronRight size={17} /></button></span></div>
            <div className="week-plan-grid">{dates.map(({ day, date }, index) => {
              const events = weekEvents.filter((event) => event.day === index + 1);
              const taskBoost = weekOffset === 0 && index === 1 ? data.tasks.filter((task) => task.bucket === "Today" && !task.completed).length : 0;
              const count = events.length + taskBoost;
              const label = events.length ? events.slice(0, 2).map((event) => event.title).join(" + ") : taskBoost ? "Today’s tasks" : "Open space";
              return <article className={weekOffset === 0 && index === 1 ? "selected" : ""} key={`${day}-${date}`}><span>{day}<b>{date}</b></span><div><i style={{ height: `${Math.min(70, count * 11 + 14)}px` }} /><strong>{label}</strong><small>{count} {count === 1 ? "plan" : "plans"}</small></div></article>;
            })}</div>
          </section>

          <section className="planner-module-card planning-goals-card">
            <div className="module-card-heading"><h3><Target size={20} /> {period} goals</h3><button onClick={openNewGoal}><Plus size={16} /> Add goal</button></div>
            <div className="planning-goals-list">{goals.length ? goals.map((goal) => <article className={goal.completed ? "completed" : ""} key={goal.id}>
              <button className="module-check" onClick={() => toggleGoal(goal.id)}>{goal.completed ? <Check size={14} /> : <Circle size={14} />}</button>
              <div><strong>{goal.title}</strong><span>{goal.category}</span><div><i style={{ width: `${goal.progress}%` }} /></div></div><b>{goal.progress}%</b>
              <div className="module-menu-wrap row-menu-wrap"><button className="row-action" onClick={() => setOpenMenu(openMenu === goal.id ? null : goal.id)} aria-label={`Options for ${goal.title}`}><MoreHorizontal size={17} /></button>{openMenu === goal.id && <div className="module-popover row-popover"><button onClick={() => openEditGoal(goal)}><Pencil size={14} /> Edit</button><button onClick={() => { updateGoal(goal.id, { progress: Math.min(100, goal.progress + 10) }); setOpenMenu(null); }}>Add 10% progress</button><button className="danger" onClick={() => { removeGoal(goal.id); setOpenMenu(null); }}><Trash2 size={14} /> Delete</button></div>}</div>
            </article>) : <div className="empty-period"><Target /><p>No {period.toLowerCase()} goals yet.</p><button onClick={openNewGoal}>Create your first goal</button></div>}</div>
          </section>
        </div>

        <aside className="planning-rail">
          <section className="planner-module-card priorities-card"><div className="module-card-heading"><h3><Flag size={19} /> Top priorities</h3><Link href="/planner/tasks" aria-label="Edit priorities"><Pencil size={16} /></Link></div>{data.tasks.filter((task) => !task.completed).sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority])).slice(0,3).map((task, index) => <Link href="/planner/tasks" key={task.id}><span>{index + 1}</span><p><strong>{task.title}</strong><small>{task.category} • {task.due}</small></p></Link>)}</section>
          <section className="planner-module-card balance-card"><div className="module-card-heading"><h3><Heart size={19} /> Life balance</h3></div>{balance.map(([label,value,tone]) => <div key={label}><span>{label}</span><div><i className={tone} style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</section>
          <section className="planner-module-card planning-notes"><div className="module-card-heading"><h3><BookOpen size={19} /> Notes for myself</h3></div><textarea value={data.planningNote} onChange={(event) => setPlanningNote(event.target.value)} /></section>
          <section className="planner-module-card weekly-reset"><div className="module-card-heading"><h3><Leaf size={19} /> Weekly reset</h3></div>{["Review last week", "Choose priorities", "Plan meals", "Prepare outfits"].map((item,index) => <button className={data.weeklyReset[index] ? "done" : ""} key={item} onClick={() => toggleWeeklyReset(index)}>{data.weeklyReset[index] ? <Check size={14} /> : <Circle size={14} />}{item}</button>)}</section>
        </aside>
      </div>

      {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal" onSubmit={submitGoal} onMouseDown={(event) => event.stopPropagation()}>
        <div><h2>{editingId ? "Edit goal" : `New ${period.toLowerCase()} goal`}</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div>
        <label>Goal<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What would you like to achieve?" /></label>
        <div className="modal-field-grid"><label>Period<select value={goalPeriod} onChange={(event) => setGoalPeriod(event.target.value as PlannerGoal["period"])}>{periods.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <label>Progress · {progress}%<input className="goal-range" type="range" min="0" max="100" step="5" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></label>
        <button className="modal-submit">{editingId ? <Pencil size={17} /> : <Plus size={17} />}{editingId ? "Save changes" : "Add goal"}</button>
      </form></div>}
    </PlannerFrame>
  );
}
