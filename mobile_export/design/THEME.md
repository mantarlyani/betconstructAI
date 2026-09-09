# BetConstructAI — Design Token Reference (for native mobile rebuild)

Extracted verbatim from the `<style>` blocks of `index.html`, `admin.html`, `staff.html`, `login.html`, `privacy.html`. Every value below appears in the source CSS or inline styles — nothing is invented. Companion machine file: `tokens.json`.

---

## 1. Theme model — light only

**There is a single light theme. No dark theme exists.** None of the five files contain `prefers-color-scheme`, a `data-theme` attribute, `color-scheme`, or a light/dark toggle. The only place the string "dark/light mode" appears is inside a Russian marketing description of a product feature (`index.html` product copy), not a CSS mechanism. Accordingly every color's `dark` value in `tokens.json` is `null`.

- `admin.html` has a **language switcher** (RU / EN / HY), persisted to `localStorage['bc_alang']` and applied by re-translating the DOM — it changes text, never colors.
- `index.html`, `login.html`, `privacy.html` also have RU/EN(/HY) language toggles. Again text-only.
- So: build one light palette; there is no dark variant to mirror.

### Per-file variable drift (important)
The brand system is consistent, but a few CSS variables were given different values per file. Treat `index.html` / `admin.html` as the canonical desktop/app palette; `staff.html` and the auth pages drift slightly.

| Variable | index.html | admin.html | staff.html | login.html | privacy.html |
|---|---|---|---|---|---|
| `--mag` | `#A60063` | `#A60063` | **`#d6006c`** | `#A60063` | `#A60063` |
| `--mag-dk` | `#7a0049` | `#7a0049` | — | `#7a0049` | `#7a0049` |
| `--bg` | `#f3f4f6`→`#f5f6fa` (overridden) | `#f3f4f6` | `#f6f7fb` | `#f6f2f5` | `#f6f2f5` |
| `--card` | `#ffffff` | `#fff` | `#fff` | `#fff` | `#fff` |
| `--line` | `#e7e9ee`→`#eceef4` (overridden) | `#e7e9ee` | `#e7e9f2` | `#e7e2e8` | `#e7e2e8` |
| `--text` | `#1d1f25` | `#1d1f25` | `#141631` | `#1b191d` | `#1b191d` |
| `--muted` | `#8b909b` | `#8b909b` | `#8b8fa7` | `#7d7280` | `#726a76` |
| `--blue` | `#2f6bd6` | `#2f6bd6` | `#4a44b8` (indigo) | `#2f6bd6` | `#2f6bd6` |
| `--green` | `#2fb877` | `#2fb877` | `#12a150` | — | — |
| `--amber` | — (uses `#c8901f`/`#c8860a` literals) | `#c8860a` | `#c98a00` | — | — |
| `--red` / `--live` | `--live #e2453f` | `--red #e2453f` | `#e5484d` | `#d63d38` | — |

> Note: `index.html` redefines `--bg` and `--line` a second time inside a "Premium light polish" block (`--bg:#f5f6fa; --line:#eceef4;`), plus new tokens `--soft`, `--soft-h`, `--glow`. The later declaration wins. It also sets a redundant `--line:#ecdef0` then immediately `--line:#eceef4` on the same line — `#eceef4` is the effective value.

---

## 2. Color palette

### 2.1 Named brand / semantic colors (from CSS variables)

