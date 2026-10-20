<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fleurie Personal Planner

## Product overview

Fleurie is a single-user, browser-persisted personal planner with a soft vintage floral aesthetic. It combines Today, Planner, Lifestyle, Studio, Money, Journal, and Lists in one Next.js application.

There is currently no backend, authentication, or remote database. User data and uploaded images are stored in `localStorage`, so preserve existing storage keys and saved-data compatibility unless a migration is deliberately implemented.

## Stack and commands

- Next.js App Router, React, strict TypeScript, and global CSS.
- Icons come from `lucide-react`.
- Use npm; `package-lock.json` is the lockfile.
- `npm run dev` starts the development server.
- `npm run build` is the required verification command.
- `npm run start` serves the production build.
- No automated test or lint command is configured yet. Do not claim those checks passed.

## Architecture

- `app/page.tsx`: Today dashboard and cross-feature summaries.
- `app/layout.tsx`: root layout and all feature data providers.
- `app/planner/`: tasks, reminders, planning, and calendar.
- `app/lifestyle/`: habits, statistics, mood, routines, and fitness data.
- `app/studio/`: closet, outfit canvas, Lookbook, and Today outfit assignment.
- `app/money/`: overview, expenses, budgets, and savings goals.
- `app/journal/`: journal entries, movable photos/stickers, calendar, prompts, and tags.
- `app/lists/`: shopping, wishlist, personal lists, and notes.
- Feature state and types live in each feature's `_data/` hooks/providers.
- Reusable feature UI belongs in `_components/`; `outfit-miniature.tsx` is the canonical saved-outfit preview.
- `app/globals.css` contains the shared visual system and most page styling.
- `public/` contains the Fleurie logo and decorative floral collage assets.
- `app/manifest.ts`, `app/_components/service-worker-registration.tsx`, and `public/sw.js` provide the installable PWA layer.

## Data and client-side behavior

- Components that use hooks, `window`, file uploads, pointer interactions, or `localStorage` must be client components.
- Keep the provider tree in `app/layout.tsx` intact. Use the existing feature hooks instead of creating parallel state stores.
- Do not write default state back to storage before the initial hydration/read has completed; retain each provider's `ready` guard.
- Treat stored object shapes as persisted schemas. When adding fields, make them backward-compatible and normalize older records when necessary.
- Preserve the established `noa-*` and `planner-*` storage keys unless the change includes a safe migration.
- Today is an integration surface: changes to favorites, quick journal entries, calendar events, savings goals, habits, routines, and outfits must remain consistent with their source feature.
- Calendar and Today assignments use local `YYYY-MM-DD` date keys. Avoid UTC conversion when it could shift the user's day.
- Uploaded images are data URLs saved in the browser. Be mindful of `localStorage` size and handle missing images gracefully.
- Route every `localStorage` write through `app/_lib/local-storage.ts` so quota and privacy-mode failures surface through the global storage warning instead of crashing or failing silently.
- Preserve canvas coordinates, rotation, size, opacity, z-order, and background color when rendering outfit or journal previews.
- The service worker must register only in production. Keep its cache limited to application pages and static resources; never duplicate personal `localStorage` records into the Cache API.
- Bump the service-worker cache name when changing cached shell behavior so obsolete caches are removed during activation.

## UI conventions

- Preserve the warm cream, blush, olive, serif, handwritten, and vintage botanical design unless the user requests a redesign.
- Decorative images should generally use transparent PNGs, deliberate layering, and `pointer-events: none` when they are not interactive.
- Do not add white tiles behind clothing or collage elements unless explicitly requested; saved outfit previews should visually match the editor canvas.
- Keep controls keyboard-accessible and retain meaningful `aria-label` text on icon-only buttons.
- Keep product navigation, controls, and system feedback in English. Spanish may remain where it represents personal starter content, persisted category names, or user-authored records; do not migrate stored values solely for translation.
- `globals.css` is shared across the application. Search for every selector use and check related routes before changing broad rules.
- Design should remain usable at normal browser zoom and responsive widths; screenshots taken at 80% zoom are references, not the target scale.

## Change workflow

1. Read the relevant feature page, its `_data` hook, related shared components, and matching CSS before editing.
2. Search for all consumers of persisted fields, shared selectors, and asset paths.
3. Keep changes focused and preserve unrelated user edits.
4. Update types, defaults, persistence, hydration, and previews together when a data model changes.
5. Run `npm run build` after implementation and resolve both TypeScript and Next.js errors.
6. For visual or interaction changes, manually verify the affected route plus any Today/overview card that mirrors the same data.

Do not edit generated output in `.next/` or dependencies in `node_modules/`.
