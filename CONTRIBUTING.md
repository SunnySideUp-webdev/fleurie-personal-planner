# Contributing to Fleurie

Fleurie is a personal portfolio project and is not currently open to unsolicited code contributions. Suggestions and accessibility or security reports are welcome, but implementation work should be coordinated with the project owner first.

## Development setup

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Start the local app with `npm run dev`.
4. Before handing off a change, run `npm run build`.

No separate automated test or lint command is configured yet.

## Project expectations

- Read `AGENTS.md` before modifying the project.
- Keep changes focused and avoid unrelated visual or data migrations.
- Preserve backward compatibility for existing `localStorage` records.
- Use the existing feature providers and hooks rather than parallel stores.
- Verify any feature mirrored on Today in both its source page and Today.
- Preserve the Fleurie visual language unless a redesign is explicitly requested.
- Keep icon-only controls accessible with meaningful labels.
- Do not commit `.next/`, `node_modules/`, local environment files, browser exports, or personal planner data.

## Visual contributions

Only add images, fonts, and other visual assets when their origin and redistribution rights are known. Update `docs/ASSETS.md` when an asset is added, replaced, renamed, or removed.

## Commit guidance

Use a short, imperative subject that describes the user-facing result, for example:

```text
Show favorite savings image on Today
```

Explain migrations, compatibility concerns, and manual verification in the commit body when relevant.
