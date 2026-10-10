import {
  AlarmClock,
  Apple,
  Bath,
  BedDouble,
  Bike,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  Clock3,
  Coffee,
  Dog,
  Flower2,
  Footprints,
  GraduationCap,
  Heart,
  House,
  Languages,
  Laptop,
  ListChecks,
  Moon,
  Music2,
  Palette,
  PenLine,
  PersonStanding,
  Pill,
  ShoppingBasket,
  SprayCan,
  Sun,
  Target,
  Utensils,
  WalletCards,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type { HabitIconType } from "../_data/use-habit-data";

type HabitIconProps = {
  type: HabitIconType;
  size?: number;
  className?: string;
};

const extendedHabitIcons: Partial<Record<HabitIconType, LucideIcon>> = {
  walk: Footprints,
  stretch: PersonStanding,
  meditate: Brain,
  sleep: Moon,
  morning: Sun,
  nutrition: Apple,
  coffee: Coffee,
  medicine: Pill,
  heart: Heart,
  selfcare: Flower2,
  beauty: WandSparkles,
  study: GraduationCap,
  focus: Target,
  work: BriefcaseBusiness,
  clean: SprayCan,
  home: House,
  money: WalletCards,
  music: Music2,
  creative: Palette,
  write: PenLine,
  calendar: CalendarDays,
  tasks: ListChecks,
  time: Clock3,
  rest: BedDouble,
  bike: Bike,
  meal: Utensils,
  bath: Bath,
  pet: Dog,
  language: Languages,
  alarm: AlarmClock,
  computer: Laptop,
  shopping: ShoppingBasket,
  personal: CircleUserRound,
};

export function HabitIcon({ type, size = 22, className }: HabitIconProps) {
  const ExtendedIcon = extendedHabitIcons[type];
  if (ExtendedIcon) return <ExtendedIcon aria-hidden="true" className={className} size={size} strokeWidth={1.7} />;

  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {type === "sparkles" && (
        <>
          <circle cx="12" cy="12" r="2.15" {...common} />
          <path d="M12 9.8C9.9 8.2 9.7 4.2 12 3.2c2.3 1 2.1 5 0 6.6ZM14.2 12c1.6-2.1 5.6-2.3 6.6 0-1 2.3-5 2.1-6.6 0ZM12 14.2c2.1 1.6 2.3 5.6 0 6.6-2.3-1-2.1-5 0-6.6ZM9.8 12c-1.6 2.1-5.6 2.3-6.6 0 1-2.3 5-2.1 6.6 0Z" {...common} />
        </>
      )}
      {type === "water" && (
        <path d="M12 2.8S6.4 9 6.4 13.4a5.6 5.6 0 0 0 11.2 0C17.6 9 12 2.8 12 2.8Z" {...common} />
      )}
      {type === "exercise" && (
        <>
          <path d="M7.2 8.2v7.6M4.7 9.7v4.6M2.8 11.1v1.8M16.8 8.2v7.6M19.3 9.7v4.6M21.2 11.1v1.8M7.2 12h9.6" {...common} />
        </>
      )}
      {type === "read" && (
        <>
          <path d="M3.2 5.1c3.3-.6 6 .1 8.8 2.1v12c-2.8-2-5.5-2.7-8.8-2.1v-12Z" {...common} />
          <path d="M20.8 5.1c-3.3-.6-6 .1-8.8 2.1v12c2.8-2 5.5-2.7 8.8-2.1v-12Z" {...common} />
        </>
      )}
      {type === "leaf" && (
        <>
          <path d="M8 6.3h8l-.8 13H8.8L8 6.3ZM7 6.3h10M13.7 6.3l1.5-3.4h2.1" {...common} />
          <path d="m4 4 16 16" {...common} />
        </>
      )}
      {type === "journal" && (
        <>
          <path d="M5.2 3.5h11.1a2 2 0 0 1 2 2v15H7.2a2 2 0 0 1-2-2v-15Z" {...common} />
          <path d="M8.2 3.5v17M11.2 8h4M11.2 11.5h4" {...common} />
          <path d="m12 17 1.1-3.1 5.3-5.3 2 2-5.3 5.3L12 17Z" {...common} />
        </>
      )}
    </svg>
  );
}
