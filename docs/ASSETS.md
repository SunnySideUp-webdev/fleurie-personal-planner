# Visual assets

Fleurie uses static PNG and SVG artwork from `public/` to build its vintage floral identity. Runtime user uploads are stored in browser data and are not repository assets.

## Inventory

### Brand

- `daylily-logo.png` — Fleurie wordmark and floral mark. The filename is retained for compatibility with existing references.
- `favicon.svg` — browser icon.

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

The repository license does not grant reuse rights for project artwork. Before making the repository public, verify that every image, font, icon, and other visual resource is original, commissioned, or licensed for public redistribution and portfolio display.

The current repository does not contain complete source/provenance records for every PNG or reference image. That verification is therefore a required public-release step. Third-party packages and Lucide icons remain under their own licenses.
