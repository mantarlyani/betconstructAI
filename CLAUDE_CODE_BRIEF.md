# BetConstructAI — вводный контекст для Claude Code

Вставь этот файл первым сообщением в Claude Code (или положи в корень репозитория как `CLAUDE.md`).
Сначала прочитай ключевые файлы (`index.html`, `admin.html`, `staff.html`, `partner.html`, `api/*`),
потом приступай к задаче.

---

## 1. Что это за проект
**BetConstructAI** — B2B iGaming-маркетплейс + клиентское приложение с AI-советником + полноценная
CRM/админка. Стратегическая цель: **заменить 5 инструментов одной платформой**:
- Hoory (лайв-чат) → встроенный чат с посетителями
- Pandayo (внутренние коммуникации) → внутренние каналы
- Zoho CRM (воронка продаж) → CRM (6 стадий + 7-шаговый операционный флоу)
- Jira (задачи) → модуль задач/запросов ресурсов
- DocuSign (соглашения) → модуль соглашений с подписанием партнёром

Прототип рабочий, задеплоен, но это **MVP, не production** (см. раздел 8).

## 2. Живые адреса, репозиторий, хостинг
- Сайт: **https://betconstructai.com** (делает 301/308 редирект на **https://www.betconstructai.com** — тестировать надо www).
- Хостинг: **Vercel**, проект `betconstruct-ai` (team `bet-construct-ai-marketplace`).
- Репозиторий: **GitHub `mantarlyani/betconstructAI`**, ветка `main`, публичный.
- **Деплой = загрузка файлов в GitHub** (владелец пушит через web-UI «Add files via upload»), Vercel авто-деплоит. Локально репозиторий владельца — папка проекта; в ней нет `.git` (файлы копируются вручную).

## 3. Технологический стек
- **Фронтенд**: single-file HTML SPA (без сборки). Каждый экран — свой `.html` со встроенными `<style>` и `<script>`. Роутинг: функции `render()` / `go(page)` / `renderTabs()`, i18n-словарь.
- **Бэкенд**: Vercel serverless functions в `api/*.js` (ESM `export default handler`, обычный `fetch` к Supabase REST / Google API). Предупреждение сборки «ESM→CommonJS» — безвредно.
- **База/Auth**: **Supabase** (project_ref `smddtvaewmmpuyvtuscb`, URL `https://smddtvaewmmpuyvtuscb.supabase.co`).
  - Фронтенд использует **publishable/anon** ключ: `sb_publishable_oPGh3c7PEFreALuOkY6wOA_WovnaNpL`.
  - Серверные функции используют **service_role** ключ из env `SB_SERVICE_KEY` (секрет, НЕ в коде).
  - RLS-политики сейчас открыты (`using(true)`) — осознанный компромисс прототипа.
- **Реалтайм**: не используется — везде **polling** (~3.5с в чате, ~20с в панелях присутствия).
- **Идентификация устройства**: FingerprintJS v4 (CDN `openfpcdn.io/fingerprintjs/v4`) → стабильный `anonId` в localStorage (`bc_anon`), он же `guest_key` чата посетителя и ключ событий (`events.visitor_anon`).

