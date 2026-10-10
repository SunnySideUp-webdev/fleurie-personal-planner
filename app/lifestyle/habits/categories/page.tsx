"use client";

import Link from "next/link";
import {
  Bell, BookOpen, CalendarDays, Check, ChevronDown, CircleDollarSign, Ellipsis, Home, Leaf,
  ListChecks, Menu, Pencil, Plus, Settings, Shirt, Sparkles, X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { formatHabitFrequency, isHabitScheduledForDay, LifestyleHabitCategory, useHabitData } from "../../_data/use-habit-data";

const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits", active: true },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const plannerAccentColors = [
  { name: "Tea rose", value: "#ebb4b2" },
  { name: "Dusty rose", value: "#b46c72" },
  { name: "Deep rose", value: "#a34f54" },
  { name: "Soft coral", value: "#cf8987" },
  { name: "Blush", value: "#f2d8d6" },
  { name: "Beige", value: "#e4daca" },
  { name: "Sand", value: "#d8c8b6" },
  { name: "Dry grass", value: "#9ca469" },
  { name: "Sage", value: "#aeb078" },
  { name: "Olive", value: "#70702e" },
  { name: "Matcha", value: "#d7d799" },
  { name: "Soft sage", value: "#ced0b8" },
  { name: "Stone", value: "#c7beb3" },
  { name: "Warm taupe", value: "#bda995" },
  { name: "Clay", value: "#d8c3b3" },
  { name: "Pale olive", value: "#e1e1bd" },
];

