"use client";

import {
  CalendarClock, Check, ChevronDown, Circle, Clock3, Flag, ListChecks,
  MoreHorizontal, Pencil, Plus, Search, Sparkles, Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PlannerFrame } from "../_components/planner-frame";
import { PlannerTask, usePlannerData } from "../_data/use-planner-data";

const filters = ["All", "Today", "This week", "Later", "Completed"];
const buckets: PlannerTask["bucket"][] = ["Today", "This week", "Later"];
const priorities: PlannerTask["priority"][] = ["Low", "Medium", "High"];
const categories: PlannerTask["category"][] = ["Personal", "University", "Work", "Wellness"];
type SortMode = "Default" | "Priority" | "Due date" | "Name";

export default function PlannerTasksPage() {
  const { data, addTask, updateTask, toggleTask, removeTask } = usePlannerData();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("Default");
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState<PlannerTask["bucket"]>("Today");
  const [due, setDue] = useState("Today");
  const [priority, setPriority] = useState<PlannerTask["priority"]>("Medium");
  const [category, setCategory] = useState<PlannerTask["category"]>("Personal");

  const visibleTasks = useMemo(() => {
    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    const result = data.tasks.filter((task) => {
      if (filter === "Completed" && !task.completed) return false;
      if (["Today", "This week", "Later"].includes(filter) && task.bucket !== filter) return false;
      return task.title.toLowerCase().includes(query.toLowerCase());
    });
    if (sort === "Priority") return [...result].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    if (sort === "Due date") return [...result].sort((a, b) => a.due.localeCompare(b.due));
    if (sort === "Name") return [...result].sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [data.tasks, filter, query, sort]);

  const completed = data.tasks.filter((task) => task.completed).length;
  const today = data.tasks.filter((task) => task.bucket === "Today" && !task.completed).length;
  const highPriority = data.tasks.filter((task) => task.priority === "High" && !task.completed).length;

  function openNewTask(nextBucket: PlannerTask["bucket"] = "Today") {
    setEditingId(null); setTitle(""); setBucket(nextBucket); setDue(nextBucket === "Today" ? "Today" : nextBucket);
    setPriority("Medium"); setCategory("Personal"); setShowForm(true); setOpenMenu(null);
  }

  function openEditTask(task: PlannerTask) {
    setEditingId(task.id); setTitle(task.title); setBucket(task.bucket); setDue(task.due);
    setPriority(task.priority); setCategory(task.category); setShowForm(true); setOpenMenu(null);
  }

  function submitTask(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const task = { title: title.trim(), bucket, due: due.trim() || bucket, category, priority };
    if (editingId) updateTask(editingId, task); else addTask(task);
    setShowForm(false);
  }

  return (
    <PlannerFrame active="Tasks" actionLabel="New task" onAdd={() => openNewTask()}>
      <div className="planner-module-summary-row"><span>{completed} completed this week <Sparkles size={16} /></span></div>

      <div className="task-stat-grid">
        <article><span><ListChecks /></span><div><strong>{data.tasks.length}</strong><small>All tasks</small></div></article>
        <article><span><Clock3 /></span><div><strong>{today}</strong><small>Due today</small></div></article>
        <article><span><Flag /></span><div><strong>{highPriority}</strong><small>High priority</small></div></article>
        <article><span><Check /></span><div><strong>{completed}</strong><small>Completed</small></div></article>
      </div>

      <section className="planner-module-card tasks-board">
        <div className="tasks-toolbar">
          <div className="planner-filter-tabs">{filters.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div>
          <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /></label>
          <div className="module-menu-wrap"><button className="toolbar-menu-button" onClick={() => setSortOpen((value) => !value)}><ChevronDown size={16} /> {sort === "Default" ? "Sort" : sort}</button>{sortOpen && <div className="module-popover sort-popover">{(["Default", "Priority", "Due date", "Name"] as SortMode[]).map((item) => <button className={sort === item ? "active" : ""} onClick={() => { setSort(item); setSortOpen(false); }} key={item}>{item}</button>)}</div>}</div>
        </div>
        <div className="task-sections">
          {buckets.map((section) => {
            const sectionTasks = visibleTasks.filter((task) => task.bucket === section);
            if (!sectionTasks.length && filter !== "All" && filter !== section && filter !== "Completed") return null;
            return <div className="task-section" key={section}>
              <div className="task-section-heading"><h3>{section}</h3><span>{sectionTasks.length}</span><button onClick={() => openNewTask(section)}><Plus size={15} /> Add task</button></div>
              {sectionTasks.map((task) => <article className={task.completed ? "completed" : ""} key={task.id}>
                <button className="module-check" onClick={() => toggleTask(task.id)}>{task.completed ? <Check size={15} /> : <Circle size={15} />}</button>
                <div className="task-main"><strong>{task.title}</strong><span><CalendarClock size={13} />{task.due}</span></div>
                <i className={`category-${task.category.toLowerCase()}`}>{task.category}</i>
                <b className={`priority-${task.priority.toLowerCase()}`}><Flag size={11} />{task.priority}</b>
                <div className="module-menu-wrap row-menu-wrap"><button className="row-action" onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)} aria-label={`Options for ${task.title}`}><MoreHorizontal size={17} /></button>{openMenu === task.id && <div className="module-popover row-popover"><button onClick={() => openEditTask(task)}><Pencil size={14} /> Edit</button>{buckets.filter((item) => item !== task.bucket).map((item) => <button onClick={() => { updateTask(task.id, { bucket: item, due: item === "Today" ? "Today" : item }); setOpenMenu(null); }} key={item}>Move to {item}</button>)}<button className="danger" onClick={() => { removeTask(task.id); setOpenMenu(null); }}><Trash2 size={14} /> Delete</button></div>}</div>
              </article>)}
            </div>;
          })}
        </div>
      </section>

      {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal" onSubmit={submitTask} onMouseDown={(event) => event.stopPropagation()}>
        <div><h2>{editingId ? "Edit task" : "New task"}</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div>
        <label>Task name<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" /></label>
        <div className="modal-field-grid"><label>When<select value={bucket} onChange={(event) => { const next = event.target.value as PlannerTask["bucket"]; setBucket(next); if (!editingId) setDue(next === "Today" ? "Today" : next); }}>{buckets.map((item) => <option key={item}>{item}</option>)}</select></label><label>Due<input value={due} onChange={(event) => setDue(event.target.value)} placeholder="Today, 17:00" /></label></div>
        <div className="modal-field-grid"><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as PlannerTask["priority"])}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value as PlannerTask["category"])}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <button className="modal-submit">{editingId ? <Pencil size={17} /> : <Plus size={17} />}{editingId ? "Save changes" : "Add task"}</button>
      </form></div>}
    </PlannerFrame>
  );
}
