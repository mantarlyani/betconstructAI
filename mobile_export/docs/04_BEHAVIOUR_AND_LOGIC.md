# 04 · Behaviour & Logic

All values below are copied from the code (`index.html`, `admin.html`, `staff.html`, `api/*.js`). Error text is **verbatim** (Russian, as shipped). Where behaviour is unclear it is flagged and also listed in `OPEN_QUESTIONS.md`.

---

## 1. Validation (with exact error text)

Validation is minimal and **client‑side only** (toasts). No length/format/regex checks beyond "not empty". Email is typed `<input type=email>` but **not regex‑validated** before submit.

### Guest entry (`entry`)
- Name is required to proceed. Sub‑label: **"Укажите имя и контакт, чтобы продолжить"**. (Contact optional in practice.)

### Registration — Affiliate form (`submitAf`)
| Field | Rule | Exact toast on failure |
|---|---|---|
| Company/team | not empty (`.trim()`) | **"Укажите компанию/команду"** |
| Email | not empty (`.trim()`) | **"Укажите email"** |

### Registration — Buyer/partner form (`submitReg` / `submit…`)
| Field | Rule | Exact toast |
|---|---|---|
| Company | not empty | **"Укажите компанию"** |
| Email | not empty | (email required; same pattern) |

On DB error: **"Ошибка сохранения: " + error.message**.

### Demo / cart requests
- Demo with no selection → toast **"•"** (placeholder). On success → **"Запрос демо отправлен"**.
- Cart empty → toast **"•"**. Adding a duplicate → **"Уже в корзине"**. Add success → **"Добавлено в корзину интересов"**. Submit → **"Запрос отправлен менеджеру"**.

### Chat
- Storage unavailable → `alert("Хранилище недоступно")`. Upload error → `alert("Ошибка загрузки: " + message)`.

### Login (`/login`, `login.html`)
- Wrong credentials → **"Неверный логин или пароль"** (from `{ok:false}`).
- Network/other → generic network error message.
- Server requires both fields: `400 {error:'login and pass required'}`.

> **Gap (see OPEN_QUESTIONS):** no email‑format, password‑strength, phone‑format, or field‑length validation anywhere. The mobile app should add real validation.

---

## 2. Calculations, formatting, defaults

- **Vendor `match_score`** (relevance %) is assigned on publish, **not computed**:
  `match_score = (badge === 'new') ? 65 : 80` (`admin.html:430`).
- **Toast duration:** 2000 ms (`index.html`), then auto‑hide.
- **VPN connect delay:** 1000 ms simulated; IP is `randIP()` (fake).
- **Dates** are formatted by string slicing, not a locale library:
  `(iso).slice(0,16).replace('T',' ')` → `"2026-09-09 13:50"`. Signed/paid timestamps use the same.
- **Short visitor code:** `shortCode(id)` — a truncated id used as "Гость <code>" when no name.
- **Prices** are literal catalog strings (e.g. `€19 900`, `EPC €0.42`, `RTP 97%`) — never computed.
- **Loyalty tiers** (`index.html` `LOY`) are static tables, e.g. `MASTER` = VIP 13–18 with levels `[level, points, reward]` like `[1,10000,1000] … [6,100000,10000]`; `LEGEND` VIP 19–24; `GOD` VIP 25–30 up to `[6,10000000,100000]`. **Cosmetic** — no real points engine.
- **Currency/number style:** thin‑space thousands in catalog text (`19 900`); no runtime number formatting.

---

## 3. Sorting, filtering, pagination

- **Deals** load ordered by `created_at` **ascending** (`.order('created_at',{ascending:true})`).
- **Marketplace** filters by category **chip** (client‑side `filter`); "Все" = no filter. No search‑as‑you‑type on vendors beyond the home search.
- **"Кто на сайте"** shows `liveVisitors()` **sliced to first 10**; "live" = active in the last **5 minutes**.
- **No pagination** anywhere — all lists render in full (fine for demo volumes; mobile must add paging).
- Applications dashboard counts: pending = `status==='pending'`; "Одобрено вендоров" = `status==='approved' || 'partner'`.

---

## 4. Roles & permissions

| Capability | Guest | Staff | Admin |
|---|---|---|---|
| Browse catalog / marketplace / advisor | ✅ | ✅ | ✅ |
| Submit application / demo / cart / chat | ✅ | ✅ | ✅ |
| See own leads/deals/agreements/tasks/chats | — | ✅ (own only) | ✅ (all) |
| Moderate applications, publish vendors | — | — | ✅ |
| Manage team (create staff, reset pass, toggle access) | — | — | ✅ |
| Accounts registry, content, full analytics | — | — | ✅ |
| Open another staff's cabinet | — | — | ✅ |

