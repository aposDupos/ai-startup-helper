# Sprint 16 — Architecture Refactoring (~2 нед)

**Цель:** Рефакторинг архитектуры для production-readiness: parallel data fetching, error boundaries, модульный AI router, rate limiting, timezone fix, типизация, тестирование.
**Зависимости:** Sprint 15 завершён.

---

## S16-001: Parallel Data Fetching — Dashboard
**Статус:** [ ]
**Зависимости:** —
**Скиллы:** `vercel-react-best-practices` → правила `async-suspense-boundaries`, `server-parallel-fetching`, `async-parallel`
**Описание:** Dashboard делает ~10 последовательных запросов к Supabase (waterfalls). Рефакторинг на `Promise.allSettled` + `<Suspense>` streaming.
**Действия:**
- Разбить `dashboard/page.tsx` (415 строк) на отдельные async Server Components:
  - `DashboardHeader` — profile + welcome
  - `JourneyMapSection` — project + checklists + lessons
  - `ScorecardSection` — scorecard + history
  - `QuestsSection` — daily quest + streak freeze
  - `WeeklySection` — weekly report
  - `ReviewNotifications` — review notifications
- Каждая секция оборачивается в `<Suspense fallback={<Skeleton />}>`
- Параллельная загрузка: каждый компонент делает свой fetch независимо
- Создать `src/components/ui/Skeleton.tsx` — shimmer loading для каждой секции
**Файлы:**
- `src/app/(main)/dashboard/page.tsx` [MODIFY] — разбить на секции с Suspense
- `src/app/(main)/dashboard/_components/` [NEW] — серверные секции
- `src/components/ui/Skeleton.tsx` [NEW]
**Критерии приёмки:**
- [ ] Dashboard рендерит секции параллельно (network tab показывает одновременные запросы)
- [ ] Падение одной секции не ломает всю страницу
- [ ] Skeleton показывается до загрузки каждой секции
- [ ] Количество строк в `page.tsx` < 80

---

## S16-002: Error Boundaries + Graceful Degradation
**Статус:** [ ]
**Зависимости:** S16-001
**Скиллы:** `vercel-react-best-practices` → правила `async-suspense-boundaries` (fallback patterns)
**Описание:** Заменить `catch { // Ignore }` на graceful degradation с user-visible fallbacks.
**Действия:**
- Создать `src/components/shared/ErrorBoundary.tsx` — React Error Boundary с fallback UI
- Создать `src/app/(main)/dashboard/error.tsx` — Next.js error page
- Создать `src/components/shared/SectionError.tsx` — inline fallback: "Не удалось загрузить секцию. [Повторить]"
- Обернуть каждую секцию Dashboard в `<ErrorBoundary>`
- Chat API route: заменить generic "Извини, ошибка" на specific error messages
- Логирование: все `catch` блоки пишут в `console.error` с контекстом
**Файлы:**
- `src/components/shared/ErrorBoundary.tsx` [NEW]
- `src/components/shared/SectionError.tsx` [NEW]
- `src/app/(main)/dashboard/error.tsx` [NEW]
- `src/app/api/chat/route.ts` [MODIFY] — улучшить error handling
**Критерии приёмки:**
- [ ] Нет `// Ignore` комментариев в catch блоках
- [ ] При ошибке загрузки scorecard — Dashboard работает, секция показывает fallback
- [ ] Chat API возвращает полезные error messages

---

## S16-003: Модульный AI Router
**Статус:** [ ]
**Зависимости:** —
**Описание:** Разбить монолитный `router.ts` (469 строк) на модульную архитектуру с единой регистрацией tools.
**Действия:**
- Создать `src/lib/ai/tools/registry.ts` — центральный реестр tools:
  - Каждый tool экспортирует `{ definition, execute }` объект
  - Registry собирает все tools автоматически
  - Один источник правды для GIGACHAT_FUNCTIONS