export default function HabitCategoriesPage() {
  const { habits, categories, toggleHabit, updateHabit, addCategory, updateCategory } = useHabitData();
  const [mobileNav, setMobileNav] = useState(false);
  const [selected, setSelected] = useState("Self care");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#bda995");
  const [categoryError, setCategoryError] = useState("");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const grouped = useMemo(() => categories.map((category) => {
    const items = habits.filter((habit) => habit.category === category.name);
    const checks = items.reduce((sum, habit) => sum + habit.history.filter((checked, day) => checked && isHabitScheduledForDay(habit, day)).length, 0);
    const scheduled = items.reduce((sum, habit) => sum + habit.scheduleDays.length, 0);
    return { ...category, items, completion: scheduled ? Math.round(checks / scheduled * 100) : 0 };
  }), [categories, habits]);
  const active = grouped.find((group) => group.name === selected) ?? grouped[0];

  function openNewCategory() {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryColor("#bda995");
    setCategoryError("");
    setColorMenuOpen(false);
    setOpenMenu(null);
    setShowForm(true);
  }

  function openEditCategory(category: LifestyleHabitCategory) {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryError("");
    setColorMenuOpen(false);
    setOpenMenu(null);
    setShowForm(true);
  }

  function submitCategory(event: FormEvent) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    const duplicate = categories.some((category) => category.id !== editingCategoryId && category.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setCategoryError("This category already exists.");
      return;
    }
    if (editingCategoryId) {
      const previousName = categories.find((category) => category.id === editingCategoryId)?.name;
      updateCategory(editingCategoryId, { name, color: categoryColor });
      if (selected === previousName) setSelected(name);
    } else {
      addCategory({ name, color: categoryColor });
      setSelected(name);
    }
    setShowForm(false);
  }

  function moveHabit(habitId: string, categoryName: string) {
    updateHabit(habitId, {
      category: categoryName,
      color: categories.find((category) => category.name === categoryName)?.color ?? "#c7beb3",
    });
  }

  return (
    <main className="app-shell habit-categories-shell" onClick={() => setOpenMenu(null)}>
      <aside className={`sidebar lifestyle-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src="/daylily-logo.png" alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)}><X /></button></div>
        <nav>{navigation.map(({ label, icon: Icon, href, active: navigationActive }) => <div key={label}><Link href={href} className={`nav-item ${navigationActive ? "active" : ""}`}><Icon size={24} /><span>{label}</span></Link>{label === "Lifestyle" && <div className="studio-subnav lifestyle-subnav"><Link href="/lifestyle/habits" className="active">Habits</Link><Link href="/lifestyle/mood">Mood</Link><Link href="/lifestyle/routines">Routines + Fitness</Link></div>}</div>)}</nav>
        <div className="sidebar-art-slot lifestyle-sidebar-art">Floral collage</div>
        <Link className="profile-button" href="/"><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></Link>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} />}

      <section className="habit-library-workspace">
        <header className="lifestyle-header">
          <button className="mobile-menu lifestyle-mobile-menu" onClick={() => setMobileNav(true)}><Menu /></button>
          <div><h1>Lifestyle <Leaf size={32} /></h1><p>/ &nbsp;Habits / Categories</p></div>
          <div className="lifestyle-actions"><Link className="add-button" href="/lifestyle/habits/all">Manage habits</Link><Link className="icon-button" href="/planner/reminders"><Bell size={20} /></Link></div>
        </header>

        <div className="lifestyle-tabs habit-module-tabs"><Link href="/lifestyle/habits">Today</Link><Link href="/lifestyle/habits/statistics">Statistics</Link><Link href="/lifestyle/habits/all">All habits</Link><Link className="active" href="/lifestyle/habits/categories">Categories</Link></div>

        <div className="habit-category-heading">
          <div><h2>Habit categories</h2><p>Organize your habits in a way that feels natural to you.</p></div>
          <button onClick={openNewCategory}><Plus size={17} /> New category</button>
        </div>

        <section className="habit-category-grid">
          {grouped.map((group) => (
            <article className={active?.id === group.id ? "active" : ""} key={group.id}>
              <button className="category-card-main" onClick={() => setSelected(group.name)}>
                <i style={{ background: group.color }} />
                <strong>{group.name}</strong>
                <span>{group.items.length} habits</span>
                <div><b style={{ width: `${group.completion}%`, background: group.color }} /></div>
                <small>{group.completion}%</small>
              </button>
              <div className="module-menu-wrap category-card-menu" onClick={(event) => event.stopPropagation()}>
                <button className="row-action" onClick={() => setOpenMenu(openMenu === group.id ? null : group.id)} aria-label={`Options for ${group.name}`}><Ellipsis size={18} /></button>
                {openMenu === group.id && <div className="module-popover row-popover"><button onClick={() => openEditCategory(group)}><Pencil size={14} /> Edit category</button></div>}
              </div>
            </article>
          ))}
        </section>

        {active && <div className="habit-category-layout">
          <section className="lifestyle-panel category-detail-card">
            <div className="lifestyle-panel-heading"><h2>{active.name}</h2><span>{active.completion}% this week</span></div>
            {active.items.length ? active.items.map((habit) => <article key={habit.id}><button disabled={!isHabitScheduledForDay(habit, 1)} className={habit.history[1] ? "checked" : ""} onClick={() => toggleHabit(habit.id, 1)}>{habit.history[1] && isHabitScheduledForDay(habit, 1) && <Check size={14} />}</button><div><strong>{habit.label}</strong><small>{formatHabitFrequency(habit)} · {habit.streak} day streak</small></div><select value={habit.category} onChange={(event) => moveHabit(habit.id, event.target.value)}>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></article>) : <p className="today-empty-copy">No habits in this category yet.</p>}
          </section>
          <section className="lifestyle-panel category-balance-card"><h2>Category balance</h2>{grouped.map((group) => <div key={group.id}><span>{group.name}</span><div><i style={{ width: `${group.completion}%`, background: group.color }} /></div><b>{group.completion}%</b></div>)}</section>
        </div>}
      </section>

      {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal category-form-modal" onSubmit={submitCategory} onMouseDown={(event) => event.stopPropagation()}><div><h2>{editingCategoryId ? "Edit category" : "New category"}</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div><label>Category name<input required autoFocus value={categoryName} onChange={(event) => { setCategoryName(event.target.value); setCategoryError(""); }} placeholder="e.g. Mindfulness" /></label><div className="category-color-field"><span>Color</span><div className="category-color-dropdown"><button type="button" onClick={() => setColorMenuOpen((open) => !open)} aria-expanded={colorMenuOpen}><i style={{ background: categoryColor }} /><span><strong>{plannerAccentColors.find((color) => color.value === categoryColor)?.name ?? "Accent color"}</strong><small>{categoryColor.toUpperCase()}</small></span><ChevronDown size={17} /></button>{colorMenuOpen && <div className="category-color-options">{plannerAccentColors.map((color) => <button type="button" className={categoryColor === color.value ? "selected" : ""} key={color.value} onClick={() => { setCategoryColor(color.value); setColorMenuOpen(false); }}><i style={{ background: color.value }} /><span>{color.name}<small>{color.value.toUpperCase()}</small></span>{categoryColor === color.value && <Check size={14} />}</button>)}</div>}</div></div>{categoryError && <p className="category-form-error">{categoryError}</p>}<button className="modal-submit">{editingCategoryId ? <Pencil size={17} /> : <Plus size={17} />}{editingCategoryId ? "Save category" : "Create category"}</button></form></div>}
    </main>
  );
}