| Token | Hex | Role | Used for |
|---|---|---|---|
| `mag` | `#A60063` | primary | Brand magenta. Buttons, active tabs/chips, icons, focus border, avatars. |
| `mag-staff` | `#d6006c` | primary | `--mag` in staff.html only (brighter). |
| `mag-dk` | `#7a0049` | primary | Dark brand shade; loyalty-card gradient end; privacy links. |
| `mag-grad-a` | `#c40073` | primary | Premium button/brand-card gradient start (index polish). |
| `mag-grad-b` | `#8a004f` | primary | Premium button/brand-card gradient end. |
| `bg` | `#f3f4f6` | background | Base app background (admin). |
| `bg-index` | `#f5f6fa` | background | index `--bg` override. |
| `bg-staff` | `#f6f7fb` | background | staff background. |
| `bg-auth` | `#f6f2f5` | background | login + privacy background (warm tint). |
| `body-outer` | `#d9dce3` → `#dcdfe8` | background | The ground behind the 412px phone frame (index). |
| `phone-bg` | `#f6f7fb` | background | `.phone` surface (index). |
| `card` | `#ffffff` | surface | Cards, inputs, top/bottom bars. |
| `line` | `#e7e9ee` | border | Default 1px borders & dividers. |
| `line-index` | `#eceef4` | border | index override. |
| `line-staff` | `#e7e9f2` | border | staff. |
| `line-auth` | `#e7e2e8` | border | login/privacy. |
| `text` | `#1d1f25` | text | Primary text (index/admin). |
| `text-staff` | `#141631` | text | staff text (also its toast bg). |
| `text-auth` | `#1b191d` | text | login/privacy text. |
| `text-prose` | `#2f2a33` | text | privacy body paragraphs/lists. |
| `muted` | `#8b909b` | muted | Secondary text, placeholders, inactive nav/tab. |
| `muted-staff` | `#8b8fa7` | muted | staff. |
| `muted-login` | `#7d7280` | muted | login. |
| `muted-privacy` | `#726a76` | muted | privacy. |
| `blue` | `#2f6bd6` | accent | Wordmark "AI", links, chevrons, secondary CTA (`.btn.b`). |
| `green` | `#2fb877` | success | Toggle ON, online status. |
| `green-staff` | `#12a150` | success | staff `--green`. |
| `green-dk` | `#0f7a52` | success | Success text on green tint (approved badge, done-step). |
| `red` | `#e2453f` | error | `--live`/`--red`; live dots, rejected, danger button. |
| `red-staff` | `#e5484d` | error | staff. |
| `red-login` | `#d63d38` | error | login `.err`. |
| `amber` | `#c8860a` | warning | Pending status text, VPN connecting. |
| `amber-staff` | `#c98a00` | warning | staff. |
| `amber-vpn` | `#c8901f` | warning | index VPN connecting label. |
| `indigo` | `#4a44b8` | accent | Partner badge / step / resource-tag text; staff `--blue`. |
| `orange-text` | `#b5700d` | warning | "New offer" badge text. |
| `icon-grey` | `#555555` | muted | Header hamburger icon (`.hbtn`). |

### 2.2 Literal (unnamed) colors used in CSS / inline styles

These have **no CSS variable** but recur across components. Names below are ours; hex values are exact.

| Token | Hex | Where it appears |
|---|---|---|
| `mag-tint` | `#faf2f6` | Magenta ~6% tint: avatars, icon chips (`.vlogo`, `.appc .lg`, `.acctav`, `.kpi .ic`), active tiles/rows `:active`, `.chip-admin`, `.rolec.on`, `.langopt.on`, progress-bar track `.bar`, privacy `.note`/lang-active. Most-used tint in the system. |
| `green-tint` | `#e3f6ee` | Success chip/badge bg: `.st.ap`, `.vchip`, `.vb.ap`, `.vicon.on`, `.stp.on`, staff `.btn.g`. |
| `indigo-tint` | `#eef0ff` | Partner/step chip bg: `.st.pt`, `.vb.pt`, `.rtag`, `.apx.on`, `.stp.cur`. |
| `amber-tint` | `#fdf3dc` | Pending chip bg (`.st.pend`); VPN connecting icon chip. |
| `orange-tint` | `#fff0e0` | "New offer" chip bg (`.st.nw`, `.vb.nw`). |
| `red-tint` | `#fdecea` | Rejected chip / danger button bg (`.st.rej`, staff `.btn.r`). |
| `toggle-off` | `#cfd3db` | Switch/toggle OFF track (`.tgl`, `.sw`). |
| `toggle-busy` | `#f2c14e` | Toggle busy track (`.tgl.busy`). |
| `toast-dark` | `#222222` | Toast bg (index & admin). staff toast bg = `#141631`. |
| `vpn-grad-a` | `#fbf1f7` | VPN bar gradient start (`.vpnbar`, → `#fff`). |
| `vicon-bg` | `#eceef2` | Inactive VPN icon chip bg (`.vicon`). |
| `border-green` | `#b7e6d3` | Active VPN card border (`.vpncard.act`). |
| `border-green2` | `#bfe9d5` | Completed stepper border (`.stp.on`). |
| `border-indigo` | `#cdd2ff` | Current stepper / active resource-pill border (`.stp.cur`, `.apx.on`). |
| `note-border` | `#f0d8e6` | privacy note-box border. |
| `code-bg` | `#f0eaf0` | privacy inline `code` bg. |
| `border-soft1` | `#edeff5` | index premium soft-card border. |
| `border-soft2` | `#eef0f6` | index premium topbar/nav border. |
| `f2f4f8` | `#f2f4f8` | `.langopt:active` bg (index). |
| **GDPR banner (index inline JS)** | | Dark consent banner injected at runtime: |
| `gdpr-bg` | `#1c1420` | Banner background. |
| `gdpr-text` | `#efe7ef` | Banner text. |
| `gdpr-border` | `#3a2c38` | Banner top border. |
| `gdpr-btn-border` | `#574a56` | "Essential only" button border. |
| `gdpr-link` | `#ff9ecb` | Privacy-policy link (pink on dark). |

