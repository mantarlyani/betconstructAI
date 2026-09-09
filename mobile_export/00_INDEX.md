# 00 · INDEX — BetConstructAI mobile export

Everything in this folder is derived from the demo code in this repo (`index.html`, `admin.html`, `staff.html`, `login.html`, `privacy.html`, `api/*.js`, SQL). Nothing is invented; open items and assumptions live in `OPEN_QUESTIONS.md`. Secrets (service_role key, real passwords) are `<REDACTED>`; the anon key is public by design.

**Read in this order:** `01` → `02` → `03` → `04` → `05` → `06`, with `OPEN_QUESTIONS.md` alongside. Designers start in `design/`; engineers in `05` + `strings/` + `mock_data/`.

---

## Part A — Documentation
| File | What's in it |
|---|---|
| [00_INDEX.md](00_INDEX.md) | This file — map of the whole export |
| [01_APP_OVERVIEW.md](docs/01_APP_OVERVIEW.md) | What the app is, roles, jobs, vocabulary, real‑vs‑mocked, tech stack |
| [02_AREAS_AND_RESPONSIBILITIES.md](docs/02_AREAS_AND_RESPONSIBILITIES.md) | Every functional area (client / login / admin / staff): purpose, screens, data, rules, deps, mobile‑v1 priority + dependency diagram |
| [03_SCREENS_AND_FLOWS.md](docs/03_SCREENS_AND_FLOWS.md) | Screen inventory, navigation tree, 8 numbered flows, embedded screenshots (390×844) |
| [04_BEHAVIOUR_AND_LOGIC.md](docs/04_BEHAVIOUR_AND_LOGIC.md) | Validation (verbatim errors), calculations, sorting, roles/permissions, state machines (tables), auth/session, realtime, **verbatim AI prompt**, persistence, analytics |
| [05_DATA_AND_API.md](docs/05_DATA_AND_API.md) | Domain model (27 entities), every data op, REST/RPC/Storage, 9 serverless endpoints, two schema generations |
| [06_INTEGRATIONS_AND_PLATFORM.md](docs/06_INTEGRATIONS_AND_PLATFORM.md) | Third‑party services, env vars (names only), device capabilities, environments, accessibility |
| [OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) | 28 open questions & assumptions, grouped by area |

> **PDF copies:** `pdf/` contains a PDF of every `docs/*.md` file plus `THEME.pdf`, same base names.

## Part B — Design
| File | What's in it |
|---|---|
| [design/tokens.json](design/tokens.json) | 62 colors, 21 type styles, spacing/radii/shadows/borders/durations/icon sizes |
| [design/THEME.md](design/THEME.md) | Theme explanation + 24 component groups inventory |

## Part B — Assets
| Path | What's in it |
|---|---|
| [assets/ASSETS.md](assets/ASSETS.md) | Asset overview |
| `assets/icons/*.svg` (61) + [ICON_LIBRARY.md](assets/icons/ICON_LIBRARY.md) | All UI icons as standalone SVGs + icon→screen map |
| [assets/logo/](assets/logo/LOGO.md) | Wordmark spec + recreated `betconstructai-wordmark.svg` |
| [assets/app_icon/README.md](assets/app_icon/README.md) | No app icon exists — artwork needed (see OPEN_QUESTIONS #21) |
| [assets/fonts/FONTS.md](assets/fonts/FONTS.md) | System fonts only — nothing to bundle |
| `assets/images/` (2) + [README](assets/images/README.md) | Copied raster images |

## Part B — Strings
| Path | What's in it |
|---|---|
| `strings/strings.ru.json` · `strings.en.json` · `strings.hy.json` | 1163 flat snake_case keys each, `{name}`/`{count}` placeholders preserved |
| `strings/README.md` | Key scheme + how strings map to screens |

## Part B — Mock data
| Path | What's in it |
|---|---|
| `mock_data/*.sql` · `*.csv` (24) | Real DB schema + seed/demo data copied verbatim (**passwords `<REDACTED>`**) |

## Screenshots
| Path | What's in it |
|---|---|
| `screenshots/*.png` (8) | Real captures at 390×844: client entry/home, unified login, privacy, admin login/dashboard, staff cabinet |
