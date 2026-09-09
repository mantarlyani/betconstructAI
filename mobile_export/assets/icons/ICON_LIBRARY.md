# BetConstructAI — Icon Library

## What these are

These are **CUSTOM, hand-authored inline SVG icons** written directly into the
app's HTML/JS. They are **NOT** from any third-party icon set (not Lucide, not
Feather, not Material, not Heroicons). The path data was drawn by hand for this
project. Stylistically they resemble a Feather/Lucide-family look (24×24 grid,
rounded caps/joins, consistent stroke), but the geometry is bespoke — do not
substitute a library icon and assume it matches.

## Source

Each source file defines an object `const IC = { name: '<svg path data>', ... }`
and a helper:

```js
function ic(n){
  return `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;
}
```

- `index.html` (marketplace / main app) — `IC` at line ~332, **53 icons**
- `admin.html` (admin console) — `IC` at line ~216, **18 icons**
- `staff.html` — **no icon set** (no inline SVG icons at all)

## Wrapper spec (matched exactly in the exported files)

| Attribute        | Value                                    |
|------------------|------------------------------------------|
| `viewBox`        | `0 0 24 24`                              |
| `fill`           | `none` (default)                         |
| `stroke`         | `currentColor`                           |
| `stroke-width`   | `1.7`                                    |
| `stroke-linecap` | `round`                                  |
| `stroke-linejoin`| `round`                                  |

Icons inherit color from CSS `currentColor`. A few icons contain sub-shapes that
**override** the stroke default with `fill="currentColor" stroke="none"` — these
are solid fills, preserved verbatim in the exported files: `dot`, `dots`, `star`,
`spade`, `target` (center pip), `gamepad` (button pips), `dice` (pips). Sizing is
handled by the app's `.i` CSS class (not included here — set width/height in your
mobile layer).

## Files exported (61 unique icons)

De-duplicated across `index.html` and `admin.html`. Names shared between the two
files that were byte-identical produced a single file. Four names exist in both
files with **different geometry**; the richer/more-detailed variant was kept and
the difference is noted below.

### Icons from index.html (marketplace)
`activity`, `badge`, `ball`, `bell`, `book`, `box`, `briefcase`, `broadcast`,
`bulb`, `card`, `cards`, `cart`, `cash`, `check`, `cherry`, `chevD`, `chevL`,
`clock`, `code`, `coin`, `desktop`, `diamond`, `dice`, `dot`, `dots`, `external`,
`gamepad`, `gear`, `globe`, `home`, `megaphone`, `message`, `news`, `pin`,
`plus`, `puzzle`, `robot`, `search`, `shield`, `sparkles`, `spade`, `star`,
`store`, `target`, `trophy`, `tv`, `umbrella`, `user`, `users`, `wallet`,
`wheel`

### Icons only in admin.html
`crm`, `copy`, `dash`, `eye`, `key`, `layout`, `scale`, `x`

### Shared, identical (one file kept)
`check`, `clock`, `megaphone`, `plus`, `star`, `users`

### Shared, DIFFERENT geometry — richer variant kept (noted)

| name       | kept from | difference |
|------------|-----------|------------|
| `shield`   | index.html | index = shield with a **padlock** inside (rect + shackle); admin = shield with a **checkmark** inside. Kept the lock (more shapes). If your admin screens need the check-shield, re-derive from admin.html line ~218. |
| `chart`    | index.html | index = axis + **scatter/line dots** with connectors; admin = axis + **bar columns**. Kept the scatter variant. Admin bar-chart path is in admin.html line ~220. |
| `building` | index.html | index adds a **door** at the base (`M10.5 20.5v-3h3v3`); admin omits the door. Kept index (richer). |
| `pin`      | index.html | trivial only — inner circle `r=2.6` (index) vs `r=2.5` (admin). Kept index. |

## Icon → screen / area usage

Counts below are `ic('name')` call sites per file. Many marketplace icons are
also dispatched **dynamically** as category/vertical glyphs via `ic(varName)`
(the icon name is stored as an `ic:'...'` field on product/category data), so
their real usage is broader than the static count.

### index.html (marketplace / storefront app)

| icon | calls | area |
|------|-------|------|
| `chevL` | 20 | back buttons / navigation headers (every sub-page) |
| `sparkles` | 13 | AI advisor / AI-branded features, highlights |
| `message` | 12 | chat / AI advisor conversation, messaging |
| `check` | 11 | feature lists, confirmations, selected states |
| `shield` | 11 | licensing / compliance / trust badges |
| `chevD` | 8 | expandable sections / dropdowns / accordions |
| `store` | 5 | marketplace / vendor storefront tabs |
| `building` | 4 | company / operator / vendor entities |
| `pin` | 3 | location / region markers |
| `plus` | 3 | add / create actions |
| `search` | 3 | search bar / discovery |
| `dot` | 3 | status indicators / list bullets |
| `external` | 3 | outbound links |
| `trophy` | 3 | rankings / awards / leaderboard |
| `user` | 3 | account / profile |
| `badge`, `box`, `briefcase`, `cart`, `diamond`, `globe`, `megaphone`, `star` | 2 each | product cards, categories, cart, i18n/region, promotions, ratings |
| `bell`, `broadcast`, `card`, `chart`, `desktop`, `dots`, `gear`, `puzzle`, `target`, `users`, `wheel` | 1 each | notifications, live/broadcast, payments, analytics, platform, menu, settings, integrations, targeting, teams, casino/games |

Dynamically-dispatched category/vertical glyphs (referenced as `ic:'...'` data,
rendered via `ic(var)`): `ball` (sports), `cards`/`spade`/`diamond`/`dice`
(casino/table games), `gamepad` (games), `wheel` (roulette/live), `cherry`
(slots), `coin`/`cash`/`wallet` (payments/finance), `code` (API/SDK),
`chart`/`activity` (analytics), `robot` (AI/automation), `umbrella` (risk),
`bulb` (ideas), `news` (content), `book` (docs), `tv` (streaming), `desktop`
(platform), `building` (operators), `box`/`puzzle` (modules/add-ons).

### admin.html (admin console)

| icon | calls | area |
|------|-------|------|
| `users` | 13 | user management |
| `megaphone` | 12 | marketing / campaigns / announcements |
| `chart` | 10 | analytics dashboards |
| `plus` | 10 | create / add records |
| `crm` | 9 | CRM module |
| `x` | 9 | close / dismiss modals |
| `layout` | 8 | layout / page-builder / sections |
| `shield` | 8 | roles / permissions / security |
| `eye` | 7 | view / preview / visibility |
| `check` | 6 | approvals / confirmations |
| `star` | 6 | featured / favorites / ratings |
| `clock` | 5 | scheduling / recent / time |
| `building` | 3 | organizations / operators |
| `sparkles` | 2 | AI-assisted admin features |
| `key` | 1 | API keys / access |
| `dash`, `copy`, `scale` | (defined) | dashboard nav, copy-to-clipboard, legal/compliance |

## To use in the mobile app

Each file is a standalone, drop-in SVG that colors itself via `currentColor`
(set the parent text color, or add `color`/`tint` in your platform). Set an
explicit width/height — the source app sized them via CSS, not the SVG.