---

## 3. Typography

**Font families (only two):**
- **System stack** — `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif` — everything except code. (staff.html omits Helvetica/Arial: `...,'Segoe UI',Roboto,sans-serif`.)
- **Monospace** — `ui-monospace,Menlo,monospace` (admin `.mono`) / `ui-monospace,monospace` (`.agrbody` in index/admin/staff).

Base body: index unspecified size (default 16 via components), admin `14px`, staff `15px/1.5`, login/privacy `15px`. Global smoothing on index body: `-webkit-font-smoothing:antialiased; font-weight:400; letter-spacing:.1px`.

**Weight ladder (as authored):** 400 body · 600 `b/strong`, labels, most emphasized UI (index "refined typography" block deliberately steps 800→600 for headings/buttons) · 700 semibold titles/pills/buttons in admin/staff · 800 brand wordmark, big headlines, KPI numbers, primary buttons in index.

### Type scale & where each style is used

| Style | Size (px) | Weight | Line-height | Letter-spacing | Used for |
|---|---|---|---|---|---|
| `displayBrand` | 30 | 800 | ~36 | 0 | Gate/splash wordmark `.gwm`. |
| `h1Legal` | 27 | 700 | 1.15 (~31) | -.01em (-0.27) | Privacy page title `h1`. |
| `kpiNumber` | 26 | 800 | — | 0 | Admin KPI number `.kpi .n` (staff = 22). |
| `h1` | 25 | 800 | — | 0 | Home greeting `.welcome h1`. |
| `wordmarkAuth` | 24 | 800 | — | 0 | Login wordmark `.wm`. |
| `h2Page` | 22 | 700 | — | 0 | Detail-page titles `.page h2` (staff h2 = 20). |
| `h2` | 20 | 800 | — | -.3px | Section headers `.h2`, `.promo .t`; admin `h2`=19; index polish → weight 600. |
| `title` | 19 | 800 | — | 0 | Top wordmark `.wm`, AI/promo card title `.aicard .t`. |
| `subtitleBar` | 18 | 800 | — | 0 | Admin wordmark, loyalty level `.loylv`, login logo mark. |
| `cardTitle` | 17 | 600 | — | 0 | Row card label `.rowcard .lft`. |
| `cardName` | 16 | 700 | — | 0 | Vendor/match names, `.search`, `.vtitle`, `.kcl`; `card h3`=15. |
| `body` | 15 | 400 | 1.5 (~22) | .1px | Default text, inputs, textareas, list rows. |
| `bodySm` | 14 | 400/600 | — | 0 | Links `.h2 a`, `.lnk` rows; admin base body. |
| `sub` | 13 | 400 | — | 0 | Muted subtitles `.sub`, `.gsub`, `.gtag`. |
| `chip` | 13 | 600 | — | 0 | Filter chips `.chip`, tabs `.tab` (13.5), lang buttons. |
| `label` | 12 | 600 | — | 0 | Form labels `label`, `.page label`. |
| `button` | 15 | 800 | — | .2px | index `.btn`; admin/staff `.btn` = 700 / 13.5–14. |
| `badge` | 11 | 700 | — | 0 | Status pills `.st`, `.vb`, `.pill`, `.kn`. |
| `overline` | 11 | 700 | — | .4px, UPPERCASE | `.loyhdr`, table `th`, `.fsec`. |
| `micro` | 10.5 | 600 | — | 0 | Bottom-nav labels `.nav div`, stepper captions, tiny meta. |
| `mono` | 12.5 | 400 | 1.5–1.55 | 0 | Agreement text `.agrbody`, admin `.mono`. |