- Рефакторинг каждого tool файла — добавить `gigaChatDefinition` экспорт рядом с `execute` функцией
- Устранить copy-paste follow-up логики (строки 389-407 ≈ 430-446) → вынести в `executeToolAndFollowUp()`
- Удалить `console.log` debug statements из production кода
- Добавить logging через централизованный logger вместо `console.*`
**Файлы:**
- `src/lib/ai/tools/registry.ts` [NEW] — tool registry
- `src/lib/ai/tools/*.ts` [MODIFY] — добавить gigaChatDefinition
- `src/lib/ai/agents/router.ts` [MODIFY] — использовать registry, убрать дублирование
- `src/lib/logger.ts` [NEW] — централизованный logger (dev vs production)
**Критерии приёмки:**
- [ ] Добавление нового tool = 1 файл (definition + execute рядом)
- [ ] Нет дублирования follow-up логики
- [ ] `console.log` заменены на logger
- [ ] `router.ts` < 150 строк

---

## S16-004: Timezone-aware Streaks
**Статус:** [ ]
**Зависимости:** —
**Описание:** Стрики используют `new Date().toISOString()` (серверный UTC), что вызывает рассинхрон для пользователей в UTC+3 и других зонах.
**Действия:**
- Добавить `timezone` поле в `profiles` (заполняется при онбординге или автоматически)
- Рефакторинг `streaks.ts`: все date-comparison через пользовательскую timezone
- Использовать `Intl.DateTimeFormat` для timezone-safe дат
- Обновить `daily-quest.ts` — квест сбрасывается в полночь по timezone пользователя
- Миграция: `ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'Europe/Moscow'`
**Файлы:**
- `supabase/migrations/019_timezone.sql` [NEW]
- `src/lib/gamification/streaks.ts` [MODIFY] — timezone-aware
- `src/lib/gamification/daily-quest.ts` [MODIFY] — timezone-aware
- `src/lib/utils/date.ts` [NEW] — timezone helpers
**Критерии приёмки:**
- [ ] Стрик сбрасывается в полночь по timezone пользователя, не сервера
- [ ] Daily Quest сбрасывается корректно
- [ ] Дефолтная timezone = Europe/Moscow

---

## S16-005: XP Levels — Dynamic Thresholds
**Статус:** [ ]
**Зависимости:** —
**Описание:** XP пороги для уровней захардкожены (`1000 - xp % 1000`), хотя в БД `levels` таблице пороги разные (100, 300, 600, 1000).
**Действия:**
- Создать `src/lib/gamification/levels.ts` — утилиты для работы с уровнями:
  - `getLevelInfo(xp)` → `{ level, currentXP, nextLevelXP, progress% }`
  - Загружать пороги из таблицы `levels` (с кэшированием)
- Обновить Dashboard XP Card — использовать `getLevelInfo()` вместо hardcoded расчёта
- Обновить Sidebar — показывать правильный прогресс
- Рефакторинг `awardXP()` — использовать dynamic thresholds для level up
**Файлы:**
- `src/lib/gamification/levels.ts` [NEW]
- `src/app/(main)/dashboard/page.tsx` [MODIFY] — dynamic XP
- `src/components/shared/Sidebar.tsx` [MODIFY] — dynamic XP
- `src/lib/gamification/xp.ts` [MODIFY] — dynamic level up
**Критерии приёмки:**
- [ ] Нет hardcoded `1000` в XP расчётах
- [ ] Level up пороги берутся из БД
- [ ] Dashboard показывает правильный прогресс до следующего уровня

---

## S16-006: Rate Limiting + Security
**Статус:** [ ]
**Зависимости:** —
**Описание:** Chat API не имеет rate limiting — любой пользователь может спамить AI-запросы.
**Действия:**
- Установить `upstash/ratelimit` + `@upstash/redis` (или in-memory fallback)
- Создать `src/lib/rate-limit.ts` — rate limiter middleware:
  - Chat API: 20 запросов / минуту на пользователя
  - Tool execution: 10 / минуту
  - General API: 100 / минуту
