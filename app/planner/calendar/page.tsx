"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Dumbbell,
  Ellipsis,
  Heart,
  Home,
  Laptop,
  Leaf,
  ListChecks,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  Shirt,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePlannerData } from "../_data/use-planner-data";
import { CalendarEvent, initialCalendarEvents } from "../_data/calendar-events";

const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar", active: true },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const plannerTabs = ["Calendar", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyDraft: Omit<CalendarEvent, "id" | "week"> = { day: 1, start: 9, duration: 1, title: "", tone: "green", icon: "work" };

function formatHour(value: number) {
  const hour = Math.floor(value);
  const minute = value % 1 ? "30" : "00";
  return `${hour}:${minute}`;
}

function calculateOverlap(events: CalendarEvent[]) {
  const layout = new Map<string, { column: number; columns: number }>();
  for (let day = 1; day <= 7; day += 1) {
    const dayEvents = events.filter((event) => event.day === day).sort((a, b) => a.start - b.start || b.duration - a.duration);
    let cluster: CalendarEvent[] = [];
    let clusterEnd = -1;

    const placeCluster = () => {
      if (!cluster.length) return;
      const columnEnds: number[] = [];
      const placements = cluster.map((event) => {
        let column = columnEnds.findIndex((end) => end <= event.start);
        if (column === -1) {
          column = columnEnds.length;
          columnEnds.push(event.start + event.duration);
        } else columnEnds[column] = event.start + event.duration;
        return { event, column };
      });
      const columns = Math.max(1, columnEnds.length);
      placements.forEach(({ event, column }) => layout.set(event.id, { column, columns }));
    };

    dayEvents.forEach((event) => {
      if (cluster.length && event.start >= clusterEnd) {
        placeCluster();
        cluster = [];
        clusterEnd = -1;
      }
      cluster.push(event);
      clusterEnd = Math.max(clusterEnd, event.start + event.duration);
    });
    placeCluster();
  }
  return layout;
}

function EventIcon({ type }: { type: CalendarEvent["icon"] }) {
  const props = { size: 13, strokeWidth: 1.8 };
  if (type === "work") return <Laptop {...props} />;
  if (type === "food") return <Utensils {...props} />;
  if (type === "workout") return <Dumbbell {...props} />;
  if (type === "heart") return <Heart {...props} />;
  if (type === "journal") return <BookOpen {...props} />;
  if (type === "habit") return <Leaf {...props} />;
  if (type === "outfit") return <Shirt {...props} />;
  return <BookOpen {...props} />;
}

function SmallCheck({ checked, onClick }: { checked: boolean; onClick?: () => void }) {
  return <button className={`planner-check ${checked ? "checked" : ""}`} onClick={onClick} aria-pressed={checked}>{checked && <Check size={13} />}</button>;
}

