export type CalendarEvent = {
  id: string;
  week: number;
  day: number;
  start: number;
  duration: number;
  title: string;
  tone: "green" | "olive" | "pink" | "rose" | "sand" | "taupe";
  icon: "work" | "food" | "study" | "workout" | "heart" | "journal" | "habit" | "outfit";
};

export const initialCalendarEvents: CalendarEvent[] = [
  { id: "m-work", week: 0, day: 1, start: 9, duration: 3, title: "Work (Remote)", tone: "green", icon: "work" },
  { id: "m-lunch", week: 0, day: 1, start: 12, duration: 1, title: "Lunch", tone: "pink", icon: "food" },
  { id: "m-study", week: 0, day: 1, start: 14, duration: 2, title: "Study - Estadística", tone: "sand", icon: "study" },
  { id: "m-workout", week: 0, day: 1, start: 18.5, duration: 1, title: "Workout", tone: "green", icon: "workout" },
  { id: "t-work", week: 0, day: 2, start: 9, duration: 3, title: "Work (Remote)", tone: "green", icon: "work" },
  { id: "t-lunch", week: 0, day: 2, start: 12, duration: 1, title: "Lunch", tone: "pink", icon: "food" },
  { id: "t-project", week: 0, day: 2, start: 15, duration: 2, title: "Proyecto U", tone: "pink", icon: "work" },
  { id: "w-work", week: 0, day: 3, start: 9, duration: 3, title: "Work (Remote)", tone: "green", icon: "work" },
  { id: "w-uni", week: 0, day: 3, start: 13, duration: 5, title: "University", tone: "sand", icon: "study" },
  { id: "w-journal", week: 0, day: 3, start: 19, duration: 1, title: "Journal", tone: "sand", icon: "journal" },
  { id: "th-office", week: 0, day: 4, start: 9, duration: 8, title: "Office", tone: "pink", icon: "outfit" },
  { id: "f-work", week: 0, day: 5, start: 9, duration: 3, title: "Work (Remote)", tone: "green", icon: "work" },
  { id: "f-lunch", week: 0, day: 5, start: 12, duration: 1, title: "Lunch", tone: "pink", icon: "food" },
  { id: "f-study", week: 0, day: 5, start: 14, duration: 2, title: "Study - Física 2", tone: "sand", icon: "study" },
  { id: "f-dinner", week: 0, day: 5, start: 18, duration: 2, title: "Dinner JJ", tone: "pink", icon: "heart" },
  { id: "s-uni", week: 0, day: 6, start: 7, duration: 11, title: "University", tone: "green", icon: "study" },
  { id: "sun-brunch", week: 0, day: 7, start: 10, duration: 1.5, title: "Brunch", tone: "pink", icon: "food" },
  { id: "sun-plan", week: 0, day: 7, start: 14, duration: 1.5, title: "Plan next week", tone: "sand", icon: "study" },
  { id: "sun-reset", week: 0, day: 7, start: 20, duration: 1, title: "Everything shower", tone: "green", icon: "habit" },
];
