# BetConstructAI — Logo (text wordmark)

## There is NO logo image file

The brand logo is **not** an SVG, PNG, or any binary asset anywhere in the
project. It is a **pure HTML/CSS text wordmark** rendered inline. To reproduce it
on mobile, recreate the styled text — do not go looking for a logo file, there
isn't one.

## Exact markup (from index.html, admin.html, staff.html, login.html)

```html
<span class="wm"><span class="b">Bet</span>Construct<span class="a">AI</span></span>
```

The wordmark reads **BetConstructAI** as one word, split into three color
segments:

| segment    | text        | color        | CSS var   |
|------------|-------------|--------------|-----------|
| `.b`       | `Bet`       | magenta `#A60063` | `--mag` |
| (default)  | `Construct` | ink / near-black `#141631` (light theme text color) | `--text` |
| `.a`       | `AI`        | blue `#2f6bd6`    | `--blue` |

## CSS

```css
.wm{
  font-size:19px;             /* header size; scales per context */
  font-weight:800;            /* extra-bold */
  white-space:nowrap;
  display:flex; align-items:center; gap:8px;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.wm .b{color:var(--mag);}   /* #A60063 magenta */
.wm .a{color:var(--blue);}  /* #2f6bd6 blue   */
/* "Construct" inherits the base text color (ink, #141631 light) */
```

A larger variant `.gwm` (the login / greeting screen) is identical but
`font-size:30px`, same `font-weight:800` and the same `.b` / `.a` colors.

## Typography

- **Font family:** the system stack —
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  (San Francisco on iOS, Roboto on Android). No custom/branded font is used.
- **Weight:** `800` (extra-bold). On iOS map to `.heavy`/`.bold`; on Android use
  a heavy weight of the system font.
- **Case:** as written — `BetConstructAI` (camel-case, no spaces).
- **Letter-spacing:** default (none set).

## Brand colors (light theme values)

| role   | hex       |
|--------|-----------|
| magenta (`--mag`) | `#A60063` |
| blue (`--blue`)   | `#2f6bd6` |
| ink / text (`--text`) | `#141631` |

Note: the dark-theme / alternate palettes in the CSS use slightly brighter
variants (`--mag:#d6006c`, `--blue:#4a44b8`) for contrast on dark backgrounds.
Use `#A60063` / `#2f6bd6` as the canonical light-mode brand colors.

## Recreation asset

`betconstructai-wordmark.svg` in this folder is a **hand-authored SVG
recreation** of the wordmark using `<text>` elements with the correct colors and
weight. It is **not** an official/original asset (none exists) — it is a
convenience mock so the mobile team has something to preview. The
authoritative way to render the logo is the styled text above.
