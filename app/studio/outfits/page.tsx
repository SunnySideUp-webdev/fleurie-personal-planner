"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import Link from "next/link";
import {
  AlignCenter, AlignLeft, AlignRight, Bell, Bold, BookOpen, CalendarDays, Check,
  ChevronDown, Circle, CircleDollarSign, Ellipsis, Expand, Flower2, Footprints,
  Handbag, Heart, Home, Italic, Leaf, ListChecks, Menu, Palette,
  Pencil, Plus, Redo2, RotateCw, Search, Settings, Shirt, ShoppingBag, Sparkles,
  Star, Tag, Trash2, Type, Underline, Undo2, X,
} from "lucide-react";
import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { OutfitMiniature } from "../_components/outfit-miniature";
import { ClosetCategory, ClosetItem, ClosetItemKind, OutfitCanvasElement, OutfitPlacement, StudioOutfit, useStudioData } from "../_data/use-studio-data";

type StudioSection = "My outfits" | "Closet" | "Lookbook" | "Inspo";
type CategoryFilter = "All" | ClosetCategory | "Stickers";

const navigation = [
  { label: "Today", icon: Home, href: "/" }, { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" }, { label: "Studio", icon: Shirt, href: "/studio/outfits", active: true },
  { label: "Money", icon: CircleDollarSign, href: "/money" }, { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists" },
];
const sections: StudioSection[] = ["My outfits", "Closet", "Lookbook", "Inspo"];
const closetCategories: ClosetCategory[] = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories"];
const categories: CategoryFilter[] = ["All", ...closetCategories, "Stickers"];
const stickerOptions: Array<{ variant: NonNullable<OutfitCanvasElement["variant"]>; label: string; color: string }> = [
  { variant: "sparkles", label: "Sparkles", color: "#70702e" },
  { variant: "heart", label: "Heart", color: "#b46c72" },
  { variant: "star", label: "Star", color: "#9ca469" },
  { variant: "flower", label: "Flower", color: "#c88f94" },
];

function kindForCategory(category: ClosetCategory): ClosetItemKind {
  return ({ Tops: "top", Bottoms: "bottom", Dresses: "dress", Outerwear: "outerwear", Shoes: "shoes", Bags: "bag", Accessories: "accessory" } as const)[category];
}

function ClosetIcon({ kind, size = 42 }: { kind: ClosetItemKind; size?: number }) {
  if (kind === "shoes") return <Footprints size={size} strokeWidth={1.4} />;
  if (kind === "bag") return <Handbag size={size} strokeWidth={1.4} />;
  if (kind === "accessory") return <Sparkles size={size} strokeWidth={1.35} />;
  if (kind === "bottom") return <ShoppingBag size={size} strokeWidth={1.3} />;
  return <Shirt size={size} strokeWidth={1.35} />;
}

function ClosetVisual({ item, size = 42 }: { item: ClosetItem; size?: number }) {
  return item.imageDataUrl ? <img className="closet-photo" src={item.imageDataUrl} alt={item.label} draggable={false} /> : <span style={{ color: item.color }}><ClosetIcon kind={item.kind} size={size} /></span>;
}

function StickerVisual({ variant, size = 42 }: { variant: NonNullable<OutfitCanvasElement["variant"]>; size?: number }) {
  if (variant === "heart") return <Heart size={size} strokeWidth={1.7} />;
  if (variant === "star") return <Star size={size} strokeWidth={1.7} />;
  if (variant === "flower") return <Flower2 size={size} strokeWidth={1.7} />;
  return <Sparkles size={size} strokeWidth={1.7} />;
}

async function compressImage(file: File) {
  const source = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const element = new Image(); element.onload = () => resolve(element); element.onerror = reject; element.src = source; });
  const maxSide = 800;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio)); canvas.height = Math.max(1, Math.round(image.height * ratio));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", .78);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function StudioOutfitsPage() {
  const { closet, outfits, inspiration, occasionTags, addClosetItem, updateClosetItem, removeClosetItem, saveOutfit, removeOutfit, toggleFavoriteOutfit, assignOutfitToToday, addInspiration, updateInspiration, removeInspiration, addOccasionTag } = useStudioData();
  const [mobileNav, setMobileNav] = useState(false);
  const [activeSection, setActiveSection] = useState<StudioSection>("My outfits");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [placements, setPlacements] = useState<OutfitPlacement[]>([{ itemId: "black-knit", x: 12, y: 10, size: 145, z: 2, rotation: 0 }, { itemId: "olive-jeans", x: 43, y: 32, size: 160, z: 1, rotation: 0 }, { itemId: "boots", x: 18, y: 62, size: 140, z: 3, rotation: 0 }, { itemId: "shoulder-bag", x: 72, y: 55, size: 135, z: 4, rotation: 0 }]);
  const [canvasElements, setCanvasElements] = useState<OutfitCanvasElement[]>([]);
  const [redoPlacements, setRedoPlacements] = useState<OutfitPlacement[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedCanvasElementId, setSelectedCanvasElementId] = useState<string | null>(null);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>("office-casual");
  const [outfitName, setOutfitName] = useState("Office casual");
  const [outfitDate, setOutfitDate] = useState("2026-10-05");
  const [selectedOccasion, setSelectedOccasion] = useState("Office");
  const [notes, setNotes] = useState("Comfortable but polished ♡");
  const [canvasBackground, setCanvasBackground] = useState("#f3e3dc");
  const [shapeColor, setShapeColor] = useState("#d7d799");
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState(false);
  const [closetModal, setClosetModal] = useState(false);
  const [editingClosetId, setEditingClosetId] = useState<string | null>(null);
  const [closetName, setClosetName] = useState("");
  const [closetCategory, setClosetCategory] = useState<ClosetCategory>("Tops");
  const [closetColor, setClosetColor] = useState("#70702e");
  const [closetImage, setClosetImage] = useState<string | undefined>();
  const [inspoModal, setInspoModal] = useState(false);
  const [editingInspoId, setEditingInspoId] = useState<string | null>(null);
  const [inspoTitle, setInspoTitle] = useState("");
  const [inspoNote, setInspoNote] = useState("");
  const [inspoColor, setInspoColor] = useState("#ebb4b2");
  const [occasionMenuOpen, setOccasionMenuOpen] = useState(false);
  const [occasionModal, setOccasionModal] = useState(false);
  const [newOccasion, setNewOccasion] = useState("");
  const dragRef = useRef<{ target: "item" | "element"; id: string; startX: number; startY: number; x: number; y: number; size: number; rotation: number } | null>(null);

  const canvasItems = placements.map((placement) => closet.find((item) => item.id === placement.itemId)).filter((item): item is ClosetItem => Boolean(item));
  const selectedPlacement = placements.find((placement) => placement.itemId === selectedItem);
  const selectedCanvasElement = canvasElements.find((element) => element.id === selectedCanvasElementId);
  const selectedTextElement = selectedCanvasElement?.type === "text" ? selectedCanvasElement : null;
  const hasSelection = Boolean(selectedPlacement || selectedCanvasElement);
  const visibleCloset = useMemo(() => closet.filter((item) => (activeCategory === "All" || activeCategory === "Stickers" || item.category === activeCategory) && item.label.toLowerCase().includes(query.toLowerCase())), [closet, activeCategory, query]);
  const visibleOutfits = useMemo(() => outfits.filter((outfit) => outfit.name.toLowerCase().includes(query.toLowerCase()) || outfit.occasion.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.createdAt.localeCompare(a.createdAt)), [outfits, query]);
  const visibleInspiration = inspiration.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.note.toLowerCase().includes(query.toLowerCase()));
  const displayedOccasions = useMemo(() => Array.from(new Set([...occasionTags, selectedOccasion])), [occasionTags, selectedOccasion]);

  useEffect(() => {
    if (!occasionMenuOpen) return;
    const close = () => setOccasionMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [occasionMenuOpen]);

  useEffect(() => {
    if (activeSection === "Closet" && activeCategory === "Stickers") setActiveCategory("All");
  }, [activeSection, activeCategory]);

  useEffect(() => {
    const clearSelectionFromEmptyCanvas = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#outfit-canvas")) return;
      if (target.closest(".canvas-item, .canvas-decoration, .text-format-toolbar")) return;
      setSelectedItem(null);
      setSelectedCanvasElementId(null);
    };
    document.addEventListener("pointerdown", clearSelectionFromEmptyCanvas);
    return () => document.removeEventListener("pointerdown", clearSelectionFromEmptyCanvas);
  }, []);

  function highestLayer() { return Math.max(0, ...placements.map((placement) => placement.z), ...canvasElements.map((element) => element.z)); }
  function constrainToCanvas(x: number, y: number, size: number, rotation = 0) {
    const canvas = document.getElementById("outfit-canvas");
    if (!canvas) return { x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(80, y)) };
    const radians = Math.abs(rotation % 90) * Math.PI / 180;
    const visualSize = size * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)));
    const extra = Math.max(0, (visualSize - size) / 2);
    const minX = extra / canvas.clientWidth * 100;
    const minY = extra / canvas.clientHeight * 100;
    const maxX = 100 - (size + extra) / canvas.clientWidth * 100;
    const maxY = 100 - (size + extra) / canvas.clientHeight * 100;
    return { x: Math.max(minX, Math.min(Math.max(minX, maxX), x)), y: Math.max(minY, Math.min(Math.max(minY, maxY), y)) };
  }
  function selectClosetItem(id: string) { setSelectedItem(id); setSelectedCanvasElementId(null); }
  function selectElement(id: string) { setSelectedCanvasElementId(id); setSelectedItem(null); }
  function addToCanvas(item: ClosetItem) { setPlacements((current) => current.some((placement) => placement.itemId === item.id) ? current : [...current, { itemId: item.id, x: 14 + current.length * 8, y: 12 + (current.length % 3) * 18, size: 145, z: highestLayer() + 1, rotation: 0 }]); setRedoPlacements([]); selectClosetItem(item.id); }
  function addSticker(variant: NonNullable<OutfitCanvasElement["variant"]>, color: string) { const id = crypto.randomUUID(); setCanvasElements((current) => [...current, { id, type: "sticker", variant, color, x: 42, y: 35, size: 92, z: highestLayer() + 1, rotation: 0 }]); selectElement(id); }
  function addCircle() { const id = crypto.randomUUID(); setCanvasElements((current) => [...current, { id, type: "shape", shape: "circle", color: shapeColor, x: 42, y: 35, size: 130, z: highestLayer() + 1, rotation: 0 }]); selectElement(id); }
  function addText() { const id = crypto.randomUUID(); setCanvasElements((current) => [...current, { id, type: "text", text: "Your text", color: "#282724", x: 36, y: 40, size: 230, z: highestLayer() + 1, rotation: 0, bold: false, italic: false, underline: false, align: "center", font: "serif", fontSize: 28 }]); selectElement(id); }
  function newOutfit() { setCurrentOutfitId(null); setPlacements([]); setCanvasElements([]); setRedoPlacements([]); setSelectedItem(null); setSelectedCanvasElementId(null); setCanvasBackground("#f3e3dc"); setOutfitName("Untitled outfit"); setOutfitDate(localDateKey()); setSelectedOccasion("Everyday"); setNotes(""); setActiveSection("My outfits"); }
  function loadOutfit(outfit: StudioOutfit) { setCurrentOutfitId(outfit.id); setPlacements(outfit.placements.map((placement) => ({ ...placement, rotation: placement.rotation ?? 0 }))); setCanvasElements(outfit.canvasElements ?? []); setCanvasBackground(outfit.backgroundColor ?? "#f3e3dc"); setRedoPlacements([]); setSelectedItem(null); setSelectedCanvasElementId(null); setOutfitName(outfit.name); setOutfitDate(outfit.date); setSelectedOccasion(outfit.occasion); setNotes(outfit.notes); setActiveSection("My outfits"); }
  function persistOutfit() { const id = saveOutfit({ id: currentOutfitId ?? undefined, name: outfitName.trim() || "Untitled outfit", occasion: selectedOccasion, notes, date: outfitDate, itemIds: placements.map((placement) => placement.itemId), placements, canvasElements, backgroundColor: canvasBackground, favorite: outfits.find((item) => item.id === currentOutfitId)?.favorite ?? false }); setCurrentOutfitId(id); setSaved(true); window.setTimeout(() => setSaved(false), 1600); return id; }
  function useDraftToday() { const outfitId = persistOutfit(); setLocalStorageItem("noa-today-outfit-v1", JSON.stringify({ outfitId, assignedDate: localDateKey(), savedAt: new Date().toISOString() })); }
  function removeSelected() { if (selectedItem) { setPlacements((current) => { const removed = current.find((placement) => placement.itemId === selectedItem); if (removed) setRedoPlacements((stack) => [removed, ...stack]); return current.filter((placement) => placement.itemId !== selectedItem); }); setSelectedItem(null); } else if (selectedCanvasElementId) { setCanvasElements((current) => current.filter((element) => element.id !== selectedCanvasElementId)); setSelectedCanvasElementId(null); } }
  function undoCanvas() { setPlacements((current) => { const removed = current.at(-1); if (!removed) return current; setRedoPlacements((stack) => [removed, ...stack]); return current.slice(0, -1); }); }
  function redoCanvas() { setRedoPlacements((current) => { const [next, ...rest] = current; if (next) setPlacements((items) => [...items, next]); return rest; }); }
  function updatePlacement(itemId: string, update: Partial<OutfitPlacement>) { setPlacements((current) => current.map((placement) => placement.itemId === itemId ? { ...placement, ...update } : placement)); }
  function updateCanvasElement(id: string, update: Partial<OutfitCanvasElement>) { setCanvasElements((current) => current.map((element) => element.id === id ? { ...element, ...update } : element)); }
  function resizeSelected(delta: number) { if (selectedItem) setPlacements((current) => current.map((placement) => { if (placement.itemId !== selectedItem) return placement; const size = Math.max(60, Math.min(320, placement.size + delta)); return { ...placement, size, ...constrainToCanvas(placement.x, placement.y, size, placement.rotation) }; })); else if (selectedCanvasElementId) setCanvasElements((current) => current.map((element) => { if (element.id !== selectedCanvasElementId) return element; const size = Math.max(45, Math.min(360, element.size + delta)); return { ...element, size, ...constrainToCanvas(element.x, element.y, size, element.rotation) }; })); }
  function layerSelected(delta: number) { if (selectedItem) setPlacements((current) => current.map((placement) => placement.itemId === selectedItem ? { ...placement, z: Math.max(0, placement.z + delta) } : placement)); else if (selectedCanvasElementId) setCanvasElements((current) => current.map((element) => element.id === selectedCanvasElementId ? { ...element, z: Math.max(0, element.z + delta) } : element)); }
  function rotateSelected() { if (selectedItem) setPlacements((current) => current.map((placement) => { if (placement.itemId !== selectedItem) return placement; const rotation = ((placement.rotation ?? 0) + 15) % 360; return { ...placement, rotation, ...constrainToCanvas(placement.x, placement.y, placement.size, rotation) }; })); else if (selectedCanvasElementId) setCanvasElements((current) => current.map((element) => { if (element.id !== selectedCanvasElementId) return element; const rotation = (element.rotation + 15) % 360; return { ...element, rotation, ...constrainToCanvas(element.x, element.y, element.size, rotation) }; })); }
  function toggleWhiteBorder() { if (!selectedItem) return; setPlacements((current) => current.map((placement) => placement.itemId === selectedItem ? { ...placement, whiteBorder: !placement.whiteBorder } : placement)); }
  function startDragging(event: ReactPointerEvent<HTMLButtonElement>, target: "item" | "element", id: string, x: number, y: number, size: number, rotation: number) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { target, id, startX: event.clientX, startY: event.clientY, x, y, size, rotation }; if (target === "item") selectClosetItem(id); else selectElement(id); }
  function moveDragging(event: ReactPointerEvent<HTMLButtonElement>) { const drag = dragRef.current; const canvas = document.getElementById("outfit-canvas"); if (!drag || !canvas) return; const rect = canvas.getBoundingClientRect(); const position = constrainToCanvas(drag.x + (event.clientX - drag.startX) / rect.width * 100, drag.y + (event.clientY - drag.startY) / rect.height * 100, drag.size, drag.rotation); if (drag.target === "item") updatePlacement(drag.id, position); else updateCanvasElement(drag.id, position); }
  function stopDragging(event: ReactPointerEvent<HTMLButtonElement>) { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); dragRef.current = null; }
  async function uploadImage(file?: File) { if (!file) return; try { setClosetImage(await compressImage(file)); } catch { window.alert("The image could not be processed. Try another PNG, JPG or WEBP file."); } }
  function openNewCloset() { setEditingClosetId(null); setClosetName(""); setClosetCategory("Tops"); setClosetColor("#70702e"); setClosetImage(undefined); setClosetModal(true); }
  function openEditCloset(item: ClosetItem) { setEditingClosetId(item.id); setClosetName(item.label); setClosetCategory(item.category); setClosetColor(item.color); setClosetImage(item.imageDataUrl); setClosetModal(true); }
  function submitCloset(event: FormEvent) { event.preventDefault(); if (!closetName.trim()) return; const value = { label: closetName.trim(), category: closetCategory, kind: kindForCategory(closetCategory), color: closetColor, imageDataUrl: closetImage }; if (editingClosetId) updateClosetItem(editingClosetId, value); else addClosetItem(value); setClosetModal(false); }
  function openNewInspo() { setEditingInspoId(null); setInspoTitle(""); setInspoNote(""); setInspoColor("#ebb4b2"); setInspoModal(true); }
  function openEditInspo(id: string) { const item = inspiration.find((entry) => entry.id === id); if (!item) return; setEditingInspoId(id); setInspoTitle(item.title); setInspoNote(item.note); setInspoColor(item.color); setInspoModal(true); }
  function submitInspo(event: FormEvent) { event.preventDefault(); if (!inspoTitle.trim()) return; const value = { title: inspoTitle.trim(), note: inspoNote.trim(), color: inspoColor, saved: editingInspoId ? inspiration.find((item) => item.id === editingInspoId)?.saved ?? false : false }; if (editingInspoId) updateInspiration(editingInspoId, value); else addInspiration(value); setInspoModal(false); }
  function openOccasionModal() { setNewOccasion(""); setOccasionMenuOpen(false); setOccasionModal(true); }
  function submitOccasion(event: FormEvent) { event.preventDefault(); const label = newOccasion.trim(); if (!label) return; addOccasionTag(label); setSelectedOccasion(label); setOccasionModal(false); }
  function primaryAction() { if (activeSection === "Closet") openNewCloset(); else if (activeSection === "Inspo") openNewInspo(); else newOutfit(); }

  return <main className="app-shell studio-shell">
    <aside className={`sidebar studio-sidebar ${mobileNav ? "is-open" : ""}`}><div className="brand-row"><img className="brand-logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/daylily-logo.png`} alt="Daylily" /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></button></div><nav aria-label="Main navigation">{navigation.map(({ label, icon: Icon, href, active }) => <div key={label}><Link href={href} className={`nav-item ${active ? "active" : ""}`}><Icon size={24} strokeWidth={1.7} /><span>{label}</span></Link>{label === "Studio" && <div className="studio-subnav"><button className={activeSection === "My outfits" || activeSection === "Lookbook" ? "active" : ""} onClick={() => setActiveSection("My outfits")}>Outfits</button><button className={activeSection === "Closet" ? "active" : ""} onClick={() => setActiveSection("Closet")}>Closet</button><button className={activeSection === "Inspo" ? "active" : ""} onClick={() => setActiveSection("Inspo")}>Boards</button></div>}</div>)}</nav><div className="sidebar-art-slot studio-sidebar-art" aria-hidden="true">Floral collage</div><Link className="profile-button" href="/"><span className="avatar">S</span><span>Sunny</span><Settings size={20} /></Link></aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <section className="studio-workspace">
      <header className="studio-header"><button className="mobile-menu studio-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button><div><h1>Studio <span>୨ৎ</span></h1><p>/ &nbsp;{activeSection}</p></div><p className="studio-script">dress for the day<br />you want ♡</p><span className="studio-header-branch" aria-hidden="true" /><div className="studio-actions"><button className="add-button" onClick={primaryAction}><Plus size={20} /> {activeSection === "Closet" ? "New item" : activeSection === "Inspo" ? "New idea" : "New outfit"}</button><button className="icon-button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Search size={20} /></button><Link className="icon-button" href="/planner/reminders" aria-label="Notifications"><Bell size={20} /></Link><button className="icon-button" onClick={() => setActiveSection("Closet")} aria-label="Manage closet"><Settings size={20} /></button></div></header>
      <div className="studio-tabs" role="tablist">{sections.map((tab) => <button key={tab} className={activeSection === tab ? "active" : ""} onClick={() => setActiveSection(tab)}>{tab}</button>)}</div>
      {searchOpen && <label className="studio-search"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${activeSection.toLowerCase()}...`} /><button onClick={() => { setQuery(""); setSearchOpen(false); }}><X size={15} /></button></label>}

      {activeSection === "My outfits" && <><div className="studio-editor-grid">
        <section className="studio-panel closet-panel"><div className="studio-panel-title"><span><Shirt size={21} /> My closet</span><button onClick={() => setActiveSection("Closet")}><Pencil size={15} /></button></div><div className="closet-filters">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className={`closet-grid ${activeCategory === "Stickers" ? "sticker-library" : ""}`}>{activeCategory === "Stickers" ? stickerOptions.map((sticker) => <button key={sticker.variant} className="closet-item sticker-library-item" onClick={() => addSticker(sticker.variant, sticker.color)}><span style={{ color: sticker.color }}><StickerVisual variant={sticker.variant} /></span><small>{sticker.label}</small></button>) : visibleCloset.map((item) => <button key={item.id} className="closet-item" title={`${item.label} — click or drag to add`} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => addToCanvas(item)}><ClosetVisual item={item} /><small>{item.label}</small></button>)}</div></section>
        <section className="studio-panel canvas-panel"><div className="canvas-toolbar"><label><input value={outfitName} onChange={(event) => setOutfitName(event.target.value)} aria-label="Outfit name" /><Pencil size={16} /></label><div><button onClick={undoCanvas} disabled={!placements.length} aria-label="Undo"><Undo2 size={18} /></button><button onClick={redoCanvas} disabled={!redoPlacements.length} aria-label="Redo"><Redo2 size={18} /></button><button className="zoom-button" onClick={() => setZoom((value) => value === 120 ? 80 : value + 20)}>{zoom}% <ChevronDown size={14} /></button><button onClick={() => document.getElementById("outfit-canvas")?.requestFullscreen()} aria-label="Fullscreen"><Expand size={18} /></button></div></div><div id="outfit-canvas" className="outfit-canvas" style={{ backgroundColor: canvasBackground }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const item = closet.find((candidate) => candidate.id === event.dataTransfer.getData("text/plain")); if (item) addToCanvas(item); }}><div className="canvas-items" style={{ transform: `scale(${zoom / 100})` }}>{placements.map((placement) => { const item = closet.find((candidate) => candidate.id === placement.itemId); return item ? <button key={item.id} className={`canvas-item freeform ${placement.whiteBorder ? "white-border" : ""} ${selectedItem === item.id ? "selected" : ""}`} style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: placement.size, height: placement.size, zIndex: placement.z, transform: `rotate(${placement.rotation ?? 0}deg)` }} onPointerDown={(event) => startDragging(event, "item", placement.itemId, placement.x, placement.y, placement.size, placement.rotation ?? 0)} onPointerMove={moveDragging} onPointerUp={stopDragging} onPointerCancel={stopDragging} aria-label={`Move ${item.label}`}><ClosetVisual item={item} size={Math.round(placement.size * .62)} /><small>{item.label}</small></button> : null; })}{canvasElements.map((element) => <button key={element.id} className={`canvas-decoration canvas-${element.type} ${selectedCanvasElementId === element.id ? "selected" : ""}`} style={{ left: `${element.x}%`, top: `${element.y}%`, width: element.size, height: element.type === "text" ? "auto" : element.size, zIndex: element.z, color: element.color, transform: `rotate(${element.rotation}deg)` }} onPointerDown={(event) => startDragging(event, "element", element.id, element.x, element.y, element.size, element.rotation)} onPointerMove={moveDragging} onPointerUp={stopDragging} onPointerCancel={stopDragging} aria-label={`Move ${element.type}`}>{element.type === "sticker" && element.variant && <StickerVisual variant={element.variant} size={Math.round(element.size * .72)} />}{element.type === "shape" && <span className="canvas-color-circle" style={{ backgroundColor: element.color }} />}{element.type === "text" && <span className={`canvas-text-copy font-${element.font ?? "serif"}`} style={{ color: element.color, fontSize: element.fontSize ?? 28, fontWeight: element.bold ? 700 : 400, fontStyle: element.italic ? "italic" : "normal", textDecoration: element.underline ? "underline" : "none", textAlign: element.align ?? "center" }}>{element.text}</span>}</button>)}</div>{selectedTextElement && <div className="text-format-toolbar"><input className="text-content-input" value={selectedTextElement.text ?? ""} onChange={(event) => updateCanvasElement(selectedTextElement.id, { text: event.target.value })} aria-label="Text content" /><button className={selectedTextElement.underline ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { underline: !selectedTextElement.underline })} aria-label="Underline"><Underline size={15} /></button><button className={selectedTextElement.bold ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { bold: !selectedTextElement.bold })} aria-label="Bold"><Bold size={15} /></button><button className={selectedTextElement.italic ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { italic: !selectedTextElement.italic })} aria-label="Italic"><Italic size={15} /></button><button className={selectedTextElement.align === "left" ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { align: "left" })} aria-label="Align left"><AlignLeft size={15} /></button><button className={(selectedTextElement.align ?? "center") === "center" ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { align: "center" })} aria-label="Align center"><AlignCenter size={15} /></button><button className={selectedTextElement.align === "right" ? "active" : ""} onClick={() => updateCanvasElement(selectedTextElement.id, { align: "right" })} aria-label="Align right"><AlignRight size={15} /></button><select value={selectedTextElement.font ?? "serif"} onChange={(event) => updateCanvasElement(selectedTextElement.id, { font: event.target.value as OutfitCanvasElement["font"] })} aria-label="Font"><option value="serif">Serif</option><option value="script">Script</option><option value="sans">Sans</option></select><label className="text-color-control" title="Text color"><input type="color" value={selectedTextElement.color} onChange={(event) => updateCanvasElement(selectedTextElement.id, { color: event.target.value })} /></label></div>}{!canvasItems.length && !canvasElements.length && <div className="empty-canvas"><Shirt size={38} /><strong>Add something from My closet</strong><span>Use clothes, stickers, shapes or text.</span></div>}</div><div className="canvas-bottom-bar"><button onClick={addText}><Type size={17} /> Text</button><div className="canvas-color-tool"><button onClick={addCircle}><Circle size={17} /> Circle</button><input type="color" value={shapeColor} onChange={(event) => setShapeColor(event.target.value)} aria-label="Circle color" /></div><label className="canvas-background-control"><Palette size={17} /> Background<input type="color" value={canvasBackground} onChange={(event) => setCanvasBackground(event.target.value)} aria-label="Canvas background" /></label><div className="canvas-layer-controls"><button disabled={!hasSelection} onClick={rotateSelected} aria-label="Rotate selected"><RotateCw size={15} /></button><button disabled={!hasSelection} onClick={() => resizeSelected(-20)} aria-label="Make smaller">−</button><button disabled={!hasSelection} onClick={() => resizeSelected(20)} aria-label="Make larger">+</button><button disabled={!hasSelection} onClick={() => layerSelected(-1)} aria-label="Send backward">Back</button><button disabled={!hasSelection} onClick={() => layerSelected(1)} aria-label="Bring forward">Front</button><button className={selectedPlacement?.whiteBorder ? "active" : ""} disabled={!selectedItem} onClick={toggleWhiteBorder} aria-pressed={Boolean(selectedPlacement?.whiteBorder)}>White border</button></div><button disabled={!hasSelection} onClick={removeSelected}><Trash2 size={17} /> Remove</button></div></section>
        <section className="studio-panel details-panel"><div className="save-row"><button onClick={persistOutfit}>{saved ? <><Check size={18} /> Saved</> : <>Save outfit <ChevronDown size={16} /></>}</button><button onClick={useDraftToday} aria-label="Use outfit today" title="Use today"><CalendarDays size={18} /></button></div><div className="details-section"><h2><Tag size={18} /> Details</h2><input value={outfitName} onChange={(event) => setOutfitName(event.target.value)} /><label className="date-field"><CalendarDays size={17} /><input type="date" value={outfitDate} onChange={(event) => setOutfitDate(event.target.value)} /></label><div className="tag-row"><span>{selectedOccasion.toLowerCase()} ×</span><span>{canvasItems.length} pieces</span></div></div><div className="details-section"><h2><Palette size={18} /> Color palette</h2><div className="color-palette">{Array.from(new Set(canvasItems.map((item) => item.color))).slice(0, 4).map((color) => <span className="palette-swatch" key={color} style={{ background: color }} title={color} />)}{!canvasItems.length && <span className="empty-palette">Add pieces to build a palette.</span>}</div></div><div className="details-section occasion-section"><div className="details-section-heading"><h2><Shirt size={18} /> Occasion</h2><div className="compact-menu" onClick={(event) => event.stopPropagation()}><button className="occasion-menu-trigger" onClick={() => setOccasionMenuOpen((value) => !value)} aria-label="Occasion options"><Ellipsis size={19} /></button>{occasionMenuOpen && <div className="compact-menu-popover align-right"><button onClick={openOccasionModal}><Plus size={14} /> Add new tag</button></div>}</div></div><div className="occasion-grid">{displayedOccasions.map((occasion) => <button key={occasion} className={selectedOccasion === occasion ? "active" : ""} onClick={() => { setSelectedOccasion(occasion); setOccasionMenuOpen(false); }}>{occasion}</button>)}</div></div><div className="details-section notes-section"><h2><Pencil size={18} /> Notes</h2><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></div></section>
      </div><section className="saved-outfits-panel"><div className="saved-heading"><span><Shirt size={18} /> Saved outfits</span><button onClick={() => setActiveSection("Lookbook")}>View all <ChevronDown size={14} /></button></div><div className="saved-outfits-row">{visibleOutfits.slice(0, 8).map((outfit) => <button key={outfit.id} className={currentOutfitId === outfit.id ? "active" : ""} onClick={() => loadOutfit(outfit)}><span className="saved-outfit-art">{outfit.itemIds.slice(0,3).map((id) => { const item = closet.find((piece) => piece.id === id); return item ? <ClosetVisual key={id} item={item} size={25} /> : null; })}</span><small>{outfit.date}</small><strong>{outfit.name}</strong></button>)}</div></section></>}

      {activeSection === "Closet" && <section className="studio-library-view"><div className="studio-library-toolbar"><div><h2>My closet</h2><p>{closet.length} pieces ready to style</p></div><div className="closet-filters">{(["All", ...closetCategories] as CategoryFilter[]).map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div><div className="closet-library-grid">{visibleCloset.map((item) => <article key={item.id}><button className="closet-library-preview" onClick={() => { addToCanvas(item); setActiveSection("My outfits"); }}><span><ClosetVisual item={item} size={58} /></span><strong>{item.label}</strong><small>{item.category}</small></button><div><button onClick={() => openEditCloset(item)} aria-label={`Edit ${item.label}`}><Pencil size={15} /></button><button onClick={() => { if (window.confirm(`Delete ${item.label}?`)) removeClosetItem(item.id); }} aria-label={`Delete ${item.label}`}><Trash2 size={15} /></button></div></article>)}</div></section>}

      {activeSection === "Lookbook" && <section className="studio-library-view"><div className="studio-library-toolbar"><div><h2>Lookbook</h2><p>Your saved outfits, ready to wear again</p></div><button className="studio-solid-button" onClick={newOutfit}><Plus size={16} /> Create outfit</button></div><div className="lookbook-grid">{visibleOutfits.map((outfit) => { const miniatureItems = outfit.itemIds.map((id) => closet.find((piece) => piece.id === id)).filter((item): item is ClosetItem => Boolean(item)); return <article key={outfit.id}><div className="lookbook-art"><OutfitMiniature items={miniatureItems} placements={outfit.placements} canvasElements={outfit.canvasElements} /></div><div className="lookbook-copy"><span>{outfit.date} · {outfit.occasion}</span><h3>{outfit.name}</h3><p>{outfit.notes || "No notes yet."}</p></div><div className="lookbook-actions"><button className={outfit.favorite ? "favorite" : ""} onClick={() => toggleFavoriteOutfit(outfit.id)} aria-label="Favorite"><Heart size={16} fill={outfit.favorite ? "currentColor" : "none"} /></button><button onClick={() => loadOutfit(outfit)} aria-label="Edit"><Pencil size={16} /></button><button onClick={() => assignOutfitToToday(outfit.id)} aria-label="Use today"><CalendarDays size={16} /></button><button onClick={() => { if (window.confirm(`Delete ${outfit.name}?`)) removeOutfit(outfit.id); }} aria-label="Delete"><Trash2 size={16} /></button></div></article>; })}</div></section>}

      {activeSection === "Inspo" && <section className="studio-library-view"><div className="studio-library-toolbar"><div><h2>Inspiration board</h2><p>Save combinations, colors and ideas for later</p></div><button className="studio-solid-button" onClick={openNewInspo}><Plus size={16} /> Add idea</button></div><div className="inspo-grid">{visibleInspiration.map((item, index) => <article key={item.id} style={{ background: item.color }}><div className="inspo-art"><Sparkles size={24} /><span>{index % 2 ? <Heart /> : <Shirt />}</span></div><div><small>STYLE NOTE</small><h3>{item.title}</h3><p>{item.note}</p></div><footer><button className={item.saved ? "saved" : ""} onClick={() => updateInspiration(item.id, { saved: !item.saved })}><Heart size={15} fill={item.saved ? "currentColor" : "none"} /> {item.saved ? "Saved" : "Save"}</button><button onClick={() => openEditInspo(item.id)}><Pencil size={15} /></button><button onClick={() => removeInspiration(item.id)}><Trash2 size={15} /></button></footer></article>)}</div></section>}
    </section>

    {closetModal && <div className="planner-modal-backdrop" onMouseDown={() => setClosetModal(false)}><form className="planner-modal" onSubmit={submitCloset} onMouseDown={(event) => event.stopPropagation()}><div><h2>{editingClosetId ? "Edit closet item" : "New closet item"}</h2><button type="button" onClick={() => setClosetModal(false)}>×</button></div><label>Name<input required autoFocus value={closetName} onChange={(event) => setClosetName(event.target.value)} placeholder="e.g. Olive cardigan" /></label><label className="closet-image-field">Item image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])} />{closetImage && <span><img src={closetImage} alt="Closet preview" /><button type="button" onClick={() => setClosetImage(undefined)}>Remove image</button></span>}</label><div className="modal-field-grid"><label>Category<select value={closetCategory} onChange={(event) => setClosetCategory(event.target.value as ClosetCategory)}>{closetCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Fallback color<input type="color" value={closetColor} onChange={(event) => setClosetColor(event.target.value)} /></label></div><button className="modal-submit">{editingClosetId ? <Pencil size={17} /> : <Plus size={17} />}{editingClosetId ? "Save item" : "Add to closet"}</button></form></div>}
    {inspoModal && <div className="planner-modal-backdrop" onMouseDown={() => setInspoModal(false)}><form className="planner-modal" onSubmit={submitInspo} onMouseDown={(event) => event.stopPropagation()}><div><h2>{editingInspoId ? "Edit idea" : "New inspiration"}</h2><button type="button" onClick={() => setInspoModal(false)}>×</button></div><label>Title<input required autoFocus value={inspoTitle} onChange={(event) => setInspoTitle(event.target.value)} placeholder="e.g. Rainy campus look" /></label><label>Notes<textarea value={inspoNote} onChange={(event) => setInspoNote(event.target.value)} placeholder="Pieces, colors or details to remember..." /></label><label>Board color<input type="color" value={inspoColor} onChange={(event) => setInspoColor(event.target.value)} /></label><button className="modal-submit">{editingInspoId ? <Pencil size={17} /> : <Plus size={17} />}{editingInspoId ? "Save idea" : "Add inspiration"}</button></form></div>}
    {occasionModal && <div className="planner-modal-backdrop" onMouseDown={() => setOccasionModal(false)}><form className="planner-modal" onSubmit={submitOccasion} onMouseDown={(event) => event.stopPropagation()}><div><h2>New occasion tag</h2><button type="button" onClick={() => setOccasionModal(false)}>×</button></div><label>Tag name<input required autoFocus maxLength={24} value={newOccasion} onChange={(event) => setNewOccasion(event.target.value)} placeholder="e.g. Dinner with friends" /></label><button className="modal-submit"><Plus size={17} /> Add tag</button></form></div>}
  </main>;
}
