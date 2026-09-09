# BetConstructAI — Mobile String Export

Flat i18n string tables extracted from the BetConstructAI web app for the mobile team.

## Files
- `strings.ru.json` — Russian (**primary / source language**)
- `strings.en.json` — English
- `strings.hy.json` — Armenian (Հայերեն)

All three files share the **exact same key set** (1163 keys each). Look up a string by its key; every key exists in all three languages.

## Languages & direction
| Lang | Code | Role | Direction |
|------|------|------|-----------|
| Russian  | `ru` | Primary / source of truth | LTR |
| English  | `en` | Translation | LTR |
| Armenian | `hy` | Translation | LTR |

**No RTL.** All three languages are left-to-right; no bidi/RTL handling is required.

## Where the strings come from
- **Client app** (`index.html`): main UI dictionary (`T`), catalog/content map (`TR`), cookie banner, and inline strings — keys like `home_*`, `advisor_*`, `market_*`, `entry_*`, `register_*`, `form_*`, `cart_*`, `sign_*`, `chat_*`, `content_*`.
- **Admin / staff back-office** (`admin.html`, `staff.html`, `admin_i18n.js`): `admin_*` and `staff_*`.
- **Login** (`login.html`): `login_*`.
- **Privacy policy** (`privacy.html`): `privacy_*`.