Other discrete sizes present in source that fold into the above: 13.5, 12.5, 11.5, 10 (used for micro-meta, `.mt2` timestamps at 10.5, `.cbadge` at 10).

---

## 4. Spacing, radii, shadows, borders, motion

**Spacing (recurring px paddings/gaps):** 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 26. No formal 4- or 8-pt grid — values are hand-tuned; 8/10/11/12/14/16 dominate.

**Radii (px):** 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20; `20` doubles as the pill radius; `50%`/`9999` = full round (toggle knobs, avatars, FAB, `.fchk`). Cards cluster at 12–16; inputs 10–12; chips/badges 20 (pill).

**Shadows (box-shadow):**
| Token | Value |
|---|---|
| `soft` | `0 1px 2px rgba(24,26,48,.04), 0 8px 22px rgba(24,26,60,.055)` |
| `soft-h` (hover) | `0 4px 10px rgba(24,26,48,.07), 0 16px 34px rgba(24,26,64,.10)` |
| `glow` | `0 10px 26px rgba(166,0,99,.28)` |
| `glowStrong` | `0 14px 32px rgba(166,0,99,.34)` |
| `fab` | `0 8px 22px rgba(166,0,99,.42), 0 2px 6px rgba(166,0,99,.3)` |
| `focusRing` | `0 0 0 3px rgba(166,0,99,.12)` |
| `topbar` / `navbar` | `0 6px 18px rgba(24,26,55,.05)` / `0 -6px 18px …` |
| `acctpop` | `0 8px 24px rgba(20,22,50,.13)` |
| `kcard` | `0 1px 3px rgba(20,22,50,.05)` |
| `authCard` | `0 8px 30px rgba(90,20,60,.07)` |
| `gdprBanner` | `0 -6px 24px rgba(0,0,0,.28)` |
| (see `tokens.json` for the full 22 shadows) | |

Brand shadows are all magenta-tinted `rgba(166,0,99,…)`; neutral elevation uses cool blue-grey `rgba(24,26,…)` / `rgba(20,22,50,…)`.

**Borders:** default `1px solid var(--line)` (hairline) everywhere. `2px` used for: active tab underline (`.tab.on` `border-bottom:2px solid var(--mag)`), check rings (`.fchk` 2px), current stepper. Dashed 1px only on `.step` divider (admin). Focus = `border-color:var(--mag)` + focus ring.

**Motion / durations (transition & animation):** 120ms (`.btn` press), 150ms (nav/input color), 180ms (premium hover), **200ms (default — toggles, most transitions)**, 300ms (toast fade), 400ms (loyalty progress width). Easing: mostly `ease` / default; index polish uses `ease`.

**Opacity:** 0.6 disabled button, 0.7 `.mt2` timestamp, 0.9 `.promo .d`, 0.92 `.loypts`, 0.96 `.loynext`, 0.45 inactive lang link, 0 hidden toast.

