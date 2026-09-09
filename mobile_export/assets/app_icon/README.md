# App Icon / Favicon

## No source app icon exists

A full scan of every HTML page (`index.html`, `admin.html`, `staff.html`,
`login.html`, `privacy.html`, `betconstruct-app.html`,
`betconstruct-lead-flow.html`) found:

- **No `<link rel="icon">`** of any kind
- **No `<link rel="apple-touch-icon">`**
- **No favicon file** (`.ico`, `.png`, `.svg`) anywhere in the project
- **No manifest** (`manifest.json` / `site.webmanifest`) declaring app icons

The web app ships with **no favicon and no app icon**. (Published preview
artifacts of this project used emoji favicons supplied by the hosting layer, but
those are not part of the app source and are not real icon files.)

## Recommendation for the mobile team

Create a proper app icon from scratch. Suggested starting point that matches the
brand:

- **1024×1024** master icon (iOS App Store / Android Play requirement).
- A bold **"B"** mark in brand **magenta `#A60063`**, on a white or
  ink (`#141631`) ground — echoing the `.b` (magenta "Bet") segment of the
  wordmark.
- Alternatively a two-color treatment picking up the magenta `#A60063` +
  blue `#2f6bd6` brand pair.
- Weight/feel: extra-bold (matches the 800-weight wordmark).
- Export the platform icon sets (iOS AppIcon set + Android adaptive
  foreground/background) from that 1024² master.

No existing raster to upscale — this must be designed new.
