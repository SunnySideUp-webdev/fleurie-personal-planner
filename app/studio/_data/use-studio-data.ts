"use client";

import { setLocalStorageItem } from "@/app/_lib/local-storage";

import { createContext, createElement, ReactNode, useContext, useEffect, useState } from "react";

export type ClosetCategory = "Tops" | "Bottoms" | "Dresses" | "Outerwear" | "Shoes" | "Bags" | "Accessories";
export type ClosetItemKind = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "bag" | "accessory";
export type ClosetItem = { id: string; label: string; category: ClosetCategory; kind: ClosetItemKind; color: string; imageDataUrl?: string };
export type OutfitPlacement = { itemId: string; x: number; y: number; size: number; z: number; rotation?: number; whiteBorder?: boolean };
export type OutfitCanvasElement = {
  id: string;
  type: "sticker" | "shape" | "text";
  variant?: "sparkles" | "heart" | "star" | "flower";
  shape?: "circle";
  text?: string;
  color: string;
  x: number;
  y: number;
  size: number;
  z: number;
  rotation: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  font?: "serif" | "script" | "sans";
  fontSize?: number;
};
export type StudioOutfit = { id: string; name: string; occasion: string; notes: string; date: string; itemIds: string[]; placements: OutfitPlacement[]; canvasElements?: OutfitCanvasElement[]; backgroundColor?: string; favorite: boolean; createdAt: string };
export type InspoItem = { id: string; title: string; note: string; color: string; saved: boolean };

const initialCloset: ClosetItem[] = [
  { id: "black-knit", label: "Black knit top", category: "Tops", kind: "top", color: "#282724" },
  { id: "olive-jeans", label: "Olive wide jeans", category: "Bottoms", kind: "bottom", color: "#6e6b54" },
  { id: "example-dress", label: "Black midi dress", category: "Dresses", kind: "dress", color: "#373431" },
  { id: "example-outerwear", label: "Cream jacket", category: "Outerwear", kind: "outerwear", color: "#d9cbbb" },
  { id: "boots", label: "Chunky boots", category: "Shoes", kind: "shoes", color: "#282724" },
  { id: "shoulder-bag", label: "Shoulder bag", category: "Bags", kind: "bag", color: "#27251f" },
  { id: "necklace", label: "Silver necklace", category: "Accessories", kind: "accessory", color: "#b9b3ab" },
];

const legacyStarterClosetIds = ["black-knit", "cream-top", "rose-cardigan", "olive-jeans", "black-skirt", "long-skirt", "boots", "mary-janes", "sneakers", "shoulder-bag", "cream-bag", "mini-bag", "necklace", "bow", "hairclips"];
const initialOccasionTags = ["Everyday", "Office", "University", "Date", "Workout", "Event", "Travel", "Other"];

const initialOutfits: StudioOutfit[] = [
  { id: "office-casual", name: "Office casual", occasion: "Office", notes: "Comfortable but polished ♡", date: "2026-10-05", itemIds: ["black-knit", "olive-jeans", "boots", "shoulder-bag"], placements: [{ itemId: "black-knit", x: 12, y: 10, size: 145, z: 2, rotation: 0 }, { itemId: "olive-jeans", x: 43, y: 32, size: 160, z: 1, rotation: 0 }, { itemId: "boots", x: 18, y: 62, size: 140, z: 3, rotation: 0 }, { itemId: "shoulder-bag", x: 72, y: 55, size: 135, z: 4, rotation: 0 }], canvasElements: [], backgroundColor: "#f3e3dc", favorite: true, createdAt: "2026-10-05T08:00:00.000Z" },
];

const initialInspo: InspoItem[] = [
  { id: "soft-office", title: "Soft office", note: "Olive trousers, black knit and a small bag", color: "#d7d799", saved: true },
  { id: "rose-layers", title: "Rose layers", note: "Cardigan, long skirt and ribbon details", color: "#ebb4b2", saved: true },
  { id: "weekend-cafe", title: "Weekend café", note: "Cream top, denim and comfortable shoes", color: "#c7beb3", saved: false },
];

type StudioContextValue = {
  closet: ClosetItem[];
  outfits: StudioOutfit[];
  inspiration: InspoItem[];
  occasionTags: string[];
  addClosetItem: (item: Omit<ClosetItem, "id">) => string;
  updateClosetItem: (id: string, update: Partial<Omit<ClosetItem, "id">>) => void;
  removeClosetItem: (id: string) => void;
  saveOutfit: (outfit: Omit<StudioOutfit, "id" | "createdAt"> & { id?: string }) => string;
  removeOutfit: (id: string) => void;
  toggleFavoriteOutfit: (id: string) => void;
  assignOutfitToToday: (id: string) => void;
  addInspiration: (item: Omit<InspoItem, "id">) => void;
  updateInspiration: (id: string, update: Partial<Omit<InspoItem, "id">>) => void;
  removeInspiration: (id: string) => void;
  addOccasionTag: (label: string) => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);
