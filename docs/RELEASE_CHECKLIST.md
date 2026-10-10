# Public portfolio release checklist

Use this list before changing the repository from private to public.

## Identity and presentation

- [ ] Confirm the public repository name and description.
- [ ] Update `package.json` name if the final repository slug differs.
- [ ] Update the application metadata title and description to Fleurie.
- [ ] Add current desktop and responsive screenshots to the README.
- [ ] Add the deployed URL when one exists.
- [ ] Review English and Spanish interface copy for intentional consistency.

## Rights and privacy

- [ ] Verify the origin and public-display rights for every file listed in `docs/ASSETS.md`.
- [ ] Confirm that the copyright-holder name in `LICENSE` is the desired public name.
- [ ] Review dependency licenses.
- [ ] Confirm no personal journal, finance, health, calendar, or image data is present in tracked files.
- [ ] Confirm no credentials, tokens, private URLs, or local `.env` files are tracked.

## Quality

- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run build` successfully.
- [ ] Manually test Today and every primary navigation route.
- [ ] Test persisted data after a refresh.
- [ ] Test at desktop and narrow responsive widths at 100% browser zoom.
- [ ] Test empty states and records created with older optional fields.
- [ ] Confirm uploaded images and large journal/outfit canvases fail gracefully near storage limits.

## Repository hygiene

- [ ] Confirm `.gitignore` excludes dependencies, builds, local environments, editor state, and logs.
- [ ] Review the initial commit for accidental generated or personal files.
- [ ] Set the default branch and repository visibility.
- [ ] Enable private vulnerability reporting before or when the repository becomes public.
- [ ] Add a release tag only after the public baseline is verified.