- **Admin identity** = env `ADMIN_LOGINS` (`email:pass,…`) **or** a `staff` row whose `role` matches `/^(админ|admin)$/i` and `active !== false`.
- **Staff identity** = a `staff` row with matching `login`, `active === true`, and matching `pass`.
- Staff cabinet scopes every list to the logged‑in staff object `S`. There is **no server‑enforced row‑level authorization** — scoping is client‑side. (See OPEN_QUESTIONS: real per‑user authz needed.)

---

## 5. State machines (as tables)

### 5a. Application status (`applications.status`)
| State | Meaning | Transitions (admin action) |
|---|---|---|
| `pending` | На проверке (new submission) | → `approved`, `partner`, (`new`), `rejected` |
| `approved` | "Approved by BetConstruct" | → back to `pending` ("Вернуть на проверку") |
| `partner` | "Partner by BetConstruct" (★) | → back to `pending` |
| `new` | New badge variant | (publishes vendor with match_score 65) |
| `rejected` | Отклонено | → `pending` |

Publishing a vendor happens when status ∈ {`approved`,`partner`,`new`} → inserts a `vendors` row (`badge=status`, `active:true`, `match_score = new?65:80`).

### 5b. CRM deal — **6 stages** (`STAGES`, Zoho‑like)
| # | key | Name | Sub |
|---|---|---|---|
| 1 | `lead` | Lead Email | Проверить email, завести лид |
| 2 | `deal` | Convert to Deal | Подтверждена возможность |
| 3 | `confirmed` | Project Confirmed | Согласован scope с партнёром |
| 4 | `agreement` | Agreement & Payment | DocuSign + setup fee |
| 5 | `started` | Project Started | PM: активная разработка |
| 6 | `won` | Closed Won | Проект Live |

Move with ◀ ▶ (`moveStage(id, ±1)`); last stage shows a **"Live"** chip. `status` is `active` by default.

### 5c. CRM deal — **7‑step operational flow** (`FLOW`, boolean array `flow[0..6]`)
| # | Step | Detail | Role |
|---|---|---|---|
| 1 | Lead check | Проверить email в системе; если нет — завести лид | Sales |
| 2 | Agreement & Fee | Договор (DocuSign) → подпись партнёра → setup fee оплачен | Sales |
| 3 | Resource request | Запрос PM и Service Sales (во время шага 2) | Service Sales |
| 4 | Kickoff chat | Групповой канал PM + Партнёр | PM |
| 5 | Development | Разработка и настройка (~3–4 недели) | PM |
| 6 | Go Live notice | Проект запущен; официальный email‑уведомление | PM |
| 7 | AM Handover | Передача проекта Account Manager | Account Manager |

**Side effects when a step is toggled** (`toggleFlow`):
- Toggling **step 3** (`Resource request`) the first time → sets `rr_done`, auto‑creates PM/Service‑Sales **tasks** (`addResourceRequest`).
- Toggling **step 4** (`Kickoff chat`) the first time → sets `kick_done`, auto‑creates a **kickoff thread** (`createKickoff`) with a system message.
- Each toggle appends to `deal.steps` a log entry `{n:'✓/✗ <step>', by:<actor>, at:<now>}`.

### 5d. Agreement status (`AGR_STATUS`)
| key | Label | style |
|---|---|---|
| `draft` | Черновик | pend |
| `sent` | Отправлено | nw |
| `signed` | Подписано | pt |
| `completed` | Завершено | ap |

Actions: "Отметить подписано" → `status:'signed'` + `signed_at` → reflects `agr.signed=true` on the linked deal. Paid → `paid_at`.

### 5e. Vendor badge (`vendors.badge`) → visual chip
| badge | Chip text |
|---|---|
| `pending` | ⏱ На проверке |
| `approved` | ✓ Approved by BetConstruct |
| `partner` | ★ Partner by BetConstruct |
| `new` | New |

---

## 6. Auth & session

- **No identity provider / JWT.** Login is verified server‑side by `POST /api/login` using Supabase **service_role** (never exposed to the browser). Passwords are additionally **column‑REVOKE'd** from `anon`/`authenticated`.
- **Session = a browser storage flag**, no expiry, no refresh token:
  - Admin: `sessionStorage.bc_admin` (set after `dest:'admin'`).
  - Staff: `sessionStorage.bc_staff` = JSON profile (after `dest:'staff'`).
  - Guest: `localStorage.bc_guest` (name/contact) + `window.USER`.
- **Logout** clears the flag ("Выйти" / "Сменить аккаунт"). No server‑side session invalidation exists.
- **Device id:** FingerprintJS v4 → stable `anonId` in `localStorage.bc_anon`, used as chat `guest_key` and analytics key. Only set **after consent**.

> **Security note (OPEN_QUESTIONS):** sessions never expire, there is no CSRF/refresh model, and authorization is client‑side. Mobile v1 should use a real auth (e.g. Supabase Auth / OAuth) with server‑enforced RLS.