## 4. Файлы
- `index.html` — клиентское приложение: главная, Products/каталог, Marketplace, Live, AI-советник, регистрация (партнёр/аффилейт/байер), корзина интересов, VPN-симуляция (бар под баннером), чат посетителя с менеджером, гостевой вход (имя+контакт). Трекинг событий + heartbeat + фоновое уведомление о сообщении менеджера.
- `admin.html` — админка. Вход: список вшитых админов `ADMINS` (`mantarlyan.ilya@sofconstruct.com` / `Crypto123!`; `mantarlyan@me.com` / `Crypto123!`) **и** сотрудники с ролью «Админ» по логину/паролю. Разделы (TABS): Дашборд, Заявки, Сотрудники, Аккаунты, CRM, Соглашения, Задачи, Чат, Документы, Аналитика, Контент. i18n RU/EN/HY через `admin_i18n.js` (`window.I18N`) + `translateDOM()` (переключатель в шапке). Флаг `KEEP_SCROLL` — не прыгать наверх при смене стадий/статусов в CRM.
- `staff.html` — кабинет сотрудника: Обзор, Онлайн (кто на сайте + чат), Мои лиды, Мои клиенты, Мой CRM, Соглашения, Задачи, Документы, Смена, Чаты, Аналитика, Профиль.
- `partner.html` — кабинет партнёра: вход по **email или телефону из заявки + пароль**, доступ после одобрения (`portal_active`, `portal_pass`). Ссылка «Забыли логин/пароль?» ставит `portal_reset_requested`.
- `admin_i18n.js` — словарь переводов (`window.I18N = { "RU строка": {en, hy} }`, ~474 ключа). **Нужен для работы переключателя языка в админке.**
- `api/gmail-auth-start.js`, `api/gmail-auth-callback.js`, `api/gmail-sync.js`, `api/gmail-send.js` — двусторонняя почта сотрудника через его Gmail (OAuth, refresh_token в таблице `email_accounts`).
- `api/comm-ingest.js`, `api/email-inbound.js` — приём нормализованных сообщений/входящей почты в `comm_messages`.
- `api/env-check.js` — диагностика env (только да/нет; удалить в проде).
- `AI_советник_Gemini.md` — готовый промпт + инструкция для AI-советника на Gemini (функция `api/ai-advisor.js` ещё не создана).
- `vercel.json` — cron `gmail-sync` каждые 15 мин (опционально; на Hobby-плане лимиты).

## 5. Модель данных (Supabase, основные таблицы)
- `applications` — заявки партнёров: `company, kind, category, email, phone, regions, description, status (pending/approved/partner/new/rejected), portal_active, portal_pass, portal_reset_requested, reviewed_at`.
- `vendors` — одобренные листинги маркетплейса: `application_id, name, category, description, badge, active, regions, match_score, impressions, clicks`.
- `staff` — команда: `name, role, login, pass (plaintext!), email, phone, whatsapp, telegram, gmail_connected, shifts_total, shifts_weekend, active, last_seen`. Роли: Sales, Service Sales, PM, Account Manager, Юрист, Модератор, Маркетинг, Финансы, Админ, Support.
- `leads` — лиды: `vendor, product, visitor_name, contact, message, source (demo_request/cart/chat), status, owner`.
- `deals` — сделки (**id типа text**, напр. `BC-1042`): `client, resp, ssales, pm, am, stage, status, agr(jsonb), flow(jsonb[7]), steps(jsonb), rr_done, kick_done`. 6 стадий (как в Zoho) + 7-шаговый флоу.
- `agreements` — соглашения (замена DocuSign): черновик→подпись→оплата, привязка к сделке.
- `tasks` — задачи/запросы ресурсов (замена Jira): `title, dept, assignee, priority, status, description`.
- `documents` — файлы в защищённом бакете `uploads` (Storage).
- `threads` — каналы чата: `kind (visitor/kickoff/internal), title, deal_id, partner, guest_key, last_at`.
- `thread_messages` — сообщения: `thread_id, sender, role (visitor/staff/partner), text, file_url, file_type`.
- `events` — трекинг посетителей: `visitor_anon, session_id, type, target, meta(jsonb), created_at`. Типы: page, click, cart, lead, ai, search, entry(login), ping(heartbeat).
- `visitors` — `anon_id, device(jsonb: ua/lang/tz/screen/fp/name/contact)`.
- `accounts` — реестр «чей клиент/партнёр» (владелец, тип, контакты); `contacts` + `comm_messages` — омниканальная переписка.
- `email_accounts` — refresh_token'ы Gmail сотрудников (RLS закрыт, только service_role).

## 6. Переменные окружения (Vercel → Settings → Environment Variables)
Заданы (Production+Preview): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT` (=`https://betconstructai.com/api/gmail-auth-callback`), `SB_SERVICE_KEY` (service_role).
Добавить для AI: `GEMINI_API_KEY`. **После добавления любой env — обязателен Redeploy.**

