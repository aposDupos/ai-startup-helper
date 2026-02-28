# Sprint 06 — Полировка + Запуск (Август 2026, ~2 недели)

**Секция плана:** `.backlog/mvp/v1/sections/section-06-polish-launch.md`
**Цель:** Готовность к production.
**Зависимости:** Sprint 01–05 завершены.

---

## Задачи

### S06-001: E2E тесты (Playwright)
**Статус:** [ ]
**Зависимости:** все предыдущие спринты
**Описание:** E2E тесты для критических user flows.
**Действия:**
- `npm install -D @playwright/test`
- Создать `playwright.config.ts`
- Тесты:
  - `e2e/registration.spec.ts` — Регистрация → Onboarding → Dashboard
  - `e2e/ai-chat.spec.ts` — Чат → Сообщение → Streaming ответ
  - `e2e/bmc.spec.ts` — BMC → Sticky note → AI подсказка
  - `e2e/academy.spec.ts` — Урок → Квиз → XP
  - `e2e/pitch.spec.ts` — Pitch Deck → Тренажёр
**Критерии приёмки:**
- [ ] 5+ E2E тестов проходят
- [ ] CI: тесты запускаются на каждый PR

---

### S06-002: Оптимизация производительности
**Статус:** [ ]
**Зависимости:** все предыдущие спринты
**Описание:** Lighthouse > 80 для всех страниц.
**Действия:**
- Lazy loading для тяжёлых компонентов (BMC, Pitch, VPC)
- Image optimization (next/image)
- Bundle analysis + code splitting
- Preload critical fonts
- Supabase query optimization (индексы)
**Критерии приёмки:**
- [ ] Lighthouse Performance > 80
- [ ] LCP < 2.5s
- [ ] Bundle size < 200KB (initial)

---

### S06-003: Мобильная адаптивность (финальная)
**Статус:** [ ]
**Зависимости:** все предыдущие спринты
**Описание:** Проверить и доработать responsive на 375px, 768px, 1024px.
**Действия:**
- Проверить все страницы на 375px (iPhone)
- Dashboard: single column
- BMC: accordion на мобильном
- Chat: full-screen
- Leaderboard: упрощённая таблица
**Критерии приёмки:**
- [ ] Все страницы корректны на 375px
- [ ] Все страницы корректны на 768px
- [ ] Bottom nav работает на мобильном

---

### S06-004: Юридика — ToS, Privacy
**Статус:** [ ]
**Зависимости:** —
**Описание:** Юридические документы.
**Действия:**
- Создать `src/app/legal/terms/page.tsx` — Пользовательское соглашение
- Создать `src/app/legal/privacy/page.tsx` — Политика конфиденциальности
- Добавить ссылки в footer и при регистрации
- Disclaimer: AI-советы не являются профессиональными
**Критерии приёмки:**
- [ ] ToS и Privacy Policy доступны по URL
- [ ] Ссылки есть в footer и при регистрации
- [ ] Disclaimer о AI видим при использовании чата

---

### S06-005: Аналитика (PostHog)
**Статус:** [ ]
**Зависимости:** — + POSTHOG_KEY
**Описание:** Настройка event tracking.
**Действия:**
- `npm install posthog-js`
- Создать `src/lib/analytics/posthog.ts` — инициализация
- Создать `src/lib/analytics/events.ts` — типизированные события
- Трекать: registration, onboarding, chat, idea_saved, bmc, lesson, xp, achievement
**Критерии приёмки:**
- [ ] PostHog инициализируется
- [ ] Ключевые события трекаются
- [ ] Funnels настроены в PostHog UI

---

### S06-006: Сезонный челлендж
**Статус:** [ ]
**Зависимости:** S04-001
**Описание:** «Стартап за 2 недели» — launch challenge.
**Действия:**
- Создать запись в `challenges` с criteria
- Бейдж «Первопроходец» + 500 XP
- Banner на dashboard
**Критерии приёмки:**
- [ ] Челлендж отображается на dashboard
- [ ] Прогресс трекается
- [ ] Бейдж выдаётся при завершении

---

### S06-007: Production deployment
**Статус:** [ ]
**Зависимости:** все
**Описание:** Деплой в production.
**Действия:**
- Настроить Vercel project (или Sber Cloud)
- Environment variables в production
- Supabase production project
- Применить все миграции
- Загрузить seed data
- DNS + SSL
- Error monitoring (Sentry)
**Критерии приёмки:**
- [ ] Приложение доступно по домену
- [ ] Все функции работают в production
- [ ] Sentry ловит ошибки
- [ ] Бэкапы PostgreSQL настроены