---

## 7. Realtime (all polling — no websockets)

| What | Interval | Where |
|---|---|---|
| Visitor chat messages | **3500 ms** | `index.html:811` (`loadVisitorMsgs`) |
| Background chat watcher (toast when manager replies while chat closed) | **6000 ms** | `index.html:322` (`bgChatWatch`) |
| Heartbeat ping (analytics presence) | **45000 ms** | `index.html:313` (`track('ping','beat')`, only when tab visible) |
| Admin/staff chat & presence | ~3.5 s / ~20 s | admin.html/staff.html ("Обновление вживую ~3.5с") |

Background toast text: **"💬 Менеджер написал вам — откройте «Чат»"**.

> Mobile should replace polling with **push notifications** + realtime subscriptions.

---

## 8. AI / LLM prompt (VERBATIM)

**Endpoint:** `POST /api/advisor`, body `{ prompt, context, lang }` → `{ text, model }`.
**Provider in the repo:** Google Gemini. Model list tried in order: `gemini-3.5-flash`, `gemini-2.5-flash-lite`, `gemini-pro-latest`, `gemini-flash-lite-latest`. `generationConfig.temperature = 0.4`. On total failure it returns `{text:'Не удалось получить ответ.', errors, availableModels}` and the client falls back to `aiLocal`.

**System prompt (exact, `api/advisor.js`):**

```
Ты — AI-советник платформы BetConstructAI (B2B iGaming-маркетплейс вокруг экосистемы BetConstruct).

СТРОГОЕ ПРАВИЛО: отвечай ТОЛЬКО на основе данных платформы ниже (раздел «ДАННЫЕ ПЛАТФОРМЫ»).
Это три источника: (1) что такое BetConstruct — решения, платформы, продукты, цены, регионы, лицензии, платежи;
(2) MARKETPLACE — продукты вендоров; (3) ПАРТНЁРЫ — производители.
Не выдумывай продукты, цены, компании или лицензии, которых нет в данных. Если чего-то нет — честно скажи,
что этого пока нет в каталоге, и предложи связаться с менеджером.

Задача: по запросу клиента (гео, вертикаль, крипто/фиат, тип игр, бюджет) собери готовую конфигурацию:
— рекомендованный регион/юрисдикция и лицензия (из данных);
— продукт/пакет BetConstruct с ценой (из данных);
— конкретные продукты вендоров из MARKETPLACE (по именам) под задачу;
— подходящих партнёров-производителей по именам;
— платежи (крипто/фиат) из данных.
Ссылайся на конкретные названия из данных. Отвечай кратко и структурировано на языке: ${langName}.
В конце добавь: «Предварительная рекомендация, не юридическая консультация — финал с менеджером.»

===== ДАННЫЕ ПЛАТФОРМЫ =====
${context || '(данные не переданы)'}
===== КОНЕЦ ДАННЫХ =====
```

- `langName` = `English` if `lang==='en'`, `Armenian (Հայերեն)` if `lang==='hy'`, else `Russian`.
- `context` is built client‑side by `buildKB()` = BetConstruct catalog + marketplace vendors + partners, passed as a big text block.
- The user's free text is the `contents` message.
- Required disclaimer appended by the model: **"Предварительная рекомендация, не юридическая консультация — финал с менеджером."**

> A rewrite targeting **Anthropic Claude Haiku 4.5** was authored out‑of‑repo (same `{prompt,context,lang}→{text}` contract) but is **not in this repo and not deployed**. Provider is undecided — see `01_APP_OVERVIEW.md` and OPEN_QUESTIONS.

The in‑app manager chat opener is a **mock** greeting persona: **"Ани · на связи"** / "Здравствуйте! Напишите ваш вопрос — менеджер ответит здесь."

---

## 9. Persistence (what is stored where)

**Browser (per device):**
- `localStorage.bc_anon` — FingerprintJS anon id (consent‑gated).
- `localStorage.bc_guest` — guest name/contact.
- `localStorage` cart — interest cart items `{name, cat, price}`.
- `localStorage` consent flag — GDPR acceptance.
- `sessionStorage.bc_admin` / `sessionStorage.bc_staff` — team session.

**Supabase (server):** all domain data — see `05_DATA_AND_API.md`. Files → Storage bucket `uploads`.

---

## 10. Analytics events (`track(type, action, meta)` → `events`)

Event `type` values in use: **`page`, `click`, `cart`, `lead`, `ai`, `search`, `entry`, `ping`**.
- Fired only **after consent**. `ping` heartbeat every 45 s when the tab is visible.
- Admin **Аналитика** aggregates: marketplace funnel (показ→клик→лид), visitor paths (merged by contact/device code), shift ranking.

> No third‑party analytics SDK (GA/Amplitude) — analytics is home‑grown in the `events` table. FingerprintJS is the only external tracker, and it is consent‑gated.
