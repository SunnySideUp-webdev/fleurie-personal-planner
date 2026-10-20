# Visual assets

Fleurie uses static PNG and SVG artwork from `public/` to build its vintage floral identity. Runtime user uploads are stored in browser data and are not repository assets.

## Inventory

### Brand

- `daylily-logo.png` — Fleurie wordmark and floral mark. The filename is retained for compatibility with existing references.
- `favicon.svg` — browser icon.
- `icons/icon-192.png` and `icons/icon-512.png` — install icons for the PWA.
- `icons/maskable-512.png` — full-background icon for adaptive launchers.
- `icons/apple-touch-icon.png` — iOS home-screen icon.

### Sidebar compositions

- `journal-sidebar-tulips.png`
- `lifestyle-sidebar-tulips.png`
- `lifestyle-statistics-sidebar-botanical.png`
- `lists-sidebar-tulips.png`
- `money-sidebar-tulips.png`
- `planner-sidebar-tulips.png`
- `studio-sidebar-tulips.png`

### Page decorations

- `lifestyle-statistics-branch.png`
- `lifestyle-statistics-tulips.png`
- `lists-notes-branch.png`
- `money-header-note.png`
- `planner-notes-branch.png`
- `planner-pink-notes-branch.png`
- `studio-header-branch.png`
- `today-floral-collage.png`
- `today-header-tulips.png`
- `today-reminder-branch.png`
- `today-vintage-note.png`

### Design history

- `references/` contains visual references and moodboards used during design exploration.
- `wireframes/` contains early SVG concepts for the Today dashboard.

These folders are development artifacts and are not loaded by the running application.

## Usage rules

- Keep decorative artwork in `public/` and reference it by an absolute public path such as `/today-header-tulips.png`.
- Prefer transparent PNGs for layered botanical compositions.
- Use `pointer-events: none` for decoration that must not block interface controls.
- Preserve aspect ratio unless a design intentionally calls for cropping.
- Search the project before renaming or deleting an asset.
- Add new files to this inventory and record their origin outside the binary file.

## Rights and provenance

The repository license does not grant reuse rights for project artwork.

Sharon (Sunny) Consuegra confirmed ownership of the project artwork and reference images on October 19, 2026, and approved them for public portfolio display. Third-party packages and Lucide icons remain under their own licenses; see `THIRD_PARTY_NOTICES.md`.

Some PNG files retain `chatgpt.com` as source metadata because they were created through ChatGPT under Sharon's direction. The metadata contains no private account identifier or local filesystem path.
