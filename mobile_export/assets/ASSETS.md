# BetConstructAI — Mobile Asset Export

Assets extracted from the BetConstructAI web app for the mobile team. Most of the
app's "assets" live **inline** in the HTML (SVG icons, a CSS text wordmark,
system fonts) — there are almost no binary asset files. Everything below reflects
what actually exists; nothing was invented.

## Headline findings

- **61 icons** extracted (custom hand-authored inline SVGs — not a library).
- **Logo:** text wordmark only — **no logo image file exists** (recreated as SVG).
- **App icon / favicon:** **none exists** — must be designed new.
- **Fonts:** **system fonts only** — nothing to license or bundle.
- **Images:** 2 marketing/social rasters copied (neither used in the app UI).

## Asset table

| asset (path under `assets/`) | count / type | where used in the app | source / license |
|------------------------------|--------------|-----------------------|------------------|
| `icons/*.svg` | 61 SVG icons | Marketplace (`index.html`) UI + nav + dynamic category glyphs; Admin console (`admin.html`) nav, tables, modals. `staff.html` has no icons. | Custom, hand-authored inline SVG in `index.html` (`IC` obj, 53) and `admin.html` (`IC` obj, 18), de-duplicated. Project-owned. |
| `icons/ICON_LIBRARY.md` | doc | — | Generated; full name list + per-screen usage map + dedup notes. |
| `logo/betconstructai-wordmark.svg` | 1 SVG (recreation) | Header wordmark on index/admin/staff/login | **Recreation** of the CSS text logo — no original existed. Project brand. |
| `logo/LOGO.md` | doc | — | Documents the real logo: HTML text `Bet`(#A60063) `Construct`(#141631) `AI`(#2f6bd6), weight 800, system font. |
| `app_icon/README.md` | doc | — | States **no** favicon/app-icon exists; recommends a 1024² magenta "B". |
| `fonts/FONTS.md` | doc | — | System font stacks per page; **no font files**, no Google Fonts, no `@font-face`. |
| `images/content_18772633_dc35118c474709b35dbb756aa19ed38a.webp` | WebP | **Not referenced in app** — standalone marketing asset (from `marketing/`). | Provenance unverified; confirm rights. |
| `images/480674608_10162530980146411_556711235524752165_n.jpg` | JPEG 960×960 | **Not referenced in app** — standalone photo/marketing (project root). | Social-CDN naming; provenance/license unverified. |
| `images/README.md` | doc | — | Notes both images unused in UI; no stock/placeholder assets in app. |

## Brand colors (light theme, canonical)

| role | hex |
|------|-----|
| magenta (`--mag`) | `#A60063` |
| blue (`--blue`) | `#2f6bd6` |
| ink / text (`--text`) | `#141631` |

(Alt brighter dark-mode variants exist in CSS: `--mag:#d6006c`, `--blue:#4a44b8`.)

## Not populated

The `mobile_export` tree also contains empty folders (`animations/`, `audio/`,
`design/`, `mock_data/`, `screenshots/`, `strings/`) — no audio, video, or
Lottie/animation assets exist in the source app, so none were produced here.

## Icon usage in code

Icons render via `ic('name')` → wrapped in
`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">…</svg>`.
The exported standalone files match this wrapper exactly (adding
`xmlns`). Some sub-shapes are solid (`fill="currentColor" stroke="none"`) —
preserved verbatim. See `icons/ICON_LIBRARY.md` for details.
