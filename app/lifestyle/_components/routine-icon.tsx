"use client";

import {
  AlarmClock, Bath, BedDouble, BicepsFlexed, BookHeart, BookOpen, Brain,
  BriefcaseBusiness, CalendarCheck, ChefHat, Clock3, Coffee, CookingPot, CupSoda,
  Dog, Dumbbell, Flower2, Footprints, GraduationCap, HeartPulse, House, LampDesk,
  Laptop, ListChecks, LucideIcon, MoonStar, Music2, NotebookPen, Palette, Pill,
  PersonStanding, ShoppingBasket, ShowerHead, Sparkles, SprayCan, Sun, Target,
  UsersRound, Utensils, WashingMachine,
} from "lucide-react";
import type { RoutineIconType } from "../_data/use-routine-data";

const routineIconOptions: Array<{ value: RoutineIconType; label: string; icon: LucideIcon }> = [
  { value: "morning", label: "Morning routine", icon: Sun },
  { value: "night", label: "Night routine", icon: MoonStar },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "shower", label: "Shower", icon: ShowerHead },
  { value: "skincare", label: "Skincare", icon: Sparkles },
  { value: "meal", label: "Meal", icon: Utensils },
  { value: "sleep", label: "Sleep", icon: BedDouble },
  { value: "read", label: "Read", icon: BookOpen },
  { value: "study", label: "Study", icon: GraduationCap },
  { value: "focus", label: "Focus", icon: Target },
  { value: "computer", label: "Computer", icon: Laptop },
  { value: "work", label: "Work", icon: BriefcaseBusiness },
  { value: "home", label: "Home", icon: House },
  { value: "clean", label: "Cleaning", icon: SprayCan },
  { value: "laundry", label: "Laundry", icon: WashingMachine },
  { value: "cook", label: "Cooking", icon: CookingPot },
  { value: "shopping", label: "Shopping", icon: ShoppingBasket },
  { value: "exercise", label: "Exercise", icon: Dumbbell },
  { value: "stretch", label: "Stretch", icon: PersonStanding },
  { value: "walk", label: "Walk", icon: Footprints },
  { value: "health", label: "Health", icon: HeartPulse },
  { value: "meditate", label: "Meditation", icon: Brain },
  { value: "selfcare", label: "Self care", icon: Flower2 },
  { value: "journal", label: "Journal", icon: NotebookPen },
  { value: "plan", label: "Planning", icon: CalendarCheck },
  { value: "tasks", label: "Tasks", icon: ListChecks },
  { value: "time", label: "Time", icon: Clock3 },
  { value: "alarm", label: "Alarm", icon: AlarmClock },
  { value: "music", label: "Music", icon: Music2 },
  { value: "creative", label: "Creative time", icon: Palette },
  { value: "pet", label: "Pet care", icon: Dog },
  { value: "family", label: "Family", icon: UsersRound },
  { value: "medicine", label: "Medicine", icon: Pill },
  { value: "drink", label: "Hydration", icon: CupSoda },
  { value: "bath", label: "Bath", icon: Bath },
  { value: "desk", label: "Desk reset", icon: LampDesk },
  { value: "strength", label: "Strength", icon: BicepsFlexed },
  { value: "reading", label: "Cozy reading", icon: BookHeart },
  { value: "kitchen", label: "Kitchen", icon: ChefHat },
];

export function RoutineIcon({ type, size = 22 }: { type: RoutineIconType; size?: number }) {
  const Icon = routineIconOptions.find((option) => option.value === type)?.icon ?? Sparkles;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

export function RoutineIconPicker({ value, onChange }: { value: RoutineIconType; onChange: (icon: RoutineIconType) => void }) {
  return <fieldset className="routine-icon-field">
    <legend>Icon</legend>
    <div className="routine-icon-picker" role="radiogroup" aria-label="Routine icon">
      {routineIconOptions.map(({ value: option, label, icon: Icon }) => <button
        key={option}
        type="button"
        role="radio"
        aria-checked={value === option}
        aria-label={label}
        title={label}
        className={value === option ? "selected" : ""}
        onClick={() => onChange(option)}
      ><Icon size={23} strokeWidth={1.75} /></button>)}
    </div>
  </fieldset>;
}
