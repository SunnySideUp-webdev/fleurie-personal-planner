"use client";

import {
  Bell, BellRing, CalendarDays, Check, Clock3, Copy, MoreHorizontal,
  Pencil, Plus, RefreshCcw, Sparkles, Trash2,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { PlannerFrame } from "../_components/planner-frame";
import { PlannerReminder, usePlannerData } from "../_data/use-planner-data";

const groups: PlannerReminder["group"][] = ["Today", "Upcoming", "Someday"];

export default function PlannerRemindersPage() {
  const { data, addReminder, updateReminder, toggleReminder, toggleReminderEnabled, removeReminder, toggleNotificationSetting } = usePlannerData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState<PlannerReminder["group"]>("Today");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("None");

  function openNewReminder(nextGroup: PlannerReminder["group"] = "Today") {
    setEditingId(null); setTitle(""); setGroup(nextGroup);
    setDate(nextGroup === "Today" ? "Today" : nextGroup === "Upcoming" ? "Oct 12" : "No date");
    setTime(nextGroup === "Someday" ? "" : "09:00"); setRepeat("None"); setOpenMenu(null); setShowForm(true);
  }

  function openEditReminder(reminder: PlannerReminder) {
    setEditingId(reminder.id); setTitle(reminder.title); setGroup(reminder.group); setDate(reminder.date);
    setTime(reminder.time); setRepeat(reminder.repeat); setOpenMenu(null); setShowForm(true);
  }

  function submitReminder(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const reminder = { title: title.trim(), group, date: date.trim() || "No date", time, repeat, enabled: editingId ? data.reminders.find((item) => item.id === editingId)?.enabled ?? true : true };
    if (editingId) updateReminder(editingId, reminder); else addReminder(reminder);
    setShowForm(false);
  }

  function duplicateReminder(reminder: PlannerReminder) {
    addReminder({ title: `${reminder.title} copy`, group: reminder.group, date: reminder.date, time: reminder.time, repeat: reminder.repeat, enabled: reminder.enabled });
    setOpenMenu(null);
  }

  const activeCount = data.reminders.filter((item) => !item.completed && item.enabled).length;

  return (
    <PlannerFrame active="Reminders" actionLabel="New reminder" onAdd={() => openNewReminder()}>
      <div className="planner-module-summary-row"><span>{data.reminders.filter((item) => item.enabled).length} active reminders <BellRing size={16} /></span></div>
      <div className="reminders-layout">
        <section className="planner-module-card reminders-timeline">
          {groups.map((section) => <div className="reminder-group" key={section}>
            <div className="reminder-group-title"><span><i />{section}</span><b>{data.reminders.filter((item) => item.group === section).length}</b><button onClick={() => openNewReminder(section)}><Plus size={15} /> Add</button></div>
            {data.reminders.filter((item) => item.group === section).map((reminder) => <article className={reminder.completed ? "completed" : ""} key={reminder.id}>
              <button className="module-check" onClick={() => toggleReminder(reminder.id)}>{reminder.completed && <Check size={14} />}</button>
              <div><strong>{reminder.title}</strong><span><CalendarDays size={13} />{reminder.date}{reminder.time && <><Clock3 size={13} />{reminder.time}</>}{reminder.repeat !== "None" && <><RefreshCcw size={12} />{reminder.repeat}</>}</span></div>
              <button className={`reminder-toggle ${reminder.enabled ? "on" : ""}`} onClick={() => toggleReminderEnabled(reminder.id)} aria-label={`Toggle ${reminder.title} notification`}><i /></button>
              <div className="module-menu-wrap row-menu-wrap"><button className="row-action" onClick={() => setOpenMenu(openMenu === reminder.id ? null : reminder.id)} aria-label={`Options for ${reminder.title}`}><MoreHorizontal size={17} /></button>{openMenu === reminder.id && <div className="module-popover row-popover"><button onClick={() => openEditReminder(reminder)}><Pencil size={14} /> Edit</button><button onClick={() => duplicateReminder(reminder)}><Copy size={14} /> Duplicate</button><button className="danger" onClick={() => { removeReminder(reminder.id); setOpenMenu(null); }}><Trash2 size={14} /> Delete</button></div>}</div>
            </article>)}
          </div>)}
        </section>
        <aside className="reminders-rail">
          <section className="planner-module-card reminder-summary"><div className="reminder-orbit"><Bell /><span>{activeCount}</span></div><h3>{activeCount ? "A few gentle nudges" : "All caught up"}</h3><p>{activeCount ? `You have ${activeCount} active reminders waiting for you.` : "Nothing is waiting for your attention right now."}</p></section>
          <section className="planner-module-card reminder-settings"><h3><BellRing size={18} /> Notification rhythm</h3>
            <label><span>Morning summary<small>Every day at 8:00</small></span><button className={`reminder-toggle ${data.notificationSettings.morning ? "on" : ""}`} onClick={() => toggleNotificationSetting("morning")}><i /></button></label>
            <label><span>Evening check-in<small>Every day at 20:00</small></span><button className={`reminder-toggle ${data.notificationSettings.evening ? "on" : ""}`} onClick={() => toggleNotificationSetting("evening")}><i /></button></label>
            <label><span>Weekly review<small>Sunday at 18:00</small></span><button className={`reminder-toggle ${data.notificationSettings.weekly ? "on" : ""}`} onClick={() => toggleNotificationSetting("weekly")}><i /></button></label>
          </section>
          <section className="planner-module-card reminders-quote-card"><Sparkles /><p>“A reminder is a little act of care for your future self.”</p></section>
        </aside>
      </div>

      {showForm && <div className="planner-modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="planner-modal" onSubmit={submitReminder} onMouseDown={(event) => event.stopPropagation()}>
        <div><h2>{editingId ? "Edit reminder" : "New reminder"}</h2><button type="button" onClick={() => setShowForm(false)}>×</button></div>
        <label>Reminder<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What should I remind you about?" /></label>
        <div className="modal-field-grid"><label>When<select value={group} onChange={(event) => { const next = event.target.value as PlannerReminder["group"]; setGroup(next); if (!editingId) { setDate(next === "Today" ? "Today" : next === "Upcoming" ? "Oct 12" : "No date"); setTime(next === "Someday" ? "" : "09:00"); } }}>{groups.map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input value={date} onChange={(event) => setDate(event.target.value)} placeholder="Oct 12" /></label></div>
        <div className="modal-field-grid"><label>Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>Repeat<select value={repeat} onChange={(event) => setRepeat(event.target.value)}>{["None", "Every day", "Weekly", "Monthly"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <button className="modal-submit">{editingId ? <Pencil size={17} /> : <Plus size={17} />}{editingId ? "Save changes" : "Add reminder"}</button>
      </form></div>}
    </PlannerFrame>
  );
}