**Icon sizes:** icons are inline SVG (`svg.i{width:1em;height:1em}`) sized by `font-size`. Recurring em→px: 13/15 (small inline), 18/20 (list/nav), 21–22 (card leading icons, `.nav`=21), 26 (FAB), 28 (quick-access tile `.qtile`). All icons: `viewBox 0 0 24 24`, `fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round` (admin `IC` set) — a consistent 1.7-weight outline icon style.

---

## 5. Component inventory

Every reusable UI component found in the CSS/markup. "Tokens" lists the design tokens each leans on.

### Buttons — `.btn` (+ variants `.sec .g .b .r .sm`, plus `.btn2`, `.pbtn`, `.kbtn`, `.acctbtn`, `.langbtn`)
- **Anatomy:** full-width (index: `height:46px`, `radius:13`) or inline (admin: `padding:10px 15px`, `radius:10`) flex row, centered, `gap 6–7`, optional leading SVG. Bold label.
- **Variants:** default = solid `mag` (index uses `linear-gradient(135deg,#c40073,#8a004f)` + `glow`); `.sec` = white/`card` bg + `line` border + `text` color; `.g` = green (admin `--green`; staff `green-tint`/`green-dk`); `.b` = blue; `.r` = red (admin `--red`; staff `red-tint`); `.sm` = compact (`padding 7px 11px`, 12.5px). `.btn2` = small magenta gradient pill (`radius 10`). `.pbtn` = borderless bottom-bar text button in `mag`.
- **States:** `:active` → `transform:scale(.98–.99)` (index gradient btn → `translateY(1px)` + reduced shadow); `[disabled]` → opacity .6 (login).
- **Tokens:** `mag`/gradient, `card`, `line`, `text`, radii 10–13, `button` type, `glow`/`btnActive` shadow, duration `fast`.

### Inputs / forms — `input[type=text|email|password]`, `textarea`, `select`, `label`, `label.chk`, `.pw`
- **Anatomy:** `1px solid var(--line)`, radius 10–12, padding 10–12, `font:inherit`, bg `card`. Label above: 12px/600 muted. `select` strips native chrome (`appearance:none`). `.pw` wraps password input with an absolute eye toggle. `label.chk` = inline checkbox row (`accent-color:var(--mag)`, 18px box).
- **States:** `:focus` → `outline:none; border-color:var(--mag)`; index adds `focusRing` (`0 0 0 3px rgba(166,0,99,.12)`) and a 150ms transition.
- **Tokens:** `line`, `card`, `text`, `muted`, radii 10–12, `body`/`label` type, `focusRing`, `mag`.

### Cards — `.card`, `.rowcard`, `.kpi`, `.appc`, `.kcard`, `.vcard`, `.lcard`, `.lmatch`, `.rec`, `.gcard`, `.doccard`, `.pcat`
- **Base card:** `bg card`, `1px solid line`, radius 12–16, padding 13–22, `margin-bottom` ~12–14. index premium adds `soft` shadow + hover `soft-h` + `translateY(-1px)`.
- **`.kpi`** (metric tile): radius 13, icon chip `.ic` (34px, `mag-tint` bg, `mag` icon, radius 9) + big number (`kpiNumber`) + muted label. Laid out in `.kpis` responsive grid `repeat(auto-fit,minmax(150px,1fr))` (staff 130px).
- **`.appc`** (application card): header row with 42px logo chip (`mag-tint`), name/meta, expandable `.det` detail block.
- **`.kcard`** (kanban card): white, radius 11, `kcard` shadow, id/client/responsible/last-msg + `.krow` footer; lives in `.kcol` columns (min 230px, `bg` fill) inside `.kanban` horizontal scroller with `.kn` count badge.
- **`.lmatch`** (live match card, index): min-width 258 horizontal-scroll card; league line with live dot, score in `green`, odds pill `.od`.
- **`.lcard` / `.qtile`** (grid tiles): 2-col / 4-col grids, leading `mag` icon, `:active` → `mag-tint`.
- **`.pcat`** (collapsible category, index): header `.hd` + hidden `.body`, chevron rotates 180° on `.open`.
- **`.gcard`** (gate/login card): max 360, radius 18, padding 22.
- **Tokens:** `card`, `line`, `mag`/`mag-tint`, `muted`, radii 11–18, `soft`/`soft-h`, `cardName`/`cardTitle` type.

