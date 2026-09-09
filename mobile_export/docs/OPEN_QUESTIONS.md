# OPEN QUESTIONS & ASSUMPTIONS

Everything unclear, missing, or assumed while exporting. Items marked **(ASSUMPTION)** are our best reading of the code, to confirm. Nothing here is invented product scope — these are gaps in the source. Grouped by area.

---

## A. Product scope & roles
1. **Partner role removed — confirm intent.** `partner.html` and partner login were deleted on the owner's instruction; `applications` still carry `portal_pass` / `portal_active` fields and the CRM text still says "партнёр". **Q:** Is the partner concept gone entirely, or does a partner still exist as a CRM entity without a login? **(ASSUMPTION:** partners exist as deal/account entities but have no self‑service cabinet.)
2. **Guest vs real account.** The client app has no real user accounts — only a name+contact "guest". **Q:** Does mobile v1 want real end‑user accounts, or keep the frictionless guest model?
3. **Which areas are v1 vs later?** Priorities in `02_AREAS_AND_RESPONSIBILITIES.md` (MUST/NICE/DEMO) are **our** proposal. **Q:** Confirm the mobile v1 cut.

## B. Authentication & security
4. **Admin login gap.** Unified `/login` only authenticates admins from env `ADMIN_LOGINS` or a `staff` row with role Админ. The hardcoded client‑side admins (`admin.html`) are being retired. **Q:** Is `ADMIN_LOGINS` set in prod, and who are the canonical admins? (Setting it was in progress when export began.)
5. **Email spelling.** Code hardcodes an admin email domain `sofconstruct.com` (no "t") while the owner types `softconstruct`. **Q:** Which is correct?
6. **Sessions never expire**, no JWT/refresh, no CSRF, authorization is client‑side only. **(ASSUMPTION:** mobile will introduce real auth + server‑enforced RLS.) **Q:** confirm approach.
7. **`_diag` debug mode** in `api/login.js` (returns admin‑login counts/emails) is uncommitted/undeployed and must **not** ship. **Q:** OK to remove before mobile? (It is a disclosure risk.)
8. **No input validation** (email/phone/password strength/length) anywhere. **Q:** Confirm the validation rules mobile should enforce.

## C. AI advisor
9. **Provider undecided.** Repo targets **Google Gemini** (currently failing — model deprecated / project access denied). A **Claude Haiku 4.5** rewrite exists **out‑of‑repo** and is not deployed. **Q:** Which provider is canonical for mobile? The `{prompt, context, lang} → {text}` contract and the verbatim system prompt (see `04`) are assumed stable.
10. **Local fallback (`aiLocal`)** returns a canned answer when the endpoint fails. **Q:** Keep an offline fallback on mobile, or always require the live LLM?
11. **Grounding data (`buildKB`)** is assembled from static catalog + live vendors + partners. **Q:** Should the mobile app rebuild this KB client‑side, or should the server own it?

## D. Data & content
12. **Two schema generations coexist** (see `05_DATA_AND_API.md`): a strict‑RLS `database.sql` (uuid deals) vs the prototype the live app actually uses (text‑PK deals like `BC‑1042`, open RLS). **Q:** Which is the source of truth for the mobile data model? **(ASSUMPTION:** the prototype/live schema is authoritative for behaviour; `database.sql` shows intended RLS.)
13. **Demo/test rows in the DB** (e.g. "Test", "Test for Hayk", `BC‑1042`, "Dmer", "NovaSpin/PayStrike/TrafficLab/SoftGaming" seed vendors). A cleanup ("покажи список" → delete) was pending and not completed. **Q:** Confirm which rows are real vs seed before migrating data.
14. **Catalog is static in code** (solutions/platforms/products/packs/regions/licenses/payments/prices). **Q:** Should this move into the DB (CMS) for mobile, or stay hardcoded? Prices like `€19 900` — still current?
15. **Loyalty tiers** (VIP tables) are cosmetic with no engine. **Q:** Is loyalty in scope for mobile at all?
16. **`match_score`** is a fixed 65/80 by badge, not a real relevance calc. **Q:** Should mobile compute a real score, or drop the number?

## E. Realtime, notifications, integrations
17. **Polling → push.** Chat/presence are polled (3.5s/6s/20s/45s). **Q:** Confirm APNs/FCM push for chat + lead alerts in mobile.
18. **Gmail two‑way email is coded but not connected** (corporate Google blocks the OAuth app). **Q:** Is email‑into‑CRM in scope for mobile v1, or drop it?
19. **Resend email** depends on `RESEND_API_KEY` being set. **Q:** Is transactional email live?
20. **VPN bar** is a **simulated** cosmetic feature (fake servers/IPs). **(ASSUMPTION:** not a real requirement.) **Q:** Drop it on mobile?

## F. Platform, design, a11y
21. **No app icon / favicon exists** in the repo (see `assets/app_icon/`). **Q:** Provide brand app‑icon artwork (the wordmark is CSS text, recreated as SVG in `assets/logo/`).
22. **Single light theme only** — no dark mode. **Q:** Does mobile want a dark theme? (Tokens are ready in `design/tokens.json`.)
23. **Fonts are system fonts** (no bundled brand font). **Q:** Is a custom typeface wanted, or keep system (SF Pro / Roboto)?
24. **Accessibility** is minimal in the web demo (no ARIA/focus/dynamic‑type). **Q:** Confirm a11y targets (WCAG AA, VoiceOver/TalkBack, dynamic type).
25. **Environments** — one Supabase project, no staging/prod split. **Q:** Provision separate dev/staging/prod for mobile?

## G. Miscellaneous / to verify
26. **Exact copy for un‑captured screens.** Inner client screens (catalog, marketplace, advisor, register, chat, cart) and 10 admin tabs have **no URL** and weren't individually screenshotted. Their strings come from the code (`strings/`) — **verify against a live walkthrough**.
27. **Agreement signing deep link** (`?sign=<id>`) — is this flow still needed now that partners are removed? **Q:** Who signs agreements on mobile?
28. **Analytics** is a home‑grown `events` table, no GA/Amplitude. **Q:** Does mobile want a real analytics SDK, and which events matter?
