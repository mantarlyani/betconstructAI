# Images

Two raster images exist in the project. **Neither is referenced from any HTML
page** (`grep` for their filenames and for `.webp`/`.jpg`/`.png` in the app
returned no `<img>`/`background-image` hits) — they are standalone marketing /
social content shipped alongside the repo, not embedded UI assets.

| file | type | dims | source / notes |
|------|------|------|----------------|
| `content_18772633_dc35118c474709b35dbb756aa19ed38a.webp` | WebP | — | Marketing image, copied from the project's `marketing/` folder. Filename pattern matches exported social/CDN content. |
| `480674608_10162530980146411_556711235524752165_n.jpg` | JPEG (progressive) | 960×960 | Photo / marketing image, copied from the project root. The `..._n.jpg` naming and numeric IDs are the Facebook/Instagram CDN export pattern — likely a social post / promo photo. Square (960²). |

## Notes

- No placeholder or stock-photo assets were found in the app itself — the UI is
  icon- and text-driven (see `../icons/`), with no photographic content wired in.
- Because these images are not used in the app, confirm with the marketing owner
  what each is for before shipping them in the mobile build.
- Provenance/licensing of both images is **unverified** — the JPEG's naming
  suggests it originated from a social platform. Confirm usage rights before
  redistributing in an app.
