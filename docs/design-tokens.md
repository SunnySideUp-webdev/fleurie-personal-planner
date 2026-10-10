# Fleurie design tokens

The canonical implementation lives in `app/globals.css`. This document is a compact reference; update it when the shared variables or typography system changes.

## Palette

| Role | Name | Hex |
| --- | --- | --- |
| Primary pink | Tea Rose | `#EBB4B2` |
| Deep pink | Dusty Rose | `#B46C72` |
| Soft green | Dry Grass | `#9CA469` |
| Primary green | Olive Grove | `#70702E` |
| Highlight green | Matcha | `#D7D799` |
| Background | Linen | `#EEE7DD` |
| Secondary neutral | Soft Sand | `#C7BEB3` |
| Text | Warm near-black | `#27251F` |
| Surface | Paper | `#FAF6F0` |
| Muted text | Warm gray | `#756E65` |

Additional shared tokens:

- Subtle line: `rgba(95, 82, 67, 0.15)`
- Soft shadow: `0 12px 28px rgba(80, 64, 48, 0.08)`

## Typography

- Interface and controls: `Avenir Next`, Avenir, `DM Sans`, system sans-serif
- Display and card headings: `Iowan Old Style`, `Bodoni 72`, Georgia, serif
- Handwritten accents: `Snell Roundhand`, `Segoe Script`, cursive
- Canvas text tools also offer serif, script, and sans-serif variants

## Wireframe baseline

- Desktop viewport: 1440 × 1024 px
- Sidebar: 210 px
- Main outer spacing: 24 px
- Card radius: 18 px
- Control radius: 12–16 px
- Card border: 1 px Soft Sand
- Default theme: light

The application intentionally uses local/system fallbacks and does not currently download web fonts. Validate visual changes on systems where the preferred Apple fonts are unavailable.