### Chips / pills / badges — `.chip`, `.st` (`.pend .ap .pt .rej .nw`), `.vb` (`.ap .pt .nw .geo`), `.pill`, `.tag`, `.rtag`, `.apx`, `.vchip`, `.chip-admin`, `.kn`, `.cbadge`
- **`.chip`** (filter): pill (radius 20), `card` bg + `line` border, 13/600 muted; `.on` = `mag` fill (index: gradient) white text; horizontal-scroll `.chips` row.
- **`.st` / `.vb`** (status badge): tiny pill radius 20, 11/700, colored tint bg + dark text — `pend`=amber-tint/amber, `ap`=green-tint/green-dk, `pt`=indigo-tint/indigo, `rej`=red-tint/red, `nw`=orange-tint/orange-text, `geo`=`bg`/muted. Optional leading 13px icon.
- **`.pill` / `.tag`**: neutral outline pill/tag on `bg` fill (roles, path steps).
- **`.rtag` / `.apx`**: resource/pipeline tags — indigo-tint/indigo when active (`.apx.on` adds `border-indigo`).
- **`.vchip`**: green "connected" chip (green-tint bg, green text, radius 9).
- **`.cbadge`**: absolute count bubble, `mag` bg, white, min-16px, shadow.
- **Tokens:** tint colors, `badge`/`chip` type, radius 20 (pill) / 9, `mag`.

### Tabs — `.tabs` / `.tab` (admin), `.tabs button` (staff)
- **Anatomy:** horizontal-scroll bar on `card`, hidden scrollbar, sticky (`top:57px` admin). Each tab: padding 13×14, 13.5/700 muted, `border-bottom:2px solid transparent`, leading 17px icon.
- **States:** `.on` → `mag` text + `border-bottom-color:mag` (admin) / white bg + `line` border, top-rounded (staff).
- **Tokens:** `card`, `line`, `mag`, `muted`, `tabActive` border, `chip` type.

### Toggles / switches — `.tgl` (index), `.sw` (admin)
- **Anatomy:** track 52×30 (`.tgl`) / 44×26 (`.sw`), radius 20, knob `b` white circle radius 50% with `toggleKnob` shadow, 200ms slide.
- **States:** OFF = `toggle-off` `#cfd3db`; ON = `green` (knob slides right +22/+18px); `.busy` = `toggle-busy` `#f2c14e` (index only).
- **Tokens:** `toggle-off`, `green`, `toggle-busy`, `card`, `toggleKnob` shadow, duration `base`.

### Tables — `.mtab`, plain `table`/`th`/`td`, responsive `table.cardtab` (admin)
- **Anatomy:** full-width `border-collapse`, 12.5–13px, `th` muted 11px (uppercase for plain `table`), `td` padding 8–10 with `1px line` bottom border, last row borderless.
- **Responsive (`≤640px`, `.cardtab`):** each `<tr>` becomes a bordered card (radius 12, `card` bg); header row hidden; each `td` becomes a label/value flex row using `td::before{content:attr(data-label)}`; first cell is the card title (16px, 2px bottom border).
- **Tokens:** `line`, `muted`, `text`, `overline`/`sub` type, radius 12.

### List rows — `.fbar`, `.lnk`, `.jrow`, `.step`, `.flowrow`, `.krow`
- **`.fbar`** (stat/list row): flex row, label + optional `.bar` progress + trailing value/button; `margin-bottom 9`.
- **`.lnk`** (nav link row, index): space-between, `1px line` top divider, leading `mag` icon `.nm`, trailing blue chevron `.go`; `:active`→`mag-tint`; first child no top border.
- **`.jrow`** (journey row) & **`.step`** (dashed timeline): small 12.5px rows with muted timestamps; `.step` uses `border-bottom:1px dashed line` + green check icon.
- **`.flowrow`** (checklist row): 26px circular `.fchk` (2px `line` ring) + label; `.done` → check filled `green-dk`, label struck-through muted.
- **Tokens:** `line`, `mag`/`mag-tint`, `blue`, `green-dk`, `muted`, `bodySm` type.

