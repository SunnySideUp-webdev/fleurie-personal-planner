"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
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
import { ReactNode, useState } from "react";
import { usePlannerData } from "../_data/use-planner-data";

const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar", active: true },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];

const plannerLinks = [
  ["Calendar", "/planner/calendar"],
  ["Planning", "/planner/planning"],
  ["Tasks", "/planner/tasks"],
  ["Reminders", "/planner/reminders"],
];

export function PlannerFrame({ active, actionLabel, onAdd, children }: { active: string; actionLabel: string; onAdd: () => void; children: ReactNode }) {
  const { data, toggleNotificationSetting } = usePlannerData();
  const [mobileNav, setMobileNav] = useState(false);
  const [headerPanel, setHeaderPanel] = useState<"search" | "notifications" | "settings" | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchResults = [
    ...data.tasks.map((item) => ({ id: item.id, title: item.title, meta: `Task · ${item.due}`, href: "/planner/tasks" })),
    ...data.reminders.map((item) => ({ id: item.id, title: item.title, meta: `Reminder · ${item.date}`, href: "/planner/reminders" })),
    ...data.goals.map((item) => ({ id: item.id, title: item.title, meta: `Goal · ${item.period}`, href: "/planner/planning" })),
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  return (
    <main className="app-shell planner-shell planner-module-shell">
      <aside className={`sidebar planner-module-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row"><img className="brand-logo" src="/daylily-logo.png" alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, href, active: isActive }) => <div key={label}><Link href={href} className={`nav-item ${isActive ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>{label === "Planner" && <div className="studio-subnav planner-module-subnav">{plannerLinks.map(([name, path]) => <Link key={name} href={path} className={active === name ? "active" : ""}>{name}</Link>)}</div>}</div>)}
        </nav>
        <div className="sidebar-art-slot planner-module-art" aria-hidden="true">Floral collage</div>
        <div className="profile-menu-wrap"><button className="profile-button" onClick={() => setProfileOpen((value) => !value)}><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></button>{profileOpen && <div className="profile-popover"><strong>Sunny’s planner</strong><small>Your planner data is saved on this device.</small><Link href="/planner/planning" onClick={() => setProfileOpen(false)}>Open planning settings</Link></div>}</div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <section className="planner-module-workspace">
        <header className="planner-header planner-module-header">
          <button className="mobile-menu planner-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
          <div><h1>Planner <Leaf size={31} /></h1><p>/ &nbsp;{active}</p></div>
          <div className="planner-actions">
            <button className="add-button" onClick={onAdd}><Plus size={20} /> {actionLabel}</button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "search" ? null : "search")} aria-label="Search"><Search size={20} /></button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "notifications" ? null : "notifications")} aria-label="Notifications"><Bell size={20} /></button>
            <button className="icon-button" onClick={() => setHeaderPanel(headerPanel === "settings" ? null : "settings")} aria-label="Settings"><Settings size={20} /></button>
            {headerPanel === "search" && <div className="calendar-header-panel search"><strong>Search planner</strong><label><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tasks, reminders or goals..." /></label><div>{query && searchResults.length ? searchResults.map((item) => <Link className="planner-search-result" href={item.href} onClick={() => setHeaderPanel(null)} key={`${item.href}-${item.id}`}><span>{item.title}</span><small>{item.meta}</small></Link>) : <small>{query ? "No matches found." : "Start typing to search your planner."}</small>}</div></div>}
            {headerPanel === "notifications" && <div className="calendar-header-panel notifications"><strong>Notifications</strong>{data.reminders.filter((item) => item.enabled && !item.completed).slice(0,4).map((item) => <Link href="/planner/reminders" onClick={() => setHeaderPanel(null)} key={item.id}><Bell size={15} /><span>{item.title}<small>{item.date}{item.time ? ` · ${item.time}` : ""}</small></span></Link>)}{!data.reminders.some((item) => item.enabled && !item.completed) && <small>You’re all caught up.</small>}<Link href="/planner/reminders" onClick={() => setHeaderPanel(null)}>View all reminders</Link></div>}
            {headerPanel === "settings" && <div className="calendar-header-panel settings"><strong>Planner settings</strong><label><span>Morning summary</span><button className={`reminder-toggle ${data.notificationSettings.morning ? "on" : ""}`} onClick={() => toggleNotificationSetting("morning")}><i /></button></label><label><span>Evening check-in</span><button className={`reminder-toggle ${data.notificationSettings.evening ? "on" : ""}`} onClick={() => toggleNotificationSetting("evening")}><i /></button></label><Link href="/planner/reminders" onClick={() => setHeaderPanel(null)}>Manage all reminders</Link></div>}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