## 7. Что уже реализовано
Маркетплейс + модерация заявок с бейджами; кабинет партнёра (вход email/телефон+пароль, восстановление доступа); CRM (6 стадий + 7-шаговый флоу, ответственные по ролям); соглашения; задачи; чат (посетители/kickoff/внутренние) на polling; аккаунты + омниканальная переписка; аналитика посетителей (пути по стабильному коду устройства, объединение по контакту email/телефон, имя из входа); FingerprintJS; живой мониторинг «кто на сайте» с именем/контактом/кликами и кнопкой «Написать» (в админке и в кабинете sales), посетитель получает сообщения даже с закрытым чатом; i18n админки RU/EN/HY; Gmail-движок (код готов, подключение отложено — корпоративный Google блокирует сторонний OAuth); Hayk Sargsyan и 2 email — админы.

## 8. Известные компромиссы прототипа (ВАЖНО для проду)
- Пароли (`staff.pass`, `applications.portal_pass`) хранятся **в открытом виде**; вход по логину/паролю из БД.
- RLS открыт `using(true)` — anon-ключ фронта может читать в т.ч. `staff` с паролями.
- Учётки админа частично **вшиты в код** (`ADMINS` в admin.html).
- Нет настоящей аутентификации (Supabase Auth/JWT), нет 2FA, нет аудит-лога, бэкапов, мониторинга, тестов.
- Чат/присутствие на polling, не realtime; нет индексов под нагрузку.
- FingerprintJS + трекинг = персональные данные → для проду нужен GDPR-consent и политика приватности. iGaming — учесть лицензирование/регуляции.
- `api/env-check.js` открыт — удалить в проде.

## 9. Дорожная карта (приоритеты MVP → Production)
🔴 До запуска: Supabase Auth + хеширование паролей + строгие RLS; убрать вшитые креды/секреты из фронта; GDPR-согласие; убрать `env-check`.
🟡 Надёжность: realtime-чат (Supabase Realtime), индексы, бэкапы, мониторинг/алерты, обработка ошибок.
🟢 Функции: AI-советник на Gemini (`api/ai-advisor.js` по `AI_советник_Gemini.md`); импорт реальных данных из Zoho (accounts/deals); каналы WhatsApp/Telegram; реальное присутствие сотрудников через `staff.last_seen` heartbeat (колонка есть; нужно дописать heartbeat в staff.html и переключить `isOnlineNow` на last_seen); кнопка «сгенерировать новый пароль партнёра» в карточке заявки; тесты, чистка демо-данных.

## 10. Конвенции кода
- Один файл = один экран, всё inline. Роутер: `go(page)` → `render()`; вкладки — `renderTabs()`.
- i18n клиента (index): словарь `T` + `t()` (RU/EN/HY, флаг `lang`). i18n админки: `window.I18N` + `translateDOM()` (пост-обработка DOM; НЕ трогает `<select>/<option>`, чтобы не портить value).
- Загрузка данных из Supabase: `db.from('table').select(...)`; upsert для сохранения (`saveDeal`, `setStaffField` и т.п.).
- Не ломать значения `<option>` при переводе; секреты — только в env; anon-ключ — публичный (ок во фронте).
- Проверка синтаксиса перед сдачей: извлечь inline `<script>` и `node --check`.

## 11. Полезные факты для отладки
- Домен без www редиректит на www — эндпоинты `/api/*` тестировать на `https://www.betconstructai.com/...`.
- Быстрая проверка env: `GET https://www.betconstructai.com/api/env-check`.
- Документация проекта велась в Notion (страница id `39974602dad481ae97a4f4afda6428c7`, разделы до §27) — если есть доступ, там история решений.

---

**Как начать в Claude Code:** прочитай `index.html`, `admin.html`, `staff.html`, `partner.html`, `api/*.js`,
затем сформулируй план под конкретную задачу. Деплой — через загрузку изменённых файлов в GitHub-репозиторий
`mantarlyani/betconstructAI` (Vercel авто-деплоит), после изменения env — Redeploy.
