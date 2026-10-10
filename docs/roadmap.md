# Fleurie product roadmap

This roadmap records future direction and is not a delivery commitment. The current application remains browser-local and desktop-first.

## Mobile companion — later phase

Build a focused mobile/PWA companion instead of reproducing every desktop screen.

### Initial mobile modules

- Simplified Today dashboard
- Habit tracker
- Reminders with real push notifications
- Shopping and custom lists
- Quick Add
- Daily agenda and priority tasks
- Mood tracker
- Quick journal entry

Desktop remains the primary experience for the full weekly calendar, detailed planning, Money analytics, Journal management, and the Studio/outfit editor.

### Shared-data architecture

- Replace device-only `localStorage` with authenticated cloud storage.
- Use one shared data model for desktop and mobile.
- Initial backend preference: Supabase for authentication, database, and synchronization.
- Package the mobile experience as an installable PWA before considering React Native/Expo.
- Suggested mobile navigation: Today, Habits, Add, Reminders, and Lists.

### Sequence

1. Complete and polish the desktop application.
2. Define shared backend entities and user accounts.
3. Build responsive mobile views only for the selected modules.
4. Add offline behavior and push notifications.
5. Evaluate a native app only if deeper iOS/Android integration is needed.
