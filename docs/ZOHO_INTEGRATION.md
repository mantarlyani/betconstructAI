# Интеграция Zoho CRM — личный кабинет сотрудника

Документация по подключению Zoho CRM к разделу **Сотрудники → личный кабинет** в admin.html.

- **Статус кода:** готов. Сейчас работает в демо-режиме (заглушка).
- **Что нужно для реального режима:** 4 переменные окружения в Vercel (ниже).
- **Дата-центр:** `com` (crm.zoho.com).

---

## 1. Как это устроено

```
admin.html (Сотрудники → клик по имени)
   │  openStaff(id) → loadZoho(email)
   ▼
GET /api/zoho?email=<email сотрудника>
   │
   ├─ нет ключей Zoho  → демо-данные (badge «● демо-данные»)
   └─ есть ключи Zoho  → Zoho CRM API (badge «● подключено»)
         1) refresh_token → access_token (accounts.zoho.com)
         2) COQL-запрос по Owner.email = <email>
            модули: Leads, Deals, Contacts, Tasks
```

**Файлы:**
- `api/zoho.js` — серверный эндпоинт (Vercel Serverless Function).
- `admin.html` — функции `loadZoho()`, `zohoCard()`; кэш `zohoCache`.

**Ответ `/api/zoho`:**
```json
{
  "connected": true,
  "owner": "ruzanna.goroyan@softconstruct.com",
  "counts": { "leads": 3, "deals": 4, "contacts": 2, "tasks": 3 },
  "leads": [ ... ], "deals": [ ... ], "contacts": [ ... ], "tasks": [ ... ]
}
```
`connected:false` = демо-режим (ключей нет или ошибка токена).

---

## 2. Переменные окружения (Vercel)

| Name | Пример | Описание |
|---|---|---|
| `ZOHO_CLIENT_ID` | `1000.ABCD...` | Client ID из Self Client |
| `ZOHO_CLIENT_SECRET` | `a1b2c3...` | Client Secret из Self Client |
| `ZOHO_REFRESH_TOKEN` | `1000.xxxx...` | Бессрочный refresh token |
| `ZOHO_DC` | `com` | Дата-центр: com / eu / in / com.au / jp / ca |

Где добавить: **Vercel → проект → Settings → Environment Variables** → среды **Production + Preview** → затем **Redeploy**.

Если хоть одной из `CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN` нет — эндпоинт автоматически отдаёт демо-данные.

---

## 3. Получение ключей Zoho (пошагово)

### 3.1 Создать Self Client
1. https://api-console.zoho.com → **Add Client** → **Self Client** → **Create**.
2. Вкладка **Client Secret** → скопировать **Client ID** и **Client Secret**.

### 3.2 Сгенерировать grant code
Вкладка **Generate Code**:
- **Scope:** `ZohoCRM.modules.ALL,ZohoCRM.users.READ`
- **Time Duration:** `10 minutes`
- **Scope Description:** любое (напр. `crm`)
- **Create** → выбрать портал/организацию → скопировать **grant code** (`1000.xxxxx`).

> Grant code живёт 10 минут — сразу переходи к обмену.

### 3.3 Обменять grant code на refresh token
В терминале (подставь значения):
```bash
curl -s -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=ТВОЙ_CLIENT_ID" \
  -d "client_secret=ТВОЙ_CLIENT_SECRET" \
  -d "code=GRANT_CODE"
```
Ответ:
```json
{ "access_token":"1000...", "refresh_token":"1000...", "expires_in":3600, ... }
```
Сохрани **`refresh_token`** — он бессрочный (используется и для будущих запросов). `access_token` вписывать никуда не нужно: код получает его сам из refresh token при каждом запросе.

### 3.4 Вписать в Vercel и Redeploy
См. раздел 2.

---

## 4. Scopes (права доступа)

Минимально нужно:
- `ZohoCRM.modules.ALL` — чтение Leads/Deals/Contacts/Tasks через COQL.
- `ZohoCRM.users.READ` — сопоставление владельца по email.

Если позже добавим запись (создание задач/заметок из кабинета) — расширим scope и перевыпустим refresh token.

---

## 5. Сопоставление сотрудников (важно)

COQL фильтрует по владельцу записи:
```sql
select ... from Deals where Owner.email = '<email сотрудника>' limit 20
```
Email в нашей базе `staff.email` (например `ruzanna.goroyan@softconstruct.com`) **должен совпадать** с email владельца (Owner) в Zoho CRM.

- Совпадает → в кабинете реальные лиды/сделки.
- Не совпадает → счётчики по нулям (данные есть, но не привязываются).

Если в Zoho у людей другие адреса — пришли соответствие «наш email → email в Zoho», добавим таблицу маппинга в `api/zoho.js`.

---

## 6. Проверка

1. После Redeploy открой **/admin → Сотрудники → клик по имени**.
2. Бейдж в карточке «Zoho CRM»:
   - **● подключено** — реальные данные.
   - **● демо-данные** — ключей нет или ошибка (см. раздел 7).
3. Прямой ответ API (подставь реальный email):
   ```
   https://www.betconstructai.com/api/zoho?email=ruzanna.goroyan@softconstruct.com
   ```
   Смотри `connected` и `counts`.

---