export default function PlannerCalendarPage() {
  const { data, toggleTask } = usePlannerData();
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState("Calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [miniMonth, setMiniMonth] = useState(0);
  const [events, setEvents] = useState(initialCalendarEvents);
  const [focusDone, setFocusDone] = useState([true, true, false, false]);
  const [focusItems, setFocusItems] = useState(["Finish statistics project", "Attend every class", "Complete 3 workouts", "Organize my desk"]);
  const [taskBucket, setTaskBucket] = useState("Today");
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [headerPanel, setHeaderPanel] = useState<"search" | "notifications" | "settings" | null>(null);
  const [cardMenu, setCardMenu] = useState<string | null>(null);
  const [eventModal, setEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("a more\norganized & happier\nversion of me ♡");
  const [habitMatrix, setHabitMatrix] = useState(() => [5, 4, 3, 2, 1, 1].map((done) => Array.from({ length: 7 }, (_, day) => day < done)));
  const [calendarReady, setCalendarReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("noa-calendar-data-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as { events?: CalendarEvent[]; focusDone?: boolean[]; focusItems?: string[]; note?: string; habitMatrix?: boolean[][] };
        if (parsed.events) setEvents(parsed.events);
        if (parsed.focusDone) setFocusDone(parsed.focusDone);
        if (parsed.focusItems) setFocusItems(parsed.focusItems);
        if (typeof parsed.note === "string") setNote(parsed.note);
        if (parsed.habitMatrix) setHabitMatrix(parsed.habitMatrix);
      }
    } catch {
      // Keep the starter calendar if saved data is unavailable.
    }
    setCalendarReady(true);
  }, []);

  useEffect(() => {
    if (!calendarReady) return;
    window.localStorage.setItem("noa-calendar-data-v1", JSON.stringify({ events, focusDone, focusItems, note, habitMatrix }));
  }, [events, focusDone, focusItems, note, habitMatrix, calendarReady]);

  const weekStart = useMemo(() => {
    const value = new Date(2026, 9, 5);
    value.setDate(value.getDate() + weekOffset * 7);
    return value;
  }, [weekOffset]);
  const weekDays = useMemo(() => dayNames.map((day, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return { day, date: date.getDate() }; }), [weekStart]);
  const monthTitle = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const visibleEvents = events.filter((event) => event.week === weekOffset);
  const overlapLayout = useMemo(() => calculateOverlap(visibleEvents), [visibleEvents]);
  const filteredTasks = data.tasks.filter((task) => task.bucket === taskBucket);

  function openNewEvent(day = 1, start = 9) {
    setEditingEvent(null);
    setDraft({ ...emptyDraft, day, start });
    setEventModal(true);
    setAddOpen(false);
  }

  function openEvent(event: CalendarEvent) {
    setEditingEvent(event.id);
    setDraft({ day: event.day, start: event.start, duration: event.duration, title: event.title, tone: event.tone, icon: event.icon });
    setEventModal(true);
  }

  function saveEvent(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    if (editingEvent) setEvents((current) => current.map((item) => item.id === editingEvent ? { ...item, ...draft, title: draft.title.trim() } : item));
    else setEvents((current) => [...current, { ...draft, id: crypto.randomUUID(), week: weekOffset, title: draft.title.trim() }]);
    setEventModal(false);
  }

  function deleteEvent() {
    if (!editingEvent) return;
    setEvents((current) => current.filter((event) => event.id !== editingEvent));
    setEventModal(false);
  }

  const menu = (id: string, content: React.ReactNode) => <span className="calendar-menu-wrap"><button className="calendar-more-button" onClick={() => setCardMenu((current) => current === id ? null : id)} aria-label="Open menu"><Ellipsis size={18} /></button>{cardMenu === id && <span className="calendar-card-menu">{content}</span>}</span>;

  return (
    <main className="app-shell planner-shell">
      <aside className={`sidebar planner-calendar-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src="/daylily-logo.png" alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)}><X /></button></div>
        <nav>{navigation.map(({ label, icon: Icon, href, active }) => <div key={label}><Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>{label === "Planner" && <div className="studio-subnav planner-module-subnav"><Link href="/planner/calendar" className="active">Calendar</Link><Link href="/planner/planning">Planning</Link><Link href="/planner/tasks">Tasks</Link><Link href="/planner/reminders">Reminders</Link></div>}</div>)}</nav>
        <div className="sidebar-art-slot planner-sidebar-art">Floral collage</div>
        <button className="profile-button" onClick={() => setHeaderPanel("settings")}><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></button>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} />}

      <section className="planner-workspace">
        <header className="planner-header">
          <button className="mobile-menu planner-mobile-menu" onClick={() => setMobileNav(true)}><Menu /></button>
          <div><h1>Planner <Leaf size={31} /></h1><p>/ &nbsp;Calendar</p></div>
          <div className="planner-actions">
            <div className="add-wrapper"><button className="add-button" onClick={() => setAddOpen((value) => !value)}><Plus size={20} /> Add</button>{addOpen && <div className="add-menu"><button onClick={() => openNewEvent()}>Event</button><Link href="/planner/tasks">Task</Link><Link href="/planner/reminders">Reminder</Link><Link href="/lifestyle/habits">Habit</Link></div>}</div>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "search" ? null : "search")}><Search size={20} /></button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "notifications" ? null : "notifications")}><Bell size={20} /></button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "settings" ? null : "settings")}><Settings size={20} /></button>
            {headerPanel && <div className={`calendar-header-panel ${headerPanel}`}>
              {headerPanel === "search" && <><label><Search size={16} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." /></label>{search && <div>{events.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())).slice(0,5).map((item) => <button key={item.id} onClick={() => openEvent(item)}>{item.title}<small>{dayNames[item.day - 1]}, {formatHour(item.start)}</small></button>)}</div>}</>}
              {headerPanel === "notifications" && <><strong>Notifications</strong>{data.reminders.filter((item) => item.enabled && !item.completed).slice(0,4).map((item) => <Link href="/planner/reminders" key={item.id}><Bell size={14} /><span>{item.title}<small>{item.date} {item.time}</small></span></Link>)}</>}
              {headerPanel === "settings" && <><strong>Calendar settings</strong><label><span>Show weekends</span><input type="checkbox" defaultChecked /></label><label><span>Start week on Monday</span><input type="checkbox" defaultChecked /></label><Link href="/planner/planning">Planning preferences</Link></>}
            </div>}
          </div>
        </header>

        <div className="planner-tabs" role="tablist">{plannerTabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>

        <div className="planner-layout">
          <div className="planner-main-column">
            {activeTab === "Calendar" ? <section className="week-calendar">
              <div className="week-toolbar"><div className="month-title"><button onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft size={18} /></button><button onClick={() => setWeekOffset((value) => value + 1)}><ChevronRight size={18} /></button><h2>{monthTitle}</h2></div><div><button className="subtle-button" onClick={() => setWeekOffset(0)}>Today</button><span className="calendar-menu-wrap"><button className="subtle-button" onClick={() => setViewOpen((value) => !value)}>Week View <ChevronDown size={15} /></button>{viewOpen && <span className="calendar-card-menu view-menu">{["Daily", "Weekly", "Monthly"].map((view) => <button key={view} onClick={() => { setActiveTab(view); setViewOpen(false); }}>{view} view</button>)}</span>}</span></div></div>
              <div className="week-grid"><div className="week-corner" />{weekDays.map((item) => <div className="day-heading" key={item.day}><span>{item.day}</span><strong>{item.date}</strong></div>)}{Array.from({ length: 15 }, (_, index) => <div className="time-label" style={{ gridRow: index * 2 + 2 }} key={index}>{index + 7}:00</div>)}{weekDays.map((day,index) => <button className="day-column" aria-label={`Add event on ${day.day}`} onDoubleClick={() => openNewEvent(index + 1, 9)} style={{ gridColumn: index + 2 }} key={day.day} />)}{visibleEvents.map((event) => { const startRow = Math.round((event.start - 7) * 2) + 2; const span = Math.max(2,Math.round(event.duration * 2)); const overlap = overlapLayout.get(event.id) ?? { column: 0, columns: 1 }; const step = overlap.columns > 1 ? Math.min(24, 44 / overlap.columns) : 0; const width = overlap.columns > 1 ? 100 - step * (overlap.columns - 1) : 100; return <button key={event.id} onClick={() => openEvent(event)} className={`calendar-event tone-${event.tone} ${overlap.columns > 1 ? "overlapping" : ""} ${event.icon === "outfit" ? "outfit-event" : ""}`} style={{ gridColumn: event.day + 1, gridRow: `${startRow} / span ${span}`, width: `calc(${width}% - 7px)`, marginLeft: `calc(${overlap.column * step}% + 3px)`, zIndex: 4 + overlap.column }}><span className="event-title"><EventIcon type={event.icon} />{event.title}<Ellipsis size={12} /></span><small>{formatHour(event.start)} - {formatHour(event.start + event.duration)}</small>{event.icon === "outfit" && <span className="outfit-event-placeholder"><Shirt size={22} /> Outfit from Studio</span>}</button>; })}</div>
            </section> : <PeriodView activeTab={activeTab} events={events} tasks={data.tasks} onAdd={() => openNewEvent()} />}

            <div className="planner-bottom-grid">
              <section className="planner-card compact-card"><div className="planner-card-title"><span><Target size={20} /> This week’s focus</span>{menu("focus", <><button onClick={() => setFocusDone(focusDone.map(() => true))}>Complete all</button><button onClick={() => setFocusDone(focusDone.map(() => false))}>Reset checks</button></>)}</div>{focusItems.map((item,index) => <div className="compact-row" key={item}><SmallCheck checked={focusDone[index]} onClick={() => setFocusDone((current) => current.map((value,i) => i === index ? !value : value))} /><input value={item} onChange={(event) => setFocusItems((current) => current.map((value,i) => i === index ? event.target.value : value))} /></div>)}</section>
              <section className="planner-card compact-card"><div className="planner-card-title"><span><CalendarDays size={20} /> Tasks</span>{menu("tasks", <><Link href="/planner/tasks">Open all tasks</Link><button onClick={() => setTaskBucket("Today")}>Show today</button></>)}</div><div className="task-tabs">{["Today","This week","Later"].map((bucket) => <button className={taskBucket === bucket ? "active" : ""} onClick={() => setTaskBucket(bucket)} key={bucket}>{bucket}</button>)}</div>{filteredTasks.slice(0,4).map((task) => <div className="compact-row" key={task.id}><SmallCheck checked={task.completed} onClick={() => toggleTask(task.id)} /><span>{task.title}</span></div>)}</section>
              <section className="planner-card notes-card"><div className="planner-card-title"><span><Pencil size={20} /> Notes</span>{menu("notes", <><button onClick={() => setNote("")}>Clear note</button><button onClick={() => setNote("Remember to make time for rest ♡")}>Use prompt</button></>)}</div><textarea className="note-paper" value={note} onChange={(event) => setNote(event.target.value)} /></section>
            </div>
          </div>

          <aside className="planner-right-rail">
            <section className="planner-card mini-calendar"><div className="mini-month"><button onClick={() => setMiniMonth((value) => value - 1)}><ChevronLeft size={17} /></button><strong>{new Date(2026,9 + miniMonth,1).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</strong><span /><button onClick={() => setMiniMonth(0)}>•</button><button onClick={() => setMiniMonth((value) => value + 1)}><ChevronRight size={17} /></button></div><div className="mini-weekdays">{["S","M","T","W","T","F","S"].map((day,index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="mini-days">{Array.from({length:35},(_,index) => { const day=index-3; return <button key={index} className={day===5 && miniMonth===0 ? "selected" : day<1 || day>31 ? "empty" : ""} onClick={() => { if (day > 0 && day <= 31) setWeekOffset(Math.floor((day - 5) / 7)); }}>{day>0 && day<=31 ? day : ""}</button>; })}</div></section>
            <section className="planner-card upcoming-card"><div className="planner-card-title"><span>Upcoming</span><Link className="upcoming-view-all" href="/planner/reminders">View all <span aria-hidden="true">→</span></Link></div>{data.reminders.filter((item) => !item.completed).slice(0,4).map((item) => <Link className="upcoming-row" href="/planner/reminders" key={item.id}><Bell size={18} /><span>{item.title}</span><small>{item.date}{item.time ? `, ${item.time}` : ""}</small></Link>)}</section>
            <section className="planner-card weekly-habits"><div className="planner-card-title"><span>Habits <small>(this week)</small></span><b>{habitMatrix.filter((days) => days.some(Boolean)).length} / 6</b></div>{["Skincare","Drink water","Exercise","Read","No soda","Journal"].map((habit,habitIndex) => <div className="rail-habit-row" key={habit}><span>{habit}</span>{habitMatrix[habitIndex].map((done,day) => <button key={day} className={done ? "done" : ""} onClick={() => setHabitMatrix((current) => current.map((days,row) => row === habitIndex ? days.map((value,column) => column === day ? !value : value) : days))} aria-label={`${habit} day ${day + 1}`} />)}</div>)}</section>
            <section className="planner-card quick-add-card"><div className="planner-card-title"><span>Quick add</span>{menu("quick", <><button onClick={() => openNewEvent()}>New event</button><Link href="/planner/tasks">New task</Link></>)}</div><div className="quick-add-grid"><Link href="/planner/tasks"><Target size={19} />Task</Link><button onClick={() => openNewEvent()}><CalendarDays size={19} />Event</button><Link href="/money"><WalletCards size={19} />Expense</Link><Link href="/lifestyle/habits"><Leaf size={19} />Habit</Link><Link href="/journal"><BookOpen size={19} />Journal</Link><Link href="/studio/outfits"><Shirt size={19} />Outfit</Link></div></section>
          </aside>
        </div>
      </section>

      {eventModal && <div className="planner-modal-backdrop" onMouseDown={() => setEventModal(false)}><form className="planner-modal calendar-event-modal" onSubmit={saveEvent} onMouseDown={(event) => event.stopPropagation()}><div><h2>{editingEvent ? "Edit event" : "New event"}</h2><button type="button" onClick={() => setEventModal(false)}>×</button></div><label>Title<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Event name" /></label><div className="modal-field-grid"><label>Day<select value={draft.day} onChange={(event) => setDraft({ ...draft, day: Number(event.target.value) })}>{dayNames.map((day,index) => <option value={index+1} key={day}>{day}</option>)}</select></label><label>Start<input type="time" step="1800" value={`${String(Math.floor(draft.start)).padStart(2,"0")}:${draft.start % 1 ? "30" : "00"}`} onChange={(event) => { const [hour,minute] = event.target.value.split(":").map(Number); setDraft({ ...draft, start: hour + minute / 60 }); }} /></label></div><div className="modal-field-grid"><label>Duration<select value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: Number(event.target.value) })}>{[.5,1,1.5,2,3,4,8].map((value) => <option value={value} key={value}>{value} hour{value === 1 ? "" : "s"}</option>)}</select></label><label>Color<select value={draft.tone} onChange={(event) => setDraft({ ...draft, tone: event.target.value as CalendarEvent["tone"] })}><optgroup label="Greens"><option value="green">Soft green</option><option value="olive">Olive green</option></optgroup><optgroup label="Pinks"><option value="pink">Blush pink</option><option value="rose">Dusty rose</option></optgroup><optgroup label="Neutrals"><option value="sand">Light sand</option><option value="taupe">Warm taupe</option></optgroup></select></label></div><label>Type<select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value as CalendarEvent["icon"] })}>{["work","food","study","workout","heart","journal","habit","outfit"].map((value) => <option value={value} key={value}>{value}</option>)}</select></label><div className="calendar-modal-actions">{editingEvent && <button type="button" className="delete-event" onClick={deleteEvent}><Trash2 size={16} /> Delete</button>}<button className="modal-submit"><Check size={16} /> Save event</button></div></form></div>}
    </main>
  );
}

function PeriodView({ activeTab, events, tasks, onAdd }: { activeTab: string; events: CalendarEvent[]; tasks: { id: string; title: string; completed: boolean }[]; onAdd: () => void }) {
  if (activeTab === "Daily") return <section className="planner-period-view"><div className="period-view-heading"><div><span>MONDAY, OCTOBER 5</span><h2>Daily plan</h2></div><button onClick={onAdd}><Plus size={16} /> Add event</button></div><div className="daily-plan-columns"><article><h3>Schedule</h3>{events.filter((event) => event.day === 1).map((event) => <div key={event.id}><b>{formatHour(event.start)}</b><span className={`tone-${event.tone}`}>{event.title}</span></div>)}</article><article><h3>Tasks</h3>{tasks.slice(0,5).map((task) => <p key={task.id}><i className={task.completed ? "done" : ""} />{task.title}</p>)}</article><article className="daily-note"><h3>Today’s intention</h3><p>Move through the day with focus and softness ♡</p></article></div></section>;
  if (activeTab === "Weekly") return <section className="planner-period-view"><div className="period-view-heading"><div><span>OCTOBER 4–10</span><h2>Weekly overview</h2></div><button onClick={onAdd}><Plus size={16} /> Add event</button></div><div className="weekly-overview-grid">{dayNames.map((day,index) => <article key={day}><h3>{day}</h3><strong>{events.filter((event) => event.day === index + 1).length}</strong><span>events</span>{events.filter((event) => event.day === index + 1).slice(0,3).map((event) => <i className={`tone-${event.tone}`} key={event.id}>{event.title}</i>)}</article>)}</div></section>;
  if (activeTab === "Monthly") return <section className="planner-period-view"><div className="period-view-heading"><div><span>2026</span><h2>October</h2></div><button onClick={onAdd}><Plus size={16} /> Add event</button></div><div className="monthly-overview-grid">{Array.from({length:35},(_,index) => { const day=index-3; return <article className={day<1||day>31 ? "empty" : ""} key={index}><b>{day>0&&day<=31 ? day : ""}</b>{day===5 && <><i className="tone-green">Work</i><i className="tone-sand">Study</i></>}</article>; })}</div></section>;
  const blocks = activeTab === "Quarterly" ? ["October","November","December"] : ["Winter","Spring","Summer","Autumn"];
  return <section className="planner-period-view"><div className="period-view-heading"><div><span>{activeTab.toUpperCase()} PLAN</span><h2>{activeTab === "Quarterly" ? "Q4 2026" : "2026 overview"}</h2></div><Link href="/planner/planning">Open planning</Link></div><div className="long-range-grid">{blocks.map((block,index) => <article key={block}><span>0{index+1}</span><h3>{block}</h3><p>{index+2} goals</p><div><i style={{width:`${35+index*17}%`}} /></div></article>)}</div></section>;
}
