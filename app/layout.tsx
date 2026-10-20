import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PlannerDataProvider } from "./planner/_data/use-planner-data";
import { HabitDataProvider } from "./lifestyle/_data/use-habit-data";
import { MoodDataProvider } from "./lifestyle/_data/use-mood-data";
import { RoutineDataProvider } from "./lifestyle/_data/use-routine-data";
import { StudioDataProvider } from "./studio/_data/use-studio-data";
import { MoneyDataProvider } from "./money/_data/use-money-data";
import { JournalDataProvider } from "./journal/_data/use-journal-data";
import { ListsDataProvider } from "./lists/_data/use-lists-data";
import { ServiceWorkerRegistration } from "./_components/service-worker-registration";
import { StorageWarning } from "./_components/storage-warning";
import "./globals.css";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const decorativeAssetVariables = {
  "--asset-today-vintage-note": `url("${publicBasePath}/today-vintage-note.png")`,
  "--asset-today-header-tulips": `url("${publicBasePath}/today-header-tulips.png")`,
  "--asset-today-reminder-branch": `url("${publicBasePath}/today-reminder-branch.png")`,
  "--asset-planner-notes-branch": `url("${publicBasePath}/planner-notes-branch.png")`,
  "--asset-lifestyle-sidebar-tulips": `url("${publicBasePath}/lifestyle-sidebar-tulips.png")`,
  "--asset-lifestyle-statistics-sidebar": `url("${publicBasePath}/lifestyle-statistics-sidebar-botanical.png")`,
  "--asset-lifestyle-statistics-branch": `url("${publicBasePath}/lifestyle-statistics-branch.png")`,
  "--asset-lifestyle-statistics-tulips": `url("${publicBasePath}/lifestyle-statistics-tulips.png")`,
  "--asset-studio-header-branch": `url("${publicBasePath}/studio-header-branch.png")`,
  "--asset-studio-sidebar-tulips": `url("${publicBasePath}/studio-sidebar-tulips.png")`,
  "--asset-money-sidebar-tulips": `url("${publicBasePath}/money-sidebar-tulips.png")`,
  "--asset-journal-sidebar-tulips": `url("${publicBasePath}/journal-sidebar-tulips.png")`,
  "--asset-lists-sidebar-tulips": `url("${publicBasePath}/lists-sidebar-tulips.png")`,
  "--asset-lists-notes-branch": `url("${publicBasePath}/lists-notes-branch.png")`,
  "--asset-planner-sidebar-tulips": `url("${publicBasePath}/planner-sidebar-tulips.png")`,
  "--asset-planner-pink-notes-branch": `url("${publicBasePath}/planner-pink-notes-branch.png")`,
} as CSSProperties;

export const metadata: Metadata = {
  title: "Fleurie Personal Planner",
  description: "A calm, vintage-floral personal planner for daily life, wellbeing, style, finances, journaling, and lists.",
  applicationName: "Fleurie Personal Planner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fleurie",
  },
  icons: {
    icon: `${publicBasePath}/favicon.svg`,
    apple: `${publicBasePath}/icons/apple-touch-icon.png`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={decorativeAssetVariables}>
      <body><ServiceWorkerRegistration /><StorageWarning /><PlannerDataProvider><HabitDataProvider><MoodDataProvider><RoutineDataProvider><StudioDataProvider><MoneyDataProvider><JournalDataProvider><ListsDataProvider>{children}</ListsDataProvider></JournalDataProvider></MoneyDataProvider></StudioDataProvider></RoutineDataProvider></MoodDataProvider></HabitDataProvider></PlannerDataProvider></body>
    </html>
  );
}
