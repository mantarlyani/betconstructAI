# BetConstructAI — подключение бэкенда (пошагово)

Цель: чтобы данные (регистрации, заявки, чаты, аналитика) реально сохранялись.
Стек: **Supabase** (база + авторизация + realtime + pgvector) + **Vercel** (хостинг + функция для Gemini).

---

## Шаг 1. Supabase — база данных
1. Зайди: https://supabase.com/dashboard/sign-up → создай аккаунт.
2. **New project** → имя `betconstructai`, задай пароль базы, регион ближе к тебе (EU).
3. Дождись создания (~2 мин).
4. Слева **SQL Editor** → **New query** → вставь всё содержимое файла `database.sql` → **Run**.
   Появятся все таблицы, роли и политики безопасности.
5. Слева **Project Settings → API** → скопируй и пришли мне:
   - **Project URL** (вида `https://xxxx.supabase.co`)
   - **anon public** ключ (он публичный, безопасен для фронта — база защищена политиками RLS)
   > НЕ присылай `service_role` ключ — он секретный.

## Шаг 2. Сделать себя админом
После первой регистрации в приложении зайди в Supabase → **SQL Editor**:
```sql
update public.profiles set role='admin' where contact='ТВОЙ_EMAIL';
```

## Шаг 3. Vercel — хостинг + Gemini
1. Зайди: https://vercel.com/signup → войди через **GitHub**.
2. **Add New → Project** → выбери репозиторий `betconstructAI` → **Deploy**.
   (Vercel сам подхватит `index.html`, `admin.html` и папку `api/`.)
3. **Project → Settings → Environment Variables** добавь:
   - `GEMINI_API_KEY` = ключ из https://aistudio.google.com/app/apikey
4. **Redeploy**. Функция станет доступна по `https://твой-проект.vercel.app/api/advisor`.

## Шаг 4. Gemini API-ключ
1. https://aistudio.google.com/app/apikey → **Create API key**.
2. Вставь его в Vercel (шаг 3.3). Ключ на сервере, в браузер не попадает.

---

## Что дальше делаю я (после того как пришлёшь URL + anon key)
- Подключу фронт (`index.html`, `admin.html`) к Supabase:
  1. **Регистрация/вход** — реально сохраняются (email/пароль или OTP-код).
  2. **Заявки партнёров/аффилейтов** — летят в базу → видны в админке, не пропадают.
  3. **Модерация** — кнопки Approved/Partner реально меняют статус в базе → вендор появляется в Marketplace.
  4. **Чат** — realtime: сообщение посетителя прилетает менеджеру в админку и обратно.
  5. **Аналитика** — трекер шлёт реальные события (визиты, клики, пути) в базу.
  6. **AI-советник** — через `/api/advisor` (реальный Gemini).
  7. **Контент/баннеры** — управление index из админки сохраняется.
- Добавлю cookie-согласие и приватность (GDPR / iGaming-комплаенс).

## Порядок приоритета
1) Регистрация → 2) Заявки+модерация → 3) Чат realtime → 4) Аналитика → 5) Gemini.

---
*Файлы в этой папке: `database.sql` (схема), `api/advisor.js` (функция Gemini), `index.html`, `admin.html`.*
