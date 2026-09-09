# 06 · Integrations & Platform

Everything third‑party this demo touches, plus device/platform notes for the native rebuild. **No secrets are printed here** — key values are shown only as their env‑var names.

---

## 1. Third‑party services

| Service | Role in the app | How it's wired | State |
|---|---|---|---|
| **Supabase** (`smddtvaewmmpuyvtuscb.supabase.co`) | Primary backend: Postgres DB, REST (PostgREST), Storage bucket `uploads` | Browser uses **anon/publishable key** (in‑page); server functions use `SB_SERVICE_KEY` (service_role). `supabase-js` UMD from `cdn.jsdelivr.net/npm/@supabase/supabase-js`. | **Real, in use** |
| **Google Gemini** | AI advisor LLM | `api/advisor.js`, `GEMINI_API_KEY`, REST `generativelanguage.googleapis.com/v1beta`. Models tried: gemini‑3.5‑flash, 2.5‑flash‑lite, pro‑latest, flash‑lite‑latest. | **Coded, currently failing** (model/access) → client falls back to `aiLocal`. Provider undecided (Claude Haiku 4.5 rewrite exists out‑of‑repo). |
| **FingerprintJS v4** | Device fingerprint → stable `anonId` | `openfpcdn.io/fingerprintjs/v4` (CDN). | **Real, consent‑gated** (off until "Принять"). |
| **Resend** | Transactional email (notifications) | `api/notify.js`, `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_ADMIN`. | **Coded**; depends on key being set. |
| **Gmail API (Google OAuth)** | Two‑way email sync into CRM comms | `api/gmail-*.js`, `GOOGLE_CLIENT_ID/SECRET/REDIRECT`; inbound `api/email-inbound.js`; `api/comm-ingest.js` (`COMM_INGEST_SECRET`). | **Coded, NOT connected** — corporate Google blocks the OAuth app. |
| **Vercel** | Hosting + serverless functions (`api/*.js`) | ESM handlers, auto‑deploy from GitHub `mantarlyani/betconstructAI`. | **Real** (live site). |
| **GitHub** | Source + deploy trigger | Repo `mantarlyani/betconstructAI`; push → Vercel deploy. | **Real** (dev workflow). |

### CDNs loaded in the browser (must be replaced by native deps)
- `cdn.jsdelivr.net/npm/@supabase/supabase-js` — Supabase client.
- `openfpcdn.io/fingerprintjs/v4` — FingerprintJS.
- No CSS/icon/font CDNs — fonts are system, icons are inline SVG (see `assets/`).

### Environment variables (server) — names only, values are secret
`SB_URL`, `SB_ANON_KEY`, `SB_SERVICE_KEY`, `ADMIN_LOGINS`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_ADMIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT`, `COMM_INGEST_SECRET`.
> All real values must be provisioned fresh for mobile; never copy secrets from a running deployment into the repo. The anon key is embedded in the client HTML by design (it is a public key) — but the mobile app should still fetch config at runtime, not hardcode.

---

## 2. Device capabilities used

| Capability | Used? | Notes for mobile |
|---|---|---|
| **File upload** (chat attachments, documents) | ✅ | Chat + Documents upload to Storage `uploads`. Mobile needs image/file picker + camera. |
| **Camera / photo** | Indirect | Only via the file picker today; no direct camera API. |
| **Local storage / device id** | ✅ | FingerprintJS anon id + localStorage. Mobile: use a device‑stable id + secure storage; respect ATT/privacy. |
| **Geolocation** | ❌ (faked) | The "VPN bar" and IPs are **simulated**, not real geolocation/VPN. |
| **Push notifications** | ❌ | None — replaced by polling + in‑app toasts. **Add real push** (APNs/FCM) for chat + lead alerts. |
| **Biometric auth** | ❌ | None. Consider Face/Touch ID for the team login. |
| **Clipboard / share** | ❌ | Not used. |
| **Deep links** | ✅ (one) | `index.html?sign=<agreementId>` for agreement signing. Map to a mobile deep link / universal link. |
| **Realtime/websockets** | ❌ | Polling only (see `04`). |

---

## 3. Environments

- **Single environment** in practice: one Supabase project (`smddtvaewmmpuyvtuscb`) + one Vercel deployment. No separate staging/prod split is defined in the repo.
- **Hosts:** `betconstruct-ai.vercel.app` and the custom domain `betconstructai.com`.
- **Routing:** `vercel.json` rewrites `/login` → `/login.html`. Everything else is static file + `/api/*` functions.
- **Config:** secrets live in Vercel env vars (above). The client HTML embeds the Supabase URL + anon key inline.

> **Recommendation (OPEN_QUESTIONS):** define real **dev / staging / prod** Supabase projects and separate keys before building the native app.

---

## 4. Accessibility

Current state (web demo) — **minimal**; mobile should treat these as requirements, not the baseline:
- **Language:** RU (primary), EN, HY — switchable in‑app (`translateDOM()`), all LTR. Good multilingual base to carry over.
- **Contrast:** brand magenta on white and dark consent banner — verify WCAG AA on native.
- **Semantics:** icons are decorative inline SVG (`stroke="currentColor"`), mostly without text alternatives — **add labels / semantics** for screen readers.
- **Touch targets:** designed for ~390px width; verify 44×44pt minimums natively.
- **No** explicit ARIA roles, focus management, dynamic‑type scaling, or reduced‑motion handling in the web code — all to be built properly in Flutter (Semantics widgets, text scaling, high‑contrast).
- **Theme:** single **light** theme only (no dark mode / `prefers-color-scheme`). Add a dark theme for mobile if desired (tokens in `design/tokens.json`).

---

## 5. Platform notes for the native rebuild

- **Auth:** replace storage‑flag sessions with real auth (Supabase Auth / OAuth) + server‑enforced RLS; never ship service_role to the client.
- **Realtime:** Supabase Realtime channels or push instead of 3.5 s polling.
- **LLM:** finalize the advisor provider (Gemini vs Claude Haiku 4.5) and keep the `{prompt, context, lang} → {text}` contract behind your own proxy so the key stays server‑side.
- **Payments:** none exist; if real payments are ever added, App Store / Play gambling & payment policies apply — but today this is a **B2B catalog/CRM**, not a real‑money app.
- **Email/Gmail:** the two‑way email feature is unfinished; decide whether mobile needs it at all for v1.
