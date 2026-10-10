"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Heart,
  Home,
  ImagePlus,
  Leaf,
  ListChecks,
  Menu,
  MoreHorizontal,
  PenLine,
  Plus,
  RotateCw,
  Search,
  Settings,
  Shirt,
  Sparkles,
  Star,
  Tag,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  JournalCanvasItem,
  JournalEntry,
  JournalEntryType,
  JournalPrompt,
  JournalTag,
  journalTypes,
  useJournalData,
} from "../_data/use-journal-data";

export type JournalView = "entries" | "calendar" | "prompts" | "tags";
const tabs: { id: JournalView; label: string; href: string }[] = [
  { id: "entries", label: "Entries", href: "/journal" },
  { id: "calendar", label: "Calendar", href: "/journal/calendar" },
  { id: "prompts", label: "Prompts", href: "/journal/prompts" },
  { id: "tags", label: "Tags", href: "/journal/tags" },
];
const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: WalletCards, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal", active: true },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];
const moodLabels = ["Awful", "Bad", "Okay", "Good", "Amazing"];
const promptCategories = [
  "All",
  "Favorites",
  "Daily reflection",
  "Gratitude",
  "Self care",
  "Memory",
  "Growth",
];
const journalStickerOptions: Array<{ variant: NonNullable<JournalCanvasItem["variant"]>; label: string }> = [
  { variant: "flower", label: "Flower" },
  { variant: "heart", label: "Heart" },
  { variant: "sparkles", label: "Sparkles" },
];

function JournalStickerVisual({ variant }: { variant: NonNullable<JournalCanvasItem["variant"]> }) {
  if (variant === "heart") return <Heart />;
  if (variant === "sparkles") return <Sparkles />;
  return <Flower2 />;
}

function canvasItemsForEntry(entry: JournalEntry): JournalCanvasItem[] {
  if (entry.canvasItems) return entry.canvasItems;
  if (entry.id === "calm-day" && !entry.photos.length) {
    return [
      { id: "sample-flower", kind: "sticker", variant: "flower", x: 82, y: 4, size: 58, z: 1, rotation: -14, opacity: 1 },
      { id: "sample-heart", kind: "sticker", variant: "heart", x: 4, y: 72, size: 48, z: 2, rotation: -8, opacity: 1 },
    ];
  }
  return entry.photos.map((src, index): JournalCanvasItem => ({
    id: `photo-${entry.id}-${index}`,
    kind: "photo",
    src,
    x: 3 + index % 3 * 31,
    y: 54 + Math.floor(index / 3) * 25,
    size: 116,
    z: index + 1,
    rotation: [-2, 1, 3][index % 3],
    opacity: 1,
  }));
}