const STORAGE_KEY = "noa-studio-data-v1";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StudioDataProvider({ children }: { children: ReactNode }) {
  const [closet, setCloset] = useState(initialCloset);
  const [outfits, setOutfits] = useState(initialOutfits);
  const [inspiration, setInspiration] = useState(initialInspo);
  const [occasionTags, setOccasionTags] = useState(initialOccasionTags);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { closet?: ClosetItem[]; outfits?: StudioOutfit[]; inspiration?: InspoItem[]; occasionTags?: string[]; starterVersion?: number };
        if (parsed.closet) {
          if (parsed.starterVersion === 2) setCloset(parsed.closet);
          else {
            const customizedStarterItems = parsed.closet.filter((item) => legacyStarterClosetIds.includes(item.id) && Boolean(item.imageDataUrl));
            const examples = initialCloset.map((item) => customizedStarterItems.find((candidate) => candidate.id === item.id) ?? item);
            const customizedExtras = customizedStarterItems.filter((item) => !initialCloset.some((example) => example.id === item.id));
            const personalItems = parsed.closet.filter((item) => !legacyStarterClosetIds.includes(item.id) && !initialCloset.some((example) => example.id === item.id));
            setCloset([...examples, ...customizedExtras, ...personalItems]);
          }
        }
        if (parsed.outfits) {
          const migratedOutfits = parsed.starterVersion === 2 ? parsed.outfits : parsed.outfits.filter((outfit) => !["university", "everyday"].includes(outfit.id));
          setOutfits(migratedOutfits.map((outfit) => ({ ...outfit, backgroundColor: outfit.backgroundColor ?? "#f3e3dc", canvasElements: outfit.canvasElements ?? [], placements: (outfit.placements ?? outfit.itemIds.map((itemId, index) => ({ itemId, x: 15 + index * 18, y: 12 + (index % 2) * 35, size: 145, z: index + 1 }))).map((placement) => ({ ...placement, rotation: placement.rotation ?? 0 })) })));
        }
        if (parsed.inspiration) setInspiration(parsed.inspiration);
        if (parsed.occasionTags?.length) setOccasionTags(Array.from(new Set([...initialOccasionTags, ...parsed.occasionTags])));
      }
    } catch {
      // Keep starter Studio content when saved data cannot be read.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { setLocalStorageItem(STORAGE_KEY, JSON.stringify({ closet, outfits, inspiration, occasionTags, starterVersion: 2 })); }
      catch { console.warn("Studio storage is full. Remove a few uploaded images before adding more."); }
    }
  }, [closet, outfits, inspiration, occasionTags, ready]);

  const value: StudioContextValue = {
    closet, outfits, inspiration, occasionTags,
    addClosetItem(item) { const id = crypto.randomUUID(); setCloset((current) => [...current, { ...item, id }]); return id; },
    updateClosetItem(id, update) { setCloset((current) => current.map((item) => item.id === id ? { ...item, ...update } : item)); },
    removeClosetItem(id) { setCloset((current) => current.filter((item) => item.id !== id)); setOutfits((current) => current.map((outfit) => ({ ...outfit, itemIds: outfit.itemIds.filter((itemId) => itemId !== id), placements: outfit.placements.filter((placement) => placement.itemId !== id) }))); },
    saveOutfit(outfit) { const id = outfit.id || crypto.randomUUID(); setOutfits((current) => current.some((item) => item.id === id) ? current.map((item) => item.id === id ? { ...item, ...outfit, id } : item) : [{ ...outfit, id, createdAt: new Date().toISOString() }, ...current]); return id; },
    removeOutfit(id) { setOutfits((current) => current.filter((outfit) => outfit.id !== id)); },
    toggleFavoriteOutfit(id) { setOutfits((current) => current.map((outfit) => outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit)); },
    assignOutfitToToday(id) { const outfit = outfits.find((item) => item.id === id); if (!outfit) return; setLocalStorageItem("noa-today-outfit-v1", JSON.stringify({ outfitId: outfit.id, assignedDate: localDateKey(), savedAt: new Date().toISOString() })); },
    addInspiration(item) { setInspiration((current) => [{ ...item, id: crypto.randomUUID() }, ...current]); },
    updateInspiration(id, update) { setInspiration((current) => current.map((item) => item.id === id ? { ...item, ...update } : item)); },
    removeInspiration(id) { setInspiration((current) => current.filter((item) => item.id !== id)); },
    addOccasionTag(label) { const cleanLabel = label.trim(); if (!cleanLabel) return; setOccasionTags((current) => current.some((item) => item.toLowerCase() === cleanLabel.toLowerCase()) ? current : [...current, cleanLabel]); },
  };

  return createElement(StudioContext.Provider, { value }, children);
}

export function useStudioData() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudioData must be used inside StudioDataProvider");
  return context;
}