- Интегрировать в `src/app/api/chat/route.ts`
- Добавить `X-RateLimit-*` headers в response
- Создать friendly error: "Слишком много запросов, подожди минутку ⏳"
**Файлы:**
- `src/lib/rate-limit.ts` [NEW]
- `src/app/api/chat/route.ts` [MODIFY] — rate limit check
**Критерии приёмки:**
- [ ] 21-й запрос за минуту → 429 с понятным сообщением
- [ ] Headers X-RateLimit-Limit, X-RateLimit-Remaining в ответе
- [ ] Rate limit per-user (не global)

---

## S16-007: TypeScript Strictness Pass
**Статус:** [ ]
**Зависимости:** S16-001, S16-003
**Описание:** Устранить `any` типы, non-null assertions (`!`), и unsafe casts.
**Действия:**
- Найти и устранить все `Record<string, any>` → proper types
- Заменить `user!.id` → early return guard (уже проверяется в layout, но лучше explicit)
- Заменить `as unknown as Record<string, unknown>` casts → proper JSONB helpers
- Создать `src/lib/supabase/helpers.ts`:
  - `toJsonb<T>(value: T): Json` — type-safe JSONB conversion
  - `fromJsonb<T>(json: Json): T` — type-safe JSONB parse
- Обновить database.ts types если нужно
**Файлы:**
- `src/lib/supabase/helpers.ts` [NEW] — JSONB type helpers
- `src/app/(main)/dashboard/page.tsx` [MODIFY] — remove `!` and `any`
- `src/app/(main)/dashboard/actions.ts` [MODIFY] — remove unsafe casts
- *.ts files across codebase [MODIFY] — type fixes
**Критерии приёмки:**
- [ ] `grep -r "any" src/ --include="*.ts" --include="*.tsx"` — 0 результатов (кроме type definitions)
- [ ] `grep -r "user!" src/` — 0 результатов
- [ ] `npm run build` без type errors

---

## S16-008: Утилиты для Supabase Server Actions
**Статус:** [ ]
**Зависимости:** S16-007
**Описание:** Повторяющийся boilerplate в каждом server action: `createClient() → getUser() → check null`. Создать переиспользуемые утилиты.
**Действия:**
- Создать `src/lib/supabase/auth.ts`:
  - `getAuthenticatedUser()` → `{ user, supabase }` | throw redirect
  - `getActiveProject(userId)` → project | null
  - `getProfileWithProject(userId)` → `{ profile, project }`
- Рефакторинг server actions и pages — использовать helpers
- Убрать повторяющийся `createClient() + getUser()` boilerplate
**Файлы:**
- `src/lib/supabase/auth.ts` [NEW] — auth helpers
- `src/app/(main)/dashboard/page.tsx` [MODIFY]
- `src/app/(main)/dashboard/actions.ts` [MODIFY]
- `src/app/(main)/learning/actions.ts` [MODIFY]
- `src/app/api/chat/route.ts` [MODIFY]
**Критерии приёмки:**
- [ ] Auth boilerplate заменён на 1-line helper вызов
- [ ] Консистентное поведение при отсутствии auth
- [ ] Reusable `getActiveProject()` используется в 3+ местах

---