### Progress / meters — `.bar`, `.kprog`, `.loybar`, `.stepper`/`.stp`, `.apipe`
- **`.bar` / `.kprog`**: thin track (5–9px) radius 4–20 on `mag-tint`/`line`/`bg`, inner `span` fill `mag`.
- **`.loybar`** (loyalty): 9px translucent white track on brand gradient, white fill, 400ms width transition.
- **`.stepper` / `.stp`**: horizontal step boxes (min 92px) on `bg`; `.on` = green-tint + `border-green2`, number badge `green-dk`; `.cur` = indigo-tint + `border-indigo`, badge `mag`.
- **`.apipe`**: inline pipeline of `.apx` pills joined by `i` separators.
- **Tokens:** `mag`, `mag-tint`, `bg`, `line`, tint/border colors, radii 4–20, duration `progress`.

### Toasts — `.toast`
- **Anatomy:** fixed, centered (`left:50%; translateX(-50%)`), bottom 20–90px, dark bg (`toast-dark` `#222`, staff `text-staff` `#141631`), white 13.5px, radius 11–12, `opacity 0`→`.show/.on`=1 over 300ms; `pointer-events:none`; auto-hides after ~2000–2200ms (JS).
- **Tokens:** `toast-dark`, radius 11–12, duration `toast`.

### Chat bubbles — `.cmsg` (index), `.msg` (admin/staff) + `.cimg`/`.chatimg`, `.chatbox`, `.cmgr`
- **Anatomy:** `.chatbox` scroll container (`bg` fill, `line` border, radius 11–12, column flex, gap 9). Bubbles max 78–80% width, padding 9×12, radius 13, 13.5–14px.
- **Variants:** incoming (`.b`/`.v`) = `card` bg + `line` border, left-aligned; outgoing (`.c`/`.s`) = `mag` bg, white, right-aligned. `.mt2` = 10.5px timestamp, opacity .7. Images `.cimg`/`.chatimg` capped ~210px, radius 10. `.cmgr` = manager header row with 42px avatar (`mag-tint`) + online dot (`green`).
- **Tokens:** `card`, `line`, `mag`, `bg`, radius 10–13, `body` type.

### Avatars & icon chips — `.acctav`, `.cmgr .av`, `.vlogo`, `.vicon`, `.loybadge`, `.appc .lg`, `.kpi .ic`, `.blogo`
- Rounded squares (radius 9–13) or circles (50%), `mag-tint` bg + `mag` icon/initial (or brand-gradient logo). Sizes 23 → 56px. `.vicon` toggles state colors: neutral `vicon-bg`, on `green-tint`/`green`, connecting amber-tint/`amber-vpn`. `.blogo` in index gets a subtle magenta shadow badge.

### Loyalty card — `.loycard` (+ `.loytop .loybadge .loylv .loypts .loyxp .loybar .loynext`, table `.loyhdr`/`.loyrow`)
- **Anatomy:** hero card, `linear-gradient(135deg,var(--mag),var(--mag-dk))`, white text, radius 16, `glow`-style shadow `0 8px 22px rgba(166,0,99,.28)`. Badge tile (translucent white .18), level title (`subtitleBar`), points, XP pill (translucent white .2), progress bar, next-tier row. Inner white `.btn` (magenta text). Tier table: `.loyhdr` overline header, `.loyrow` grid rows with `.on` highlight (`rgba(166,0,99,.09)`) and a magenta ● marker.
- **Tokens:** `mag`/`mag-dk` gradient, white alphas, radius 16, `overline`/`subtitleBar` type.

### Loaders / progress states
- No spinner component in CSS. "Loading/animation" is limited to width-transition progress bars (`.loybar`, `.bar`) and opacity/transform transitions. Online status shown via colored ● text + `green`.