Ground-truth translations (ru/en/hy triples already present in the code's `T` and `I18N`/`TR` dictionaries) were used verbatim. The `content_*` (catalog) and most `admin_*` keys are auto-named from their English text, so key names there are descriptive rather than hand-curated.

## Interpolation
Placeholders use the `{name}` / `{count}` style (converted from the code's `${...}` template spots). Keep them intact when translating/rendering.

Keys with placeholders:
- `admin_task_board` — `Доска задач ({count})`
- `admin_deal_mail` — `Почтовая переписка по сделкам ({count})`
- `admin_registry_count` — `Реестр ({count})`
- `staff_online_count` — `👀 Онлайн ({count})`
- `staff_mine_count` — `Мои ({count})`
- `staff_queue_count` — `Очередь ({count})`
- `demo_request_for_product` — `Запрос демо на продукт «{name}»`
- `staff_greeting` — `Здравствуйте, {name}`

## Plurals (Russian is plural-sensitive)
Russian has **4 plural categories** (one / few / many / other) for counted nouns, e.g.:
- лид / лида / лидов
- сделка / сделки / сделок
- смена / смены / смен
- заявка / заявки / заявок
- посетитель / посетителя / посетителей
- клик / клика / кликов · показ / показа / показов · день / дня / дней

English and Armenian use 2 forms (one / other). The exported strings store a **single fixed form** (whatever the source used); they are **not** pre-pluralized. Wherever a `{count}` is shown next to a noun — especially:
  - `admin_task_board`
  - `admin_deal_mail`
  - `admin_registry_count`
  - `staff_online_count`
  - `staff_mine_count`
  - `staff_queue_count`
— and the count-bearing labels in `admin_*`/`staff_*` (e.g. "Лидов за 7 дней", "Всего смен…", "…кликов/мес", "Очередь", "Мои", "Реестр"), the mobile team should apply proper CLDR plural rules per language rather than relying on the baked-in noun form.

## Keys needing native review (273)
These en/hy values were **self-translated during extraction** (no official translation existed in the source) — please have a native speaker review. Russian (`ru`) for these is authored source text and is trustworthy.

Note: the entire **Armenian privacy policy** (`privacy_*`) is self-translated (the source privacy page ships only RU + EN). RU and EN for `privacy_*` are from the source; **hy is self-translated**.


### `admin_*` (83)
- `admin_back_to_staff`
- `admin_reset_password_icon`
- `admin_send_for_signature`
- `admin_connect_gmail`
- `admin_gmail_connected`
- `admin_return_to_work`
- `admin_all_channels`
- `admin_contract_signed_docusign`
- `admin_no_extra_fields`
- `admin_task_board`
- `admin_registry_desc`
- `admin_import_desc`
- `admin_tasks_jira`
- `admin_request_pm_ss`
- `admin_import_csv`
- `admin_client_not_found`
- `admin_to_email`
- `admin_no_contacts`
- `admin_visitors_desc`
- `admin_internal_channel_name`
- `admin_write_email_client`
- `admin_no_data`
- `admin_no_product_apps`
- `admin_no_apps`
- `admin_no_leads`
- `admin_no_new_apps`
- `admin_no_deals`
- `admin_new_password`
- `admin_left_application`
- `admin_open_document`
- `admin_open_inbox`
- `admin_mark_checkin`
- `admin_mark_checkout`
- `admin_mark_setupfee_paid`
- `admin_mark_signed`
- `admin_to_pause`
- `admin_no_correspondence`
- `admin_no_correspondence_hint`
- `admin_reconnect`
- `admin_connect_service_sales`
- `admin_signer_name`
- `admin_no_documents_hint`
- `admin_no_tasks_hint`
- `admin_no_requests`
- `admin_no_agreements_hint`
- `admin_visitors_hoory`
- `admin_deal_mail`
- `admin_check_email_step`
- `admin_project_launched_step`
- `admin_empty`
- `admin_index_sections_toggle`
- `admin_development_setup`
- `admin_registry_count`
- `admin_registry_empty`
- `admin_shift_rating`
- `admin_generate_document`
- `admin_generate_new_password`
- `admin_deal_optional`
- `admin_nobody_online`
- `admin_copied`
- `admin_viewed_sections`
- `admin_agreement_payment_step2`
- `admin_nda_title`
- `admin_nda_body_key`
- `admin_resource_requests_created`
- `admin_signing_link`
- `admin_became_lead`
- `admin_agreement_text`
- `admin_phone_cabinet_login`
- `admin_subject_email`
- `admin_internal_channels_pandayo`
- `admin_two_way_mail_sync`
- `admin_nda_setupfee`
- `admin_setupfee_optional`
- `admin_roles_clause`
- `admin_label_owner`
- `admin_label_vendor`
- `admin_label_contact`
- `admin_label_date`
- `admin_label_stage`
- `admin_label_deal`
- `admin_label_signed`
- `admin_label_created`

### `advisor_*` (2)
- `advisor_analyzing`
- `advisor_demo_note`

### `cart_*` (7)
- `cart_add_interest`
- `cart_added_toast`
- `cart_empty`
- `cart_empty_hint`
- `cart_already`
- `cart_items_label`
- `cart_from_marketplace`

### `chat_*` (1)
- `chat_greeting_visitor`

### `common_*` (3)
- `common_collapse`
- `common_section`
- `common_solutions`

### `contact_*` (1)
- `contact_email_or_phone`

### `demo_*` (3)
- `demo_request_sent`
- `demo_request_for_product`
- `demo_setup_fee_note`

### `err_*` (3)
- `err_specify_fullname`
- `err_loading`
- `err_accept_terms`

### `form_*` (1)
- `form_cabinet_password`

### `hint_*` (1)
- `hint_min6`

### `label_*` (8)
- `label_package`
- `label_product`
- `label_products`
- `label_regions`
- `label_payments`
- `label_platforms`
- `label_licenses`
- `label_igaming`

### `lang_*` (2)
- `lang_russian`
- `lang_ru_short`

### `login_*` (1)
- `login_title`

### `loyalty_*` (2)
- `loyalty_title`
- `loyalty_xp_demo`

### `menu_*` (1)
- `menu_logout_switch`

### `notif_*` (1)
- `notif_manager_wrote`

### `packages_*` (2)
- `packages_title`
- `packages_prices_label`

### `partner_*` (16)
- `partner_form_full_name`
- `partner_step1_who`
- `partner_step1_legal`
- `partner_step2_product`
- `partner_step2_services`
- `partner_step3_regions`
- `partner_step3_terms`
- `partner_step4_access`
- `partner_step4_commercial`
- `partner_step5_aitags`
- `partner_step6_access`
- `partner_moderation_note`
- `partner_moderation_note_long`
- `partner_after_approval_listing_badge`
- `partner_after_approval_badge`
- `partner_login_hint`

### `pay_*` (1)
- `pay_methods_example`

### `privacy_*` (40)
- `privacy_title`
- `privacy_nav_back`
- `privacy_h1`
- `privacy_updated`
- `privacy_intro`
- `privacy_h2_1`
- `privacy_collect_consent_intro`
- `privacy_collect_device`
- `privacy_collect_events`
- `privacy_collect_technical`
- `privacy_provide_intro`
- `privacy_provide_name`
- `privacy_provide_chat`
- `privacy_provide_partner`
- `privacy_h2_2`
- `privacy_use_1`
- `privacy_use_2`
- `privacy_use_3`
- `privacy_h2_3`
- `privacy_legal_basis`
- `privacy_h2_4`
- `privacy_consent_1`
- `privacy_consent_2`
- `privacy_consent_3`
- `privacy_h2_5`
- `privacy_proc_supabase`
- `privacy_proc_fingerprint`
- `privacy_proc_vercel`
- `privacy_proc_google`
- `privacy_no_sell`
- `privacy_h2_6`
- `privacy_retention`
- `privacy_h2_7`
- `privacy_rights`
- `privacy_h2_8`
- `privacy_deletion`
- `privacy_h2_9`
- `privacy_contact`
- `privacy_note`
- `privacy_footer`

### `request_*` (1)
- `request_sent_manager`

### `search_*` (3)
- `search_no_results`
- `search_title`
- `search_hint`

### `send_*` (1)
- `send_request_manager`

### `sign_*` (10)
- `sign_signer_name`
- `sign_accept_terms`
- `sign_thanks`
- `sign_submit`
- `sign_signature`
- `sign_title`
- `sign_loading`
- `sign_not_found`
- `sign_signed`
- `sign_invalid_link`

### `staff_*` (79)
- `staff_back_my_deals`
- `staff_back`
- `staff_forward`
- `staff_shift_not_started_dot`
- `staff_on_shift_since`
- `staff_shift_dot`
- `staff_online_count`
- `staff_recent_paths`
- `staff_active`
- `staff_quick_actions`
- `staff_leads_desc`
- `staff_take`
- `staff_internal_channels`
- `staff_login_hint`
- `staff_no_taken_leads`
- `staff_account_data`
- `staff_chats_desc`
- `staff_agreements_desc`
- `staff_document`
- `staff_no_documents`
- `staff_documents_readonly`
- `staff_awaiting_signature`
- `staff_no_clients_hint`
- `staff_completed_pl`
- `staff_complete`
- `staff_end_shift`
- `staff_clients_desc`
- `staff_greeting`
- `staff_history`
- `staff_total_today`
- `staff_cabinet`
- `staff_cabinet_title`
- `staff_client_assigned_to`
- `staff_lead_taken`
- `staff_personal_metrics`
- `staff_login_label`
- `staff_mine_count`
- `staff_my_tasks`
- `staff_my_clients`
- `staff_my_leads`
- `staff_my_deals`
- `staff_my_deals_by_stage`
- `staff_my_agreements`
- `staff_my_crm`
- `staff_my_analytics`
- `staff_my_shift`
- `staff_no_tasks`
- `staff_no_deals`
- `staff_on_shift_7days`
- `staff_assigned_desc`
- `staff_write`
- `staff_start_shift`
- `staff_no_active_shift`
- `staff_no_server`
- `staff_overview`
- `staff_online`
- `staff_online_desc`
- `staff_open_pl`
- `staff_shift_desc`
- `staff_queue_count`
- `staff_login_error`
- `staff_error`
- `staff_pause`
- `staff_visitors`
- `staff_profile`
- `staff_roles`
- `staff_no_free_leads`
- `staff_deals_desc`
- `staff_now_online`
- `staff_nobody_online`
- `staff_shifts_scheduled`
- `staff_no_shifts_today`
- `staff_shift`
- `staff_shift_ended`
- `staff_shift_started`
- `staff_shift_already_started`
- `staff_no_agreements`
- `staff_chats`
- `staff_handover_note`
