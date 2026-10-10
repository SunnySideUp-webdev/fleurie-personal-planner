import type { Metadata } from "next";
import { PlannerDataProvider } from "./planner/_data/use-planner-data";
import { HabitDataProvider } from "./lifestyle/_data/use-habit-data";
import { MoodDataProvider } from "./lifestyle/_data/use-mood-data";
import { RoutineDataProvider } from "./lifestyle/_data/use-routine-data";
import { StudioDataProvider } from "./studio/_data/use-studio-data";
import { MoneyDataProvider } from "./money/_data/use-money-data";
import { JournalDataProvider } from "./journal/_data/use-journal-data";
import { ListsDataProvider } from "./lists/_data/use-lists-data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleurie Personal Planner",
  description: "A calm, vintage-floral personal planner for daily life, wellbeing, style, finances, journaling, and lists.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PlannerDataProvider><HabitDataProvider><MoodDataProvider><RoutineDataProvider><StudioDataProvider><MoneyDataProvider><JournalDataProvider><ListsDataProvider>{children}</ListsDataProvider></JournalDataProvider></MoneyDataProvider></StudioDataProvider></RoutineDataProvider></MoodDataProvider></HabitDataProvider></PlannerDataProvider></body>
    </html>
  );
}