## 7. Диагностика проблем

| Симптом | Причина | Решение |
|---|---|---|
| Остаётся «демо-данные» | Переменные не добавлены / не сделан Redeploy | Проверь env в Vercel, сделай Redeploy |
| `connected:false` + `error` в ответе | refresh token невалиден / не тот DC | Перевыпусти refresh token; проверь `ZOHO_DC` |
| `connected:true`, но счётчики 0 | Owner.email в Zoho ≠ email сотрудника | Раздел 5 (маппинг) |
| `INVALID_TOKEN` / `AUTHENTICATION_FAILURE` | Протух access token / нет scope | Проверь scope `ZohoCRM.modules.ALL`; перевыпуск |
| `NO_PERMISSION` | У аккаунта нет API-доступа | Нужен план Zoho CRM с API |
| Пусто по Tasks | Другое имя модуля в портале | Сообщи — поправим API-имя модуля |

Логи ошибок: **Vercel → Deployments → (деплой) → Functions → /api/zoho**.

---

## 8. Безопасность

- Секреты — только в Vercel Environment Variables. **Не коммитить** в репозиторий, не слать в чат/мессенджеры.
- Refresh token = полный доступ к CRM на чтение. Утёк — отозвать в https://api-console.zoho.com (удалить/перевыпустить Self Client).
- **Защита сессией — реализована.** `/api/zoho` проверяет Bearer-токен Supabase:
  - реальные данные Zoho отдаются **только авторизованным** (иначе демо — утечки нет);
  - **staff** видит только свой email (query-параметр игнорируется), **admin** — любой;
  - токен берётся из сессии Supabase на фронте (`db.auth.getSession()`), проверяется на сервере через `/auth/v1/user`, роль — из `profiles.role`.

---

## 9. Как расширять

- **Новые поля/модули:** в `api/zoho.js` → функция `coql()` вызывается отдельно на каждый модуль; добавь нужные поля в `select` и новый `coql(token,'Module',...)`.
- **Запись в Zoho** (создать задачу/заметку из кабинета): добавить POST-эндпоинт + scope на запись.
- **Кэш:** сейчас кэш только на фронте (`zohoCache` на сессию). При росте нагрузки — добавить серверное кэширование/лимиты.

---

## 10. Быстрый чек-лист

- [ ] Self Client создан, есть Client ID + Secret
- [ ] Grant code выпущен со scope `ZohoCRM.modules.ALL,ZohoCRM.users.READ`
- [ ] Получен refresh token (curl, раздел 3.3)
- [ ] 4 переменные добавлены в Vercel (Production + Preview)
- [ ] Redeploy сделан
- [ ] Бейдж «● подключено», счётчики > 0
- [ ] (если 0) проверено совпадение email владельцев

---

## 11. Целевая модель: «зеркало» Zoho (каждый видит свой аккаунт)

**Идея:** платформа — это *mirror side* (витрина) поверх Zoho. Учёт/истина данных остаётся в Zoho CRM; мы только отображаем (и позже — частично пишем).

Каждый сотрудник логинится → попадает в **свой** кабинет → видит **свои** записи из Zoho (его лиды/сделки/контакты/задачи — те, где он Owner).

### Как это ложится на текущий код
- `admin.html` — админ открывает **любого** сотрудника (обзор всей команды). Уже работает.
- `/partner` (staff.html) — сотрудник видит **только себя**. Это следующий шаг:
  1. После входа берём email из сессии Supabase (`db.auth.getUser()` → `profiles.email`), **не** из URL.
  2. Запрос `/api/zoho?email=<свой email>` → рендер того же `zohoCard`.
  3. Пользователь не может подставить чужой email.

### Защита эндпоинта — СДЕЛАНО ✅
- Фронт шлёт **access token** сессии Supabase в заголовке `Authorization: Bearer …`.
- `/api/zoho` проверяет токен (`/auth/v1/user`), определяет email и роль (`profiles.role`).
- **staff** → email принудительно из токена (query игнорируется); **admin** → любой email.
- Неавторизованный запрос → демо-данные (реальные данные Zoho не отдаются).

### Источник истины
- **Zoho = учёт** (сделки, суммы, этапы). Мы не дублируем расчёты, а читаем из Zoho.
- Наша БД (Supabase) хранит: доступы/логины, дежурства, внутренние заметки — то, чего нет в Zoho.
- При необходимости двусторонней записи (создать задачу/лид из кабинета) — отдельный POST-эндпоинт со scope на запись; Zoho остаётся мастером.

### План внедрения (по шагам)
1. Подключить реальные ключи Zoho (разделы 2–3). ← **сейчас (на стороне клиента/админа)**
2. ✅ Защитить `/api/zoho` сессией Supabase (email из токена, не из query). — **СДЕЛАНО**
3. В `/partner` (staff.html) показать кабинет текущего пользователя (его Zoho-данные). — **следующий шаг**
4. ✅ Роли: admin — вся команда; staff — только свой аккаунт (на уровне API уже так).
5. (Опционально) запись в Zoho из кабинета.

---

_Справка: Zoho OAuth — https://www.zoho.com/crm/developer/docs/api/v3/auth-request.html · COQL — https://www.zoho.com/crm/developer/docs/api/v3/COQL-Overview.html_