function asDate(value: string) {
  return new Date(`${value}T12:00:00`);
}
function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(asDate(value));
}
function shortDate(value: string) {
  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(asDate(value));
}
function monthTitle(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function MoodFace({ mood }: { mood: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    {mood === 0 && <><path d="M12 17.5 17 15M31 15l5 2.5" {...common} /><path d="M15 21v1M33 21v1" {...common} /><path d="M15 36c1.8-6 6.1-9 9-9s7.2 3 9 9" {...common} /></>}
    {mood === 1 && <><circle cx="16" cy="20" r="2.2" style={{ fill: "currentColor" }} /><circle cx="32" cy="20" r="2.2" style={{ fill: "currentColor" }} /><path d="M14.5 35c2.6-5.1 6.4-7.4 9.5-7.4s6.9 2.3 9.5 7.4" {...common} /></>}
    {mood === 2 && <><circle cx="16" cy="19.5" r="2.2" style={{ fill: "currentColor" }} /><circle cx="32" cy="19.5" r="2.2" style={{ fill: "currentColor" }} /><path d="M16 32h16" {...common} /></>}
    {mood === 3 && <><circle cx="16" cy="19" r="2.2" style={{ fill: "currentColor" }} /><circle cx="32" cy="19" r="2.2" style={{ fill: "currentColor" }} /><path d="M14.5 28c2.7 5.2 6.5 7.2 9.5 7.2s6.8-2 9.5-7.2" {...common} /></>}
    {mood === 4 && <><path d="M12.5 19c1.6-2.3 5.4-2.3 7 0M28.5 19c1.6-2.3 5.4-2.3 7 0" {...common} /><path d="M13.5 27.5c2 6.4 6.2 9.4 10.5 9.4s8.5-3 10.5-9.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" style={{ fill: "currentColor" }} /><path d="M19 33.8c3.2-1.4 6.8-1.4 10 0" fill="none" stroke="#ebb4b2" strokeWidth="2" strokeLinecap="round" /></>}
  </svg>;
}

function readFiles(files: FileList | null) {
  if (!files) return Promise.resolve<string[]>([]);
  return Promise.all(
    Array.from(files)
      .slice(0, 6)
      .map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
  );
}

export default function JournalDashboard({ view }: { view: JournalView }) {
  const {
    entries,
    tags,
    prompts,
    addEntry,
    updateEntry,
    removeEntry,
    addTag,
    renameTag,
    removeTag,
    addPrompt,
    togglePromptFavorite,
    removePrompt,
  } = useJournalData();
  const [mobileNav, setMobileNav] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("2026-10");
  const [activeType, setActiveType] = useState<"All" | JournalEntryType>("All");
  const [selectedId, setSelectedId] = useState("calm-day");
  const [selectedDate, setSelectedDate] = useState("2026-10-05");
  const [entryModal, setEntryModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("2026-10-06");
  const [formType, setFormType] = useState<JournalEntryType>("Diary");
  const [formMood, setFormMood] = useState(3);
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [openEntryMenu, setOpenEntryMenu] = useState<string | null>(null);
  const [formPromptId, setFormPromptId] = useState<string | undefined>();
  const [promptFilter, setPromptFilter] = useState("All");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customPromptCategory, setCustomPromptCategory] =
    useState("Daily reflection");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState<JournalTag["color"]>("rose");
  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [directSaved, setDirectSaved] = useState(false);
  const [directTagMenu, setDirectTagMenu] = useState(false);
  const [stickerMenuOpen, setStickerMenuOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<JournalCanvasItem[]>([]);
  const [selectedCanvasItemId, setSelectedCanvasItemId] = useState<string | null>(null);
  const directTitleRef = useRef<HTMLHeadingElement>(null);
  const directContentRef = useRef<HTMLDivElement>(null);
  const journalCanvasRef = useRef<HTMLDivElement>(null);
  const canvasItemsRef = useRef<JournalCanvasItem[]>([]);
  const journalDragRef = useRef<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);

  useEffect(() => {
    function closeEntryMenu(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".entry-card-menu")) setOpenEntryMenu(null);
    }
    document.addEventListener("click", closeEntryMenu);
    return () => document.removeEventListener("click", closeEntryMenu);
  }, []);

  useEffect(() => {
    function closeStickerMenu(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".journal-sticker-menu-wrap")) setStickerMenuOpen(false);
    }
    document.addEventListener("click", closeStickerMenu);
    return () => document.removeEventListener("click", closeStickerMenu);
  }, []);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );
  const visibleEntries = sortedEntries.filter(
    (entry) =>
      entry.date.startsWith(month) &&
      (activeType === "All" || entry.type === activeType) &&
      `${entry.title} ${entry.content} ${entry.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selectedEntry =
    entries.find((entry) => entry.id === selectedId) ??
    visibleEntries[0] ??
    sortedEntries[0];
  const selectedCanvasItem = canvasItems.find((item) => item.id === selectedCanvasItemId);

  useEffect(() => {
    const next = selectedEntry ? canvasItemsForEntry(selectedEntry) : [];
    canvasItemsRef.current = next;
    setCanvasItems(next);
    setSelectedCanvasItemId(null);
    setStickerMenuOpen(false);
  }, [selectedEntry?.id]);
  const searchResults = query.trim()
    ? sortedEntries
        .filter((entry) =>
          `${entry.title} ${entry.content} ${entry.tags.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const filteredPrompts = prompts.filter(
    (prompt) =>
      (promptFilter === "All" ||
        (promptFilter === "Favorites"
          ? prompt.favorite
          : prompt.category === promptFilter)) &&
      prompt.text.toLowerCase().includes(query.toLowerCase()),
  );
  const tagCounts = tags
    .map((tag) => ({
      ...tag,
      count: entries.filter((entry) => entry.tags.includes(tag.label)).length,
    }))
    .sort((a, b) => b.count - a.count);
  const selectedDateEntries = sortedEntries.filter(
    (entry) => entry.date === selectedDate,
  );
  const typeCounts = journalTypes.map((type) => ({
    type,
    count: entries.filter((entry) => entry.type === type).length,
  }));
  const monthMoods = entries
    .filter((entry) => entry.date.startsWith(month))
    .map((entry) => entry.mood);
  const favoriteMonthMood = monthMoods.length
    ? [0, 1, 2, 3, 4].sort(
        (a, b) =>
          monthMoods.filter((mood) => mood === b).length -
          monthMoods.filter((mood) => mood === a).length,
      )[0]
    : 2;

  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const calendarCells = Array.from(
    { length: firstWeekday + daysInMonth },
    (_, index) => (index < firstWeekday ? null : index - firstWeekday + 1),
  );

  function shiftMonth(delta: number) {
    const next = new Date(year, monthNumber - 1 + delta, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  }
  function openEntry(
    entry?: JournalEntry,
    preset?: { type?: JournalEntryType; date?: string; prompt?: JournalPrompt },
  ) {
    setAddOpen(false);
    setEditingId(entry?.id ?? null);
    setFormTitle(entry?.title ?? (preset?.prompt ? "Journal prompt" : ""));
    setFormDate(entry?.date ?? preset?.date ?? "2026-10-06");
    setFormType(
      entry?.type ??
        preset?.type ??
        (preset?.prompt?.category === "Gratitude"
          ? "Gratitude"
          : preset?.prompt?.category === "Memory"
            ? "Memory"
            : "Reflection"),
    );
    setFormMood(entry?.mood ?? 3);
    setFormContent(
      entry?.content ?? (preset?.prompt ? `${preset.prompt.text}\n\n` : ""),
    );
    setFormTags(entry?.tags ?? []);
    setFormPhotos(entry?.photos ?? []);
    setFormPromptId(entry?.promptId ?? preset?.prompt?.id);
    setEntryModal(true);
  }
  function saveEntry(event: FormEvent) {
    event.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;
    const value = {
      date: formDate,
      title: formTitle.trim(),
      type: formType,
      tags: formTags,
      content: formContent.trim(),
      mood: formMood,
      photos: formPhotos,
      favorite: editingId
        ? (entries.find((entry) => entry.id === editingId)?.favorite ?? false)
        : false,
      promptId: formPromptId,
    };
    if (editingId) updateEntry(editingId, value);
    else setSelectedId(addEntry(value));
    setEntryModal(false);
    setMonth(formDate.slice(0, 7));
  }
  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const images = await readFiles(event.target.files);
    setFormPhotos((current) => [...current, ...images].slice(0, 6));
    event.target.value = "";
  }
  function showDirectSaved() {
    setDirectSaved(true);
    window.setTimeout(() => setDirectSaved(false), 1400);
  }
  function saveDirectTitle(entry: JournalEntry, value: string) {
    const title = value.trim();
    if (!title) {
      if (directTitleRef.current)
        directTitleRef.current.textContent = entry.title;
      return;
    }
    if (title !== entry.title) updateEntry(entry.id, { title });
    showDirectSaved();
  }
  function saveDirectContent(entry: JournalEntry, value: string) {
    const content = value.trim();
    if (!content) {
      if (directContentRef.current)
        directContentRef.current.textContent = entry.content;
      return;
    }
    if (content !== entry.content) updateEntry(entry.id, { content });
    showDirectSaved();
  }
  async function addDirectPhotos(
    event: ChangeEvent<HTMLInputElement>,
    entry: JournalEntry,
  ) {
    const images = await readFiles(event.target.files);
    const accepted = images.slice(0, Math.max(0, 10 - entry.photos.length));
    const highestLayer = Math.max(0, ...canvasItemsRef.current.map((item) => item.z));
    const additions = accepted.map((src, index): JournalCanvasItem => ({
      id: crypto.randomUUID(),
      kind: "photo",
      src,
      x: 4 + (canvasItemsRef.current.length + index) % 3 * 29,
      y: 52 + Math.floor((canvasItemsRef.current.length + index) % 6 / 3) * 24,
      size: 116,
      z: highestLayer + index + 1,
      rotation: [-2, 1, 3][(canvasItemsRef.current.length + index) % 3],
      opacity: 1,
    }));
    const next = [...canvasItemsRef.current, ...additions];
    canvasItemsRef.current = next;
    setCanvasItems(next);
    updateEntry(entry.id, { photos: [...entry.photos, ...accepted], canvasItems: next });
    if (additions.length) setSelectedCanvasItemId(additions.at(-1)?.id ?? null);
    showDirectSaved();
    event.target.value = "";
  }
  function persistCanvas(entry: JournalEntry, next: JournalCanvasItem[], showSaved = true) {
    canvasItemsRef.current = next;
    setCanvasItems(next);
    updateEntry(entry.id, { canvasItems: next });
    if (showSaved) showDirectSaved();
  }
  function addJournalSticker(entry: JournalEntry, value: { variant?: JournalCanvasItem["variant"]; src?: string }) {
    const highestLayer = Math.max(0, ...canvasItemsRef.current.map((item) => item.z));
    const item: JournalCanvasItem = {
      id: crypto.randomUUID(),
      kind: "sticker",
      ...value,
      x: 67,
      y: 24 + canvasItemsRef.current.filter((candidate) => candidate.kind === "sticker").length % 3 * 12,
      size: 82,
      z: highestLayer + 1,
      rotation: -8,
      opacity: 1,
    };
    persistCanvas(entry, [...canvasItemsRef.current, item]);
    setSelectedCanvasItemId(item.id);
    setStickerMenuOpen(false);
  }
  async function addDirectStickers(event: ChangeEvent<HTMLInputElement>, entry: JournalEntry) {
    const images = await readFiles(event.target.files);
    if (!images.length) return;
    let highestLayer = Math.max(0, ...canvasItemsRef.current.map((item) => item.z));
    const additions = images.map((src, index): JournalCanvasItem => ({
      id: crypto.randomUUID(),
      kind: "sticker",
      src,
      x: 64 - index * 5,
      y: 22 + index * 8,
      size: 82,
      z: ++highestLayer,
      rotation: index % 2 ? 7 : -7,
      opacity: 1,
    }));
    persistCanvas(entry, [...canvasItemsRef.current, ...additions]);
    setSelectedCanvasItemId(additions.at(-1)?.id ?? null);
    setStickerMenuOpen(false);
    event.target.value = "";
  }
  function canvasItemHeight(item: JournalCanvasItem) {
    return item.kind === "photo" ? item.size * 1.24 : item.size;
  }
  function constrainJournalItem(item: JournalCanvasItem, x: number, y: number) {
    const canvas = journalCanvasRef.current;
    if (!canvas) return { x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(85, y)) };
    const maxX = Math.max(0, 100 - item.size / canvas.clientWidth * 100);
    const maxY = Math.max(0, 100 - canvasItemHeight(item) / canvas.clientHeight * 100);
    return { x: Math.max(0, Math.min(maxX, x)), y: Math.max(0, Math.min(maxY, y)) };
  }
  function startJournalDrag(event: ReactPointerEvent<HTMLButtonElement>, item: JournalCanvasItem) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    journalDragRef.current = { id: item.id, startX: event.clientX, startY: event.clientY, x: item.x, y: item.y };
    setSelectedCanvasItemId(item.id);
  }
  function moveJournalDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = journalDragRef.current;
    const canvas = journalCanvasRef.current;
    if (!drag || !canvas) return;
    const item = canvasItemsRef.current.find((candidate) => candidate.id === drag.id);
    if (!item) return;
    const rect = canvas.getBoundingClientRect();
    const position = constrainJournalItem(item, drag.x + (event.clientX - drag.startX) / rect.width * 100, drag.y + (event.clientY - drag.startY) / rect.height * 100);
    const next = canvasItemsRef.current.map((candidate) => candidate.id === drag.id ? { ...candidate, ...position } : candidate);
    canvasItemsRef.current = next;
    setCanvasItems(next);
  }
  function stopJournalDrag(event: ReactPointerEvent<HTMLButtonElement>, entry: JournalEntry) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (journalDragRef.current) persistCanvas(entry, canvasItemsRef.current);
    journalDragRef.current = null;
  }
  function updateSelectedCanvasItem(entry: JournalEntry, update: (item: JournalCanvasItem) => JournalCanvasItem) {
    if (!selectedCanvasItemId) return;
    const next = canvasItemsRef.current.map((item) => item.id === selectedCanvasItemId ? update(item) : item);
    persistCanvas(entry, next);
  }
  function resizeSelectedCanvasItem(entry: JournalEntry, delta: number) {
    updateSelectedCanvasItem(entry, (item) => {
      const resized = { ...item, size: Math.max(44, Math.min(260, item.size + delta)) };
      return { ...resized, ...constrainJournalItem(resized, resized.x, resized.y) };
    });
  }
  function moveSelectedCanvasLayer(entry: JournalEntry, front: boolean) {
    const layers = canvasItemsRef.current.map((item) => item.z);
    updateSelectedCanvasItem(entry, (item) => ({ ...item, z: front ? Math.max(0, ...layers) + 1 : Math.min(0, ...layers) - 1 }));
  }
  function removeSelectedCanvasItem(entry: JournalEntry) {
    const selected = canvasItemsRef.current.find((item) => item.id === selectedCanvasItemId);
    if (!selected) return;
    const next = canvasItemsRef.current.filter((item) => item.id !== selected.id);
    canvasItemsRef.current = next;
    setCanvasItems(next);
    setSelectedCanvasItemId(null);
    updateEntry(entry.id, {
      canvasItems: next,
      photos: selected.kind === "photo" && selected.src ? entry.photos.filter((photo) => photo !== selected.src) : entry.photos,
    });
    showDirectSaved();
  }
  async function changeEntryCover(
    event: ChangeEvent<HTMLInputElement>,
    entry: JournalEntry,
  ) {
    const [image] = await readFiles(event.target.files);
    if (image) updateEntry(entry.id, { coverImage: image });
    setOpenEntryMenu(null);
    event.target.value = "";
  }
  function toggleFormTag(label: string) {
    setFormTags((current) =>
      current.includes(label)
        ? current.filter((tag) => tag !== label)
        : [...current, label],
    );
  }
  function usePrompt(prompt: JournalPrompt) {
    openEntry(undefined, { prompt });
  }
  function submitPrompt(event: FormEvent) {
    event.preventDefault();
    addPrompt(customPrompt, customPromptCategory);
    setCustomPrompt("");
  }
  function submitTag(event: FormEvent) {
    event.preventDefault();
    addTag(tagName, tagColor);
    setTagName("");
  }

  return (
    <main className="app-shell journal-shell">
      <aside
        className={`sidebar journal-sidebar ${mobileNav ? "is-open" : ""}`}
      >
        <div className="brand-row">
          <img className="brand-logo" src="/daylily-logo.png" alt="Daylily" />
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X />
          </button>
        </div>
        <nav>
          {navigation.map(({ label, icon: Icon, href, active }) => (
            <div key={label}>
              <Link
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={24} />
                <span>{label}</span>
              </Link>
              {label === "Journal" && (
                <div className="studio-subnav journal-subnav">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={view === tab.id ? "active" : ""}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-art-slot journal-sidebar-art">
          <Flower2 /> Floral collage
        </div>
        <Link className="profile-button" href="/">
          <span className="avatar">S</span>
          <span>Sunny</span>
          <Settings size={20} />
        </Link>
      </aside>
      {mobileNav && (
        <button className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <section className="journal-workspace">
        <header className="journal-header">
          <button
            className="mobile-menu journal-mobile-menu"
            onClick={() => setMobileNav(true)}
          >
            <Menu />
          </button>
          <div>
            <h1>
              Journal <BookOpen />
            </h1>
            <p>A SAFE SPACE FOR MY THOUGHTS ♡</p>
          </div>
          <div className="journal-actions">
            <div className="add-wrapper">
              <button
                className="add-button"
                onClick={() => setAddOpen((value) => !value)}
              >
                <Plus size={20} /> New entry <ChevronDown size={14} />
              </button>
              {addOpen && (
                <div className="add-menu">
                  {journalTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => openEntry(undefined, { type })}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="icon-button"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search />
            </button>
            <Link className="icon-button" href="/planner/reminders">
              <Bell />
            </Link>
            <button
              className="icon-button"
              onClick={() => setSettingsOpen((value) => !value)}
            >
              <Settings />
            </button>
            {settingsOpen && (
              <div className="calendar-header-panel settings journal-settings-panel">
                <strong>Journal settings</strong>
                <label>
                  <span>Show entry photos</span>
                  <button
                    className={`reminder-toggle ${showImages ? "on" : ""}`}
                    onClick={() => setShowImages((value) => !value)}
                  >
                    <i />
                  </button>
                </label>
                <small>{entries.length} entries stored on this device.</small>
              </div>
            )}
          </div>
        </header>
        <div className="journal-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              className={view === tab.id ? "active" : ""}
              href={tab.href}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {searchOpen && (
          <>
            <label className="journal-global-search">
              <Search size={17} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search entries or tags..."
              />
              <button
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                <X size={15} />
              </button>
            </label>
            {query.trim() && view !== "prompts" && (
              <section className="journal-search-results">
                {searchResults.length ? (
                  searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                        if (view === "entries") {
                          setSelectedId(entry.id);
                          setMonth(entry.date.slice(0, 7));
                        } else openEntry(entry);
                      }}
                    >
                      <BookOpen size={17} />
                      <span>
                        <strong>{entry.title}</strong>
                        <small>
                          {shortDate(entry.date)} · {entry.type}
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>No entries found.</p>
                )}
              </section>
            )}
          </>
        )}

        {view === "entries" && (
          <div className="journal-layout">
            <section className="journal-library-panel journal-panel">
              <div className="journal-library-heading">
                <div className="journal-month-control">
                  <button onClick={() => shiftMonth(-1)}>
                    <ChevronLeft />
                  </button>
                  <h2>{monthTitle(month)}</h2>
                  <button onClick={() => shiftMonth(1)}>
                    <ChevronRight />
                  </button>
                </div>
              </div>
              <div className="journal-filters">
                {["All", ...journalTypes].map((filter) => (
                  <button
                    key={filter}
                    className={activeType === filter ? "active" : ""}
                    onClick={() => setActiveType(filter as typeof activeType)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="journal-entry-grid">
                {visibleEntries.length ? (
                  visibleEntries.map((entry) => (
                    <article
                      className={`journal-entry-card ${selectedEntry?.id === entry.id ? "selected" : ""} ${openEntryMenu === entry.id ? "menu-open" : ""}`}
                      key={entry.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedId(entry.id);
                        setDirectTagMenu(false);
                        setOpenEntryMenu(null);
                      }}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
                          event.preventDefault();
                          setSelectedId(entry.id);
                          setDirectTagMenu(false);
                          setOpenEntryMenu(null);
                        }
                      }}
                    >
                      <span className="entry-date">
                        <span>{shortDate(entry.date)}</span>
                        <span className="entry-card-actions">
                          {entry.favorite && <Heart className="entry-favorite-mark" size={13} />}
                          <span className="entry-card-menu" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              className="entry-card-menu-trigger"
                              onClick={() => setOpenEntryMenu((current) => current === entry.id ? null : entry.id)}
                              aria-label={`Actions for ${entry.title}`}
                              aria-expanded={openEntryMenu === entry.id}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openEntryMenu === entry.id && (
                              <span className="entry-card-popover">
                                <button type="button" onClick={() => { setOpenEntryMenu(null); openEntry(entry); }}><PenLine size={14} /> Edit entry</button>
                                <label>
                                  <ImagePlus size={14} /> {entry.coverImage ? "Change cover" : "Add cover"}
                                  <input hidden type="file" accept="image/*" onChange={(event) => void changeEntryCover(event, entry)} />
                                </label>
                                {entry.coverImage && <button type="button" onClick={() => { updateEntry(entry.id, { coverImage: undefined }); setOpenEntryMenu(null); }}><X size={14} /> Remove cover</button>}
                                <button type="button" onClick={() => { updateEntry(entry.id, { favorite: !entry.favorite }); setOpenEntryMenu(null); }}><Heart size={14} /> {entry.favorite ? "Remove favorite" : "Add favorite"}</button>
                                <button type="button" className="danger" onClick={() => { setOpenEntryMenu(null); if (window.confirm(`Delete “${entry.title}”?`)) { removeEntry(entry.id); if (selectedId === entry.id) setSelectedId(""); } }}><Trash2 size={14} /> Delete entry</button>
                              </span>
                            )}
                          </span>
                        </span>
                      </span>
                      <strong>{entry.title}</strong>
                      {showImages && entry.coverImage ? (
                        <span className="entry-art uploaded">
                          <img src={entry.coverImage} alt={`${entry.title} cover`} />
                        </span>
                      ) : (
                        <span
                          className={`entry-art art-${entry.type.toLowerCase()}`}
                        >
                          <Flower2 />
                          <i>♡</i>
                        </span>
                      )}
                      <span className="entry-chips">
                        <i>{entry.type}</i>
                        {entry.tags[0] && <i>{entry.tags[0]}</i>}
                      </span>
                    </article>
                  ))
                ) : (
                  <div className="journal-empty-library">
                    <BookOpen />
                    <p>No entries match this month and filter.</p>
                    <button
                      onClick={() =>
                        openEntry(undefined, { date: `${month}-01` })
                      }
                    >
                      Create entry
                    </button>
                  </div>
                )}
              </div>
            </section>
            <article className="journal-reading-panel journal-panel">
              {selectedEntry ? (
                <>
                  <div className="journal-reading-meta">
                    <span>
                      {displayDate(selectedEntry.date)} · {selectedEntry.type}
                    </span>
                    <div>
                      <div className="journal-sticker-menu-wrap" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => setStickerMenuOpen((value) => !value)}>
                          <Sparkles size={16} /> Stickers <ChevronDown size={13} />
                        </button>
                        {stickerMenuOpen && (
                          <div className="journal-sticker-menu">
                            <strong>Add a sticker</strong>
                            <div>
                              {journalStickerOptions.map((sticker) => (
                                <button key={sticker.variant} onClick={() => addJournalSticker(selectedEntry, { variant: sticker.variant })} aria-label={`Add ${sticker.label} sticker`}>
                                  <JournalStickerVisual variant={sticker.variant} />
                                  <small>{sticker.label}</small>
                                </button>
                              ))}
                            </div>
                            <label>
                              <ImagePlus size={15} /> Upload sticker
                              <input hidden type="file" accept="image/png,image/webp,image/jpeg" multiple onChange={(event) => addDirectStickers(event, selectedEntry)} />
                            </label>
                          </div>
                        )}
                      </div>
                      {directSaved && (
                        <span className="journal-direct-saved">Saved ✓</span>
                      )}
                      <label className="journal-header-photo-action">
                        <ImagePlus size={16} /> Add photos
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) =>
                            addDirectPhotos(event, selectedEntry)
                          }
                        />
                      </label>
                      <button
                        className="danger-icon"
                        onClick={() => {
                          if (
                            window.confirm(`Delete “${selectedEntry.title}”?`)
                          ) {
                            removeEntry(selectedEntry.id);
                            setSelectedId("");
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="journal-title-row">
                    <h2
                      key={`title-${selectedEntry.id}`}
                      ref={directTitleRef}
                      className="journal-direct-title"
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Entry title..."
                      onBlur={(event) =>
                        saveDirectTitle(
                          selectedEntry,
                          event.currentTarget.innerText,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                          directContentRef.current?.focus();
                        }
                      }}
                    >
                      {selectedEntry.title}
                    </h2>
                  </div>
                  <div
                    ref={journalCanvasRef}
                    className="journal-page-canvas"
                    onPointerDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (!target.closest(".journal-canvas-item, .journal-canvas-controls")) setSelectedCanvasItemId(null);
                    }}
                  >
                    <div
                      key={`content-${selectedEntry.id}`}
                      ref={directContentRef}
                      className="journal-copy journal-direct-copy"
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Write anywhere on this page..."
                      onBlur={(event) =>
                        saveDirectContent(
                          selectedEntry,
                          event.currentTarget.innerText,
                        )
                      }
                    >
                      {selectedEntry.content}
                    </div>
                    {canvasItems.filter((item) => item.kind === "sticker" || showImages).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`journal-canvas-item ${item.kind} ${selectedCanvasItemId === item.id ? "selected" : ""}`}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: item.size,
                          height: canvasItemHeight(item),
                          zIndex: 10 + item.z,
                          transform: `rotate(${item.rotation}deg)`,
                          opacity: item.opacity ?? 1,
                        }}
                        onPointerDown={(event) => startJournalDrag(event, item)}
                        onPointerMove={moveJournalDrag}
                        onPointerUp={(event) => stopJournalDrag(event, selectedEntry)}
                        onPointerCancel={(event) => stopJournalDrag(event, selectedEntry)}
                        aria-label={`Move ${item.kind}`}
                      >
                        {item.src ? <img src={item.src} alt="" draggable={false} /> : item.variant ? <JournalStickerVisual variant={item.variant} /> : null}
                      </button>
                    ))}
                    {selectedCanvasItem && (
                      <div className="journal-canvas-controls">
                        <button type="button" onClick={() => resizeSelectedCanvasItem(selectedEntry, -14)} aria-label="Make smaller">−</button>
                        <button type="button" onClick={() => resizeSelectedCanvasItem(selectedEntry, 14)} aria-label="Make larger">+</button>
                        <button type="button" onClick={() => updateSelectedCanvasItem(selectedEntry, (item) => ({ ...item, rotation: (item.rotation + 15) % 360 }))} aria-label="Rotate"><RotateCw size={14} /></button>
                        <button type="button" onClick={() => moveSelectedCanvasLayer(selectedEntry, false)}>Back</button>
                        <button type="button" onClick={() => moveSelectedCanvasLayer(selectedEntry, true)}>Front</button>
                        <label className="journal-opacity-control" title="Opacity">
                          <span>{Math.round((selectedCanvasItem.opacity ?? 1) * 100)}%</span>
                          <input
                            type="range"
                            min="0.15"
                            max="1"
                            step="0.05"
                            value={selectedCanvasItem.opacity ?? 1}
                            onChange={(event) => updateSelectedCanvasItem(selectedEntry, (item) => ({ ...item, opacity: Number(event.target.value) }))}
                            aria-label="Opacity"
                          />
                        </label>
                        <button type="button" className="remove" onClick={() => removeSelectedCanvasItem(selectedEntry)} aria-label="Remove"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  <div className="journal-tag-bar">
                    <Tag size={19} />
                    {selectedEntry.tags.map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          updateEntry(selectedEntry.id, {
                            tags: selectedEntry.tags.filter(
                              (tag) => tag !== label,
                            ),
                          });
                          showDirectSaved();
                        }}
                      >
                        {label} <X size={11} />
                      </button>
                    ))}
                    <button
                      className="add-tag"
                      onClick={() => {
                        setDirectTagMenu((value) => !value);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                    {directTagMenu && (
                      <div className="journal-inline-tag-picker">
                        {tags.map((tag) => (
                          <button
                            className={
                              selectedEntry.tags.includes(tag.label)
                                ? "selected"
                                : ""
                            }
                            onClick={() => {
                              updateEntry(selectedEntry.id, {
                                tags: selectedEntry.tags.includes(tag.label)
                                  ? selectedEntry.tags.filter(
                                      (label) => label !== tag.label,
                                    )
                                  : [...selectedEntry.tags, tag.label],
                              });
                              showDirectSaved();
                            }}
                            key={tag.id}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="journal-reading-empty">
                  <BookOpen />
                  <h2>Your journal is ready</h2>
                  <p>Create an entry to begin.</p>
                  <button onClick={() => openEntry()}>
                    <Plus size={16} /> New entry
                  </button>
                </div>
              )}
            </article>
            <aside className="journal-right-column">
              <section className="journal-panel journal-calendar">
                <div className="journal-side-heading">
                  <h2>{monthTitle(month)}</h2>
                  <span>
                    <button onClick={() => shiftMonth(-1)}>
                      <ChevronLeft />
                    </button>
                    <button onClick={() => shiftMonth(1)}>
                      <ChevronRight />
                    </button>
                  </span>
                </div>
                <div className="mini-calendar-grid">
                  <b>S</b>
                  <b>M</b>
                  <b>T</b>
                  <b>W</b>
                  <b>T</b>
                  <b>F</b>
                  <b>S</b>
                  {calendarCells.map((day, index) =>
                    day ? (
                      <button
                        className={`${selectedEntry?.date === `${month}-${String(day).padStart(2, "0")}` ? "selected" : ""} ${entries.some((entry) => entry.date === `${month}-${String(day).padStart(2, "0")}`) ? "has-entry" : ""}`}
                        key={index}
                        onClick={() => {
                          const date = `${month}-${String(day).padStart(2, "0")}`;
                          const entry = sortedEntries.find(
                            (item) => item.date === date,
                          );
                          if (entry) {
                            setSelectedId(entry.id);
                            setDirectTagMenu(false);
                          }
                        }}
                      >
                        {day}
                      </button>
                    ) : (
                      <i key={index} />
                    ),
                  )}
                </div>
              </section>
              <section className="journal-panel journal-mood-panel">
                <div className="journal-side-heading">
                  <h2>Mood</h2>
                </div>
                <div className="journal-mood-row">
                  {[0, 1, 2, 3, 4].map((mood) => (
                    <button
                      className={selectedEntry?.mood === mood ? "selected" : ""}
                      key={mood}
                      onClick={() =>
                        selectedEntry && updateEntry(selectedEntry.id, { mood })
                      }
                    >
                      <MoodFace mood={mood} />
                    </button>
                  ))}
                </div>
                <p>
                  {selectedEntry
                    ? moodLabels[selectedEntry.mood]
                    : "No mood selected"}{" "}
                  <Heart size={14} />
                </p>
              </section>
              <section className="journal-panel journal-types-panel">
                <div className="journal-side-heading">
                  <h2>Entry types</h2>
                </div>
                {typeCounts.map(({ type, count }, index) => (
                  <button key={type} onClick={() => setActiveType(type)}>
                    <i className={["rose", "green", "sand", "dusty"][index]} />
                    <span>{type}</span>
                    <b>{count}</b>
                  </button>
                ))}
              </section>
              <section className="journal-panel journal-tags-panel">
                <div className="journal-side-heading">
                  <h2>Tags</h2>
                  <Link href="/journal/tags">View all →</Link>
                </div>
                {tagCounts.slice(0, 6).map((tag) => (
                  <button key={tag.id} onClick={() => setQuery(tag.label)}>
                    <span className={tag.color}>
                      <Bookmark size={12} />
                      {tag.label}
                    </span>
                    <b>{tag.count}</b>
                  </button>
                ))}
              </section>
            </aside>
          </div>
        )}

        {view === "calendar" && (
          <div className="journal-calendar-view">
            <section className="journal-panel journal-full-calendar">
              <header>
                <div>
                  <button onClick={() => shiftMonth(-1)}>
                    <ChevronLeft />
                  </button>
                  <h2>{monthTitle(month)}</h2>
                  <button onClick={() => shiftMonth(1)}>
                    <ChevronRight />
                  </button>
                </div>
                <button
                  onClick={() => openEntry(undefined, { date: selectedDate })}
                >
                  <Plus size={16} /> Entry on selected date
                </button>
              </header>
              <div className="journal-weekdays">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <b key={day}>{day}</b>
                ))}
              </div>
              <div className="journal-month-grid">
                {calendarCells.map((day, index) => {
                  if (!day) return <i key={index} />;
                  const date = `${month}-${String(day).padStart(2, "0")}`;
                  const dayEntries = sortedEntries.filter(
                    (entry) => entry.date === date,
                  );
                  return (
                    <button
                      key={date}
                      className={selectedDate === date ? "selected" : ""}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span>{day}</span>
                      {dayEntries.slice(0, 2).map((entry) => (
                        <small
                          className={entry.type.toLowerCase()}
                          key={entry.id}
                        >
                          {entry.title}
                        </small>
                      ))}
                      {dayEntries.length > 2 && (
                        <em>+{dayEntries.length - 2} more</em>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
            <aside className="journal-calendar-agenda">
              <section className="journal-panel">
                <h2>{displayDate(selectedDate)}</h2>
                {selectedDateEntries.length ? (
                  selectedDateEntries.map((entry) => (
                    <button key={entry.id} onClick={() => openEntry(entry)}>
                      <span>
                        <MoodFace mood={entry.mood} />
                      </span>
                      <div>
                        <strong>{entry.title}</strong>
                        <small>
                          {entry.type} · {entry.tags.join(", ")}
                        </small>
                      </div>
                      <ChevronRight />
                    </button>
                  ))
                ) : (
                  <div className="journal-day-empty">
                    <p>No entries for this day.</p>
                    <button
                      onClick={() =>
                        openEntry(undefined, { date: selectedDate })
                      }
                    >
                      <Plus size={15} /> Write something
                    </button>
                  </div>
                )}
              </section>
              <section className="journal-panel journal-calendar-stats">
                <h2>This month</h2>
                <div>
                  <span>Entries</span>
                  <strong>
                    {
                      entries.filter((entry) => entry.date.startsWith(month))
                        .length
                    }
                  </strong>
                </div>
                <div>
                  <span>Days written</span>
                  <strong>
                    {
                      new Set(
                        entries
                          .filter((entry) => entry.date.startsWith(month))
                          .map((entry) => entry.date),
                      ).size
                    }
                  </strong>
                </div>
                <div>
                  <span>Favorite mood</span>
                  <strong>{moodLabels[favoriteMonthMood]}</strong>
                </div>
              </section>
            </aside>
          </div>
        )}

        {view === "prompts" && (
          <div className="journal-prompts-view">
            <section className="journal-prompt-hero">
              <Flower2 />
              <div>
                <h2>A gentle place to begin</h2>
                <p>
                  Choose a prompt whenever the blank page feels a little too
                  quiet.
                </p>
              </div>
              <button onClick={() => openEntry()}>
                <PenLine size={16} /> Free write
              </button>
            </section>
            <div className="journal-prompt-filters">
              {promptCategories.map((category) => (
                <button
                  className={promptFilter === category ? "active" : ""}
                  key={category}
                  onClick={() => setPromptFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="journal-prompt-layout">
              <section className="journal-prompt-grid">
                {filteredPrompts.map((prompt) => (
                  <article className="journal-panel" key={prompt.id}>
                    <header>
                      <span>{prompt.category}</span>
                      <button
                        className={prompt.favorite ? "favorite" : ""}
                        onClick={() => togglePromptFavorite(prompt.id)}
                      >
                        <Star />
                      </button>
                    </header>
                    <p>{prompt.text}</p>
                    <footer>
                      <button onClick={() => usePrompt(prompt)}>
                        <PenLine size={15} /> Write from this
                      </button>
                      {prompt.custom && (
                        <button
                          className="prompt-delete"
                          onClick={() => {
                            if (window.confirm("Delete this prompt?"))
                              removePrompt(prompt.id);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </section>
              <aside className="journal-panel journal-custom-prompt">
                <h2>Create a prompt</h2>
                <p>Add questions that feel meaningful to you.</p>
                <form onSubmit={submitPrompt}>
                  <label>
                    Prompt
                    <textarea
                      required
                      value={customPrompt}
                      onChange={(event) => setCustomPrompt(event.target.value)}
                      placeholder="What would you like to reflect on?"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={customPromptCategory}
                      onChange={(event) =>
                        setCustomPromptCategory(event.target.value)
                      }
                    >
                      {promptCategories
                        .filter((item) => !["All", "Favorites"].includes(item))
                        .map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                    </select>
                  </label>
                  <button>
                    <Plus size={16} /> Save prompt
                  </button>
                </form>
              </aside>
            </div>
          </div>
        )}

        {view === "tags" && (
          <div className="journal-tags-view">
            <section className="journal-panel journal-tag-manager">
              <header>
                <div>
                  <h2>Tags</h2>
                  <p>Organize entries in a way that makes sense to you.</p>
                </div>
                <Tag />
              </header>
              <form onSubmit={submitTag}>
                <input
                  required
                  value={tagName}
                  onChange={(event) => setTagName(event.target.value)}
                  placeholder="New tag name"
                />
                <select
                  value={tagColor}
                  onChange={(event) =>
                    setTagColor(event.target.value as JournalTag["color"])
                  }
                >
                  <option value="rose">Rose</option>
                  <option value="sand">Sand</option>
                  <option value="green">Matcha</option>
                </select>
                <button>
                  <Plus size={16} /> Add tag
                </button>
              </form>
              <div className="journal-tag-grid">
                {tagCounts.map((tag) => (
                  <article key={tag.id}>
                    <span className={tag.color}>
                      <Bookmark />
                      {renamingTag === tag.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(event) =>
                            setRenameValue(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              renameTag(tag.id, renameValue);
                              setRenamingTag(null);
                            }
                          }}
                        />
                      ) : (
                        <strong>{tag.label}</strong>
                      )}
                    </span>
                    <b>
                      {tag.count} {tag.count === 1 ? "entry" : "entries"}
                    </b>
                    <div>
                      {renamingTag === tag.id ? (
                        <button
                          onClick={() => {
                            renameTag(tag.id, renameValue);
                            setRenamingTag(null);
                          }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setRenamingTag(tag.id);
                            setRenameValue(tag.label);
                          }}
                        >
                          <PenLine size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete tag “${tag.label}”? It will be removed from every entry.`,
                            )
                          )
                            removeTag(tag.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <aside className="journal-panel journal-tag-usage">
              <h2>Most used</h2>
              {tagCounts.slice(0, 6).map((tag) => (
                <div key={tag.id}>
                  <span>{tag.label}</span>
                  <div>
                    <i
                      style={{
                        width: `${entries.length ? (tag.count / entries.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <strong>{tag.count}</strong>
                </div>
              ))}
            </aside>
          </div>
        )}
      </section>

      {entryModal && (
        <div
          className="planner-modal-backdrop journal-modal-backdrop"
          onMouseDown={() => setEntryModal(false)}
        >
          <form
            className="planner-modal journal-entry-modal"
            onSubmit={saveEntry}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <h2>{editingId ? "Edit journal entry" : "New journal entry"}</h2>
              <button type="button" onClick={() => setEntryModal(false)}>
                ×
              </button>
            </div>
            <label>
              Title
              <input
                required
                autoFocus
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
                placeholder="Give this moment a name"
              />
            </label>
            <div className="modal-field-grid">
              <label>
                Date
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(event) => setFormDate(event.target.value)}
                />
              </label>
              <label>
                Entry type
                <select
                  value={formType}
                  onChange={(event) =>
                    setFormType(event.target.value as JournalEntryType)
                  }
                >
                  {journalTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Your thoughts
              <textarea
                className="journal-modal-copy"
                required
                value={formContent}
                onChange={(event) => setFormContent(event.target.value)}
                placeholder="Write freely..."
              />
            </label>
            <fieldset>
              <legend>Mood · {moodLabels[formMood]}</legend>
              <div className="journal-modal-moods">
                {[0, 1, 2, 3, 4].map((mood) => (
                  <button
                    type="button"
                    className={formMood === mood ? "selected" : ""}
                    onClick={() => setFormMood(mood)}
                    key={mood}
                  >
                    <MoodFace mood={mood} />
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Tags</legend>
              <div className="journal-modal-tags">
                {tags.map((tag) => (
                  <button
                    type="button"
                    className={formTags.includes(tag.label) ? "selected" : ""}
                    onClick={() => toggleFormTag(tag.label)}
                    key={tag.id}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="journal-photo-upload">
              <ImagePlus size={18} /> Add photos
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={addPhotos}
              />
            </label>
            {formPhotos.length > 0 && (
              <div className="journal-modal-photos">
                {formPhotos.map((photo, index) => (
                  <span key={index}>
                    <img src={photo} alt="" />
                    <button
                      type="button"
                      onClick={() =>
                        setFormPhotos((current) =>
                          current.filter(
                            (_, photoIndex) => photoIndex !== index,
                          ),
                        )
                      }
                    >
                      <X />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <button className="modal-submit">
              <BookOpen size={17} /> {editingId ? "Save changes" : "Save entry"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
