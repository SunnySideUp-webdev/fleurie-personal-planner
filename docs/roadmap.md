# Fleurie product roadmap

This roadmap records future direction and is not a delivery commitment. The current application remains browser-local and desktop-first.

## PWA foundation — completed

- Install manifest and application icons.
- Register a production service worker.
- Cache previously opened pages and static resources for offline access.
- Validate persistence and offline reload in a temporary browser profile.
- Publish the static export through GitHub Pages with repository-subpath support.
- Add desktop and narrow-screen portfolio previews.

The public HTTPS deployment and initial narrow-screen layout pass are complete. Deeper mobile-specific product simplification remains a later phase.

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
- Evolve the existing installable PWA into the focused mobile companion before considering React Native/Expo.
- Suggested mobile navigation: Today, Habits, Add, Reminders, and Lists.

### Sequence

1. Complete and polish the desktop application.
2. Define shared backend entities and user accounts.
3. Build responsive mobile views only for the selected modules.
4. Add offline behavior and push notifications.
5. Evaluate a native app only if deeper iOS/Android integration is needed.
