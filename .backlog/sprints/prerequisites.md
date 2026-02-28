# Prerequisites — чеклист перед началом разработки

## Обязательно перед Sprint 1

- [x] **Node.js 18+** установлен (`node --version`)
- [x] **npm** или **pnpm** установлен
- [x] **Git** настроен, репозиторий инициализирован
- [x] **Supabase** проект создан → `SUPABASE_URL` + `SUPABASE_ANON_KEY` получены
- [x] Создан файл `.env.local` с переменными
- [x] Создан `.env.example` (шаблон без секретов)
- [x] `.gitignore` настроен (`.env*` файлы не коммитятся)

## Обязательно перед Sprint 2 (AI Core)

- [x] **GigaChat API ключ** получен на [developers.sber.ru/studio](https://developers.sber.ru/studio)
- [ ] GigaChat PoC (задача S01-009) пройден успешно

## Стратегия миграций Supabase

Все миграции БД хранятся в `supabase/migrations/` как SQL-файлы с именами:
```
supabase/migrations/
├── 001_profiles_projects.sql
├── 002_conversations_messages.sql
├── 003_knowledge_chunks.sql
├── 004_academy_gamification.sql
└── 005_pitch_decks.sql
```

Чтобы развернуть проект на новом Supabase:
1. Создать новый Supabase проект
2. Применить миграции по порядку в SQL Editor
3. Или использовать Supabase CLI: `supabase db push`

## Можно позже

- [ ] PostHog аккаунт (перед Sprint 6)
- [ ] Домен + DNS (перед Sprint 6)
- [ ] Sentry аккаунт (перед Sprint 6)

## Шаблон `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GigaChat (Sprint 2+)
GIGACHAT_API_KEY=your-base64-credentials
GIGACHAT_SCOPE=GIGACHAT_API_B2B

# PostHog (Sprint 6)
# NEXT_PUBLIC_POSTHOG_KEY=
# NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
