# Public portfolio release checklist

Use this list before changing the repository from private to public.

## Identity and presentation

- [x] Confirm the public repository name and description.
- [x] Update `package.json` name if the final repository slug differs.
- [x] Update the application metadata title and description to Fleurie.
- [x] Add current desktop and responsive screenshots to the README.
- [x] Add the deployed URL when one exists.
- [x] Review English and Spanish interface copy for intentional consistency.

## Rights and privacy

- [x] Verify the origin and public-display rights for every file listed in `docs/ASSETS.md`.
- [x] Confirm that the copyright-holder name in `LICENSE` is the desired public name.
- [x] Review dependency licenses.
- [x] Confirm no personal journal, finance, health, calendar, or image data is present in tracked files.
- [x] Confirm no credentials, tokens, private URLs, or local `.env` files are tracked.

## Quality

- [x] Run `npm ci` from a clean checkout.
- [x] Run `npm run build` successfully.
- [x] Manually test Today and every primary navigation route.
- [x] Test persisted data after a refresh.
- [x] Test at desktop and narrow responsive widths at 100% browser zoom.
- [x] Test empty states across every feature.
- [x] Test a record created without a newer optional field.
- [x] Confirm uploaded images and large journal/outfit canvases fail gracefully near storage limits.
- [x] Validate the PWA manifest, icons, service-worker registration, and offline reload of a visited route.

## Repository hygiene

- [x] Confirm `.gitignore` excludes dependencies, builds, local environments, editor state, and logs.
- [x] Review the initial commit for accidental generated or personal files.
- [x] Set the default branch and repository visibility.
- [x] Enable private vulnerability reporting before or when the repository becomes public.
- [ ] Add a release tag only after the public baseline is verified.

## QA notes — October 19, 2026

- All 23 user-facing routes returned HTTP 200 in the production smoke test.
- Today rendered correctly at 1440 × 1024 and 100% browser scale.
- The 390 × 844 test has no horizontal overflow; the mobile date and Add button no longer overlap.
- Product controls and navigation remain English. Spanish is retained only where it represents personal starter content, persisted categories, or user-authored records.
- A temporary browser profile preserved `localStorage` after reload and rendered a legacy savings goal without the optional image field.
- A visited Journal route reopened successfully after the local production server was stopped.
- A privacy scan found no local paths, private email addresses, credentials, or personal planner records in source files.
- Dependency installation reported zero known npm audit vulnerabilities.
- A GitHub Pages static export served all 23 user-facing routes, the manifest, service worker, logo, and tested decorative assets with HTTP 200 under the repository subpath.
- Chrome loaded the exported site without failed requests or runtime exceptions, navigated client-side under the repository subpath, and registered the PWA service worker with the correct scope.
- A simulated `QuotaExceededError` left the page operational and displayed an accessible storage warning.
- An isolated empty-data profile rendered all 23 user-facing routes without exceptions or failed requests; Calendar now normalizes missing weekly habit rows safely.
- GitHub Pages deployment and private vulnerability reporting are configured as part of the public baseline.