## S16-009: Vitest + First Tests
**Статус:** [ ]
**Зависимости:** S16-003, S16-004, S16-005
**Описание:** Установить Vitest и написать первые unit-тесты для критической бизнес-логики.
**Действия:**
- `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- Создать `vitest.config.ts`
- Написать тесты для:
  - `src/lib/gamification/levels.ts` — level calculation
  - `src/lib/utils/date.ts` — timezone helpers
  - `src/lib/ai/tools/registry.ts` — tool registration
  - `src/lib/scoring/scorecard.ts` — score calculation
  - `src/lib/rate-limit.ts` — rate limiter logic
- Добавить `"test": "vitest"` в package.json scripts
- Обновить CI: добавить `npm test` step
**Файлы:**
- `vitest.config.ts` [NEW]
- `src/lib/gamification/__tests__/levels.test.ts` [NEW]
- `src/lib/utils/__tests__/date.test.ts` [NEW]
- `src/lib/ai/tools/__tests__/registry.test.ts` [NEW]
- `package.json` [MODIFY] — add vitest + test script
- `.github/workflows/ci.yml` [MODIFY] — add test step
**Критерии приёмки:**
- [ ] `npm test` запускается и проходит
- [ ] Минимум 15 test cases
- [ ] CI (GH Actions) запускает тесты

---

## S16-010: Inline Styles → CSS Classes + Design Tokens Cleanup
**Статус:** [ ]
**Зависимости:** —
**Скиллы:** `tailwindcss-development`, `startup-copilot-design`
**Описание:** Dashboard и другие компоненты используют inline `style={{}}` с CSS-переменными. Вынести в правильные Tailwind-классы, следуя конвенциям из скиллов.
**Действия:**
- ⚠️ Перед началом: загрузить скиллы `tailwindcss-development` и `startup-copilot-design` для актуальных design tokens и Tailwind v4 паттернов
- Audit: найти все компоненты с inline `style={{}}` — особенно dashboard, sidebar
- Создать tailwind utilities для часто используемых паттернов:
  - `.text-mono` → `font-family: var(--font-mono)`
  - `.gradient-primary` → `linear-gradient(...)`
  - `.shadow-glow-primary` → box-shadow
- Заменить inline styles на CSS-классы
- Убрать неиспользуемые design tokens
**Файлы:**
- `src/app/globals.css` [MODIFY] — добавить utility классы
- `src/app/(main)/dashboard/page.tsx` [MODIFY]
- `src/components/shared/Sidebar.tsx` [MODIFY]
**Критерии приёмки:**
- [ ] Нет inline `style={{}}` c CSS-переменными в компонентах (допустимо для dynamic widths)
- [ ] Все градиенты через utility классы
- [ ] `npm run build` без ошибок

---

## S16-011: Скилл `startup-copilot-dev` — Конвенции проекта для AI
**Статус:** [ ]
**Зависимости:** S16-001, S16-003, S16-004, S16-005, S16-006, S16-007, S16-008
**Описание:** Создать Claude skill с правилами и шаблонами, которые AI должен соблюдать при любой работе с проектом. Создаётся ПОСЛЕ рефакторинга, чтобы документировать новые паттерны.
**Действия:**
- Создать `.agent/skills/startup-copilot-dev/SKILL.md` с секциями:
  - AI Tool creation: definition + execute → registry.ts → prompt update
  - Page creation: Suspense + error.tsx + loading.tsx + getAuthenticatedUser()
  - Server Actions: "use server" + auth helper + error handling
  - Migrations: нумерация NNN_, RLS policies, IF NOT EXISTS
  - Gamification: всегда gamificationAction(), никогда awardXP() напрямую
  - Dates/Timezone: getUserToday(tz), никогда raw new Date()
  - Styling: Tailwind utilities, никогда inline style с CSS vars
  - JSONB: toJsonb/fromJsonb helpers, структура artifacts
  - Testing: __tests__/ рядом с модулем, happy path + edge case
  - Project data model: progress_data, artifacts, stages
- Создать reference-файлы:
  - `references/tool-template.ts` — шаблон нового AI tool
  - `references/page-template.tsx` — шаблон страницы с Suspense
  - `references/migration-template.sql` — шаблон миграции с RLS
- Указать trigger words: любая работа с .ts/.tsx файлами в проекте
**Файлы:**
- `.agent/skills/startup-copilot-dev/SKILL.md` [NEW]
- `.agent/skills/startup-copilot-dev/references/tool-template.ts` [NEW]
- `.agent/skills/startup-copilot-dev/references/page-template.tsx` [NEW]
- `.agent/skills/startup-copilot-dev/references/migration-template.sql` [NEW]
**Критерии приёмки:**
- [ ] SKILL.md содержит чеклист для каждого типа задачи
- [ ] Reference-шаблоны актуальны (используют registry, auth helpers, etc.)
- [ ] Trigger words активируют скилл при работе с кодом проекта
