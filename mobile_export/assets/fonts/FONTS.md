# Fonts

## Summary: all system fonts — nothing to bundle

Every page uses the platform **system font stack**. There are **no bundled font
files**, **no `@font-face` declarations**, and **no Google Fonts / external font
links** anywhere in the project. A scan for `fonts.googleapis.com`,
`fonts.gstatic.com`, and `@font-face` across all HTML returned **zero matches**.

**Do not download or bundle any font.** On mobile, use the OS system font
(San Francisco on iOS, Roboto on Android) and a system monospace.

## Font families used

### Primary UI / body / wordmark — system sans-serif

```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

- Resolves to: **San Francisco** (iOS/macOS), **Roboto** (Android), Segoe UI
  (Windows).
- Applied at the `body` level and inherited via `font-family:inherit` on inputs,
  textareas, and selects.
- License: system fonts — provided by the OS, no license to ship.

### Monospace — for code / IDs / technical values

```
ui-monospace, Menlo, monospace
```
(and a shorter `ui-monospace, monospace` variant)

- Resolves to: **SF Mono / Menlo** (iOS/macOS), the platform monospace on Android.
- License: system fonts — provided by the OS.

## Weights in use

| weight | usage |
|--------|-------|
| 400 (normal) | body text, default |
| 500–600 | secondary emphasis, labels, buttons (various UI elements) |
| 800 (extra-bold) | the **BetConstructAI wordmark** (`.wm` / `.gwm`) |

Map on mobile: iOS `UIFont` system weights (`.regular`, `.semibold`, `.heavy`);
Android Roboto `normal` / `medium` / `black`.

## Per-page confirmation

| page | sans stack | mono stack | google fonts / @font-face |
|------|-----------|-----------|---------------------------|
| index.html | system stack ✓ | `ui-monospace,Menlo,monospace` ✓ | none |
| admin.html | system stack ✓ | `ui-monospace,monospace` ✓ | none |
| staff.html | system stack ✓ | — | none |
| login.html | system stack ✓ | — | none |
| privacy.html | system stack ✓ | — | none |

## Bottom line

Nothing to license, nothing to embed. Use the native system font on each
platform and match the weights above.