### Bottom nav & bars — `.nav`, `.botbar`, `.topbar`, `.vpnbar`, `.top`, FAB `.fab`
- **`.nav`** (bottom tab bar, index): `card` bg, `1px line`/`border-soft2` top + `navbar` shadow, `space-around`, safe-area bottom padding; each item column icon(21px)+`micro` label, muted, `.on`→`mag`.
- **`.botbar`**: secondary bottom action bar (`pbtn` magenta text buttons), `card` bg, top border.
- **`.topbar` (index)** / **`.top` (admin/staff/privacy)**: sticky header on `card`/white, `1px line` bottom (index adds `topbar` shadow), holds wordmark + lang switch + account menu; safe-area top padding (index).
- **`.vpnbar`** (index): sticky sub-header, `linear-gradient(90deg,#fbf1f7,#fff)`, left status label (`mag` icon) + right status text `.vst2` colored by state (`.on` green, `.cn` `amber-vpn`, `.off` muted).
- **`.fab`**: fixed circular 54px action button, `mag` bg, white 26px icon, `fab` glow shadow, anchored to phone right edge; `right:max(16px,calc(50vw - 190px))`.
- **Tokens:** `card`, `line`/`border-soft2`, `mag`/`mag-tint`, `muted`, `green`, `vpn-grad-a`, `micro` type, `topbar`/`navbar`/`fab` shadows.

### Wordmark — `.wm` / `.gwm` / `.blogo`
- "**Bet**Construct**AI**": `.b` span = `mag`, plain "Construct" = `text`, `.a` span = `blue`. Sizes 17 (privacy) → 30 (gate). staff/login render `.blogo` as a magenta rounded-square badge with white "B".

### Account menu — `.acctwrap` / `.acctbtn` / `.acctpop` (admin)
- Trigger button (`card` bg, `line` border, radius 10, 23px `mag-tint` avatar). Popover `.acctpop` (radius 12, `acctpop` shadow, min 214px) toggled `.on`; header block + link rows (`:hover` `bg`), `.danger` link in `red`.

### Language switcher — `.langseg`/`.lg`, `.langdd`/`.langbtn`/`.langlist`/`.langopt` (index), `.langsw a` (admin), `.lang a` (login/privacy)
- Segmented (`langseg`: `card` bg, `line` border, radius 10; `.lg.active`→`mag` bg white) or dropdown (`langbtn` + absolute `langlist`, radius 12, elevated shadow, flag + label `langopt` rows, `.on`→`mag`/`mag-tint`). Plain-text RU/EN/HY links elsewhere (active = `mag` + `mag-tint`, or opacity 1 vs .45).

### Banners — `.banner` / `.banner.mag` (admin)
- Bordered strip (radius 12) with title/sub + trailing switch; `.mag` variant = full `mag` bg, white text.

### GDPR consent banner (index, injected via JS)
- Fixed bottom dark bar (`gdpr-bg` `#1c1420`, `gdpr-text`, `gdpr-border` top, `gdprBanner` shadow), text + pink policy link (`gdpr-link`), two buttons: "Essential only" (transparent, `gdpr-btn-border`) and "Accept" (`#A60063` solid). Safe-area bottom padding. The only dark-surfaced component in the app.

---

## 6. Quick guidance for the native rebuild
- Ship **one light theme**. Map `mag #A60063` = primary, `blue #2f6bd6` = secondary accent, `green #2fb877`/`#0f7a52` = success, `red #e2453f` = error, `amber #c8860a` = warning, `indigo #4a44b8` = partner/info.
- Normalize the per-file drift: pick canonical `--mag #A60063` (note staff's `#d6006c`), `--bg #f5f6fa`, `--line #eceef4`, `--text #1d1f25`, `--muted #8b909b`.
- Status system is a fixed 5-tint set: tint bg + darker text (green/indigo/amber/orange/red). Reuse `mag-tint #faf2f6` as the universal "brand-selected/hover" surface.
- Elevation: `soft`/`soft-h` neutral shadows for cards, magenta `glow` for brand CTAs. Corner radii cluster: inputs 10–12, cards 12–16, pills 20, circles full.
- Icons: 1.7-weight, round-cap, 24-grid outline SVGs sized 13–28px.
