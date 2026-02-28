# Секция 06: Полировка и запуск

## Контекст

Финальная секция — подготовка платформы StartupCopilot к production-запуску. Включает E2E тестирование, оптимизацию, юридические документы, аналитику и деплой.

## Требования

1. E2E тестирование полного user flow
2. Оптимизация производительности (Lighthouse > 80)
3. Мобильная адаптивность
4. Юридика: ToS, Privacy Policy, 152-ФЗ
5. Аналитика (PostHog)
6. Нагрузочное тестирование
7. Production deployment

## Зависимости

- **Требует:** все предыдущие секции (01–05)
- **Блокирует:** —

## Детали реализации

### 6.1 E2E тестирование (Playwright)

Критические user flows:
```typescript
// e2e/registration.spec.ts
// Регистрация → Onboarding → Dashboard

// e2e/ai-chat.spec.ts
// Открыть чат → Отправить сообщение → Получить streaming ответ → Сохранить идею

// e2e/bmc.spec.ts
// Открыть BMC → Добавить sticky note → AI подсказка → Экспорт PDF

// e2e/academy.spec.ts
// Открыть урок → Пройти → Квиз → Получить XP → Проверить уровень

// e2e/pitch.spec.ts
// Создать Pitch Deck → Пройти тренажёр → Получить фидбэк

// e2e/gamification.spec.ts
// Выполнить действие → XP начислен → Бейдж получен → Лидерборд обновлён
```

### 6.2 Оптимизация

- **Lighthouse:** Performance > 80, Accessibility > 80
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Оптимизации:**
  - Lazy loading для тяжёлых компонентов (BMC, Pitch Deck)
  - Image optimization (next/image)
  - Bundle analysis и code splitting
  - Preload critical fonts (Inter/Roboto)
  - Суpabase query optimization (индексы, eager loading)

### 6.3 Мобильная адаптивность

Breakpoints: 375px (мобильный), 768px (планшет), 1024px+ (десктоп)

Ключевые адаптации:
- Dashboard: single column на мобильном
- BMC: horizontal scroll или accordion-режим
- Chat: full-screen на мобильном
- Leaderboard: упрощённая таблица
- Navigation: нижняя навигационная панель (mobile)

### 6.4 Юридика

Документы:
- **Terms of Service** (Пользовательское соглашение) — на русском
- **Privacy Policy** (Политика конфиденциальности) — 152-ФЗ compliant
- **Cookie Policy**
- **Disclaimer:** AI-советы не являются профессиональными рекомендациями
- **Согласие на обработку ПД** — включая несовершеннолетних (с согласия родителей)

Размещение: `/legal/terms`, `/legal/privacy`, `/legal/cookies`

### 6.5 Аналитика (PostHog)

Ключевые events:
- `user_registered` — с атрибутами role, city
- `onboarding_completed` — с experience_level
- `chat_message_sent` — с stage
- `idea_saved` — с ICE score
- `bmc_block_filled` — с block_name
- `lesson_completed` — с lesson_id, quiz_score
- `xp_earned` — с amount, source
- `achievement_earned` — с slug
- `pitch_deck_exported` — формат
- `pitch_trainer_completed` — с scores

Funnels:
- Registration → Onboarding → First Chat → First Idea → BMC → Pitch
- Lesson Start → Quiz → Complete

### 6.6 Нагрузочное тестирование

Инструмент: k6 или Artillery

Сценарии:
- 100 concurrent users: chat messages
- 1000 concurrent users: page loads
- 50 concurrent users: BMC save operations
- GigaChat API: rate limiting behavior under load

### 6.7 Production Deployment

Чеклист:
- [ ] Environment variables настроены (GIGACHAT_*, SUPABASE_*, POSTHOG_*)
- [ ] Supabase production project создан
- [ ] Миграции применены
- [ ] Seed data загружены (levels, achievements, lessons, knowledge base)
- [ ] DNS настроен
- [ ] SSL сертификат
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy для PostgreSQL
- [ ] Rate limiting на API routes

### 6.8 Сезонный челлендж к запуску

«Стартап за 2 недели» — первый челлендж для привлечения пользователей:
- Цель: пройти все 5 этапов за 14 дней
- Награда: эксклюзивный бейдж «Первопроходец» + 500 XP
- Промо: анонс в Telegram, TikTok, VK

## Критерии приёмки

- [ ] Все E2E тесты проходят на CI
- [ ] Lighthouse Performance > 80 для всех основных страниц
- [ ] UI корректно отображается на 375px, 768px, 1024px
- [ ] ToS и Privacy Policy размещены и доступны
- [ ] PostHog: события трекаются, funnels настроены
- [ ] Нагрузочный тест: 100 concurrent users без ошибок
- [ ] Production deploy успешен, приложение доступно по домену
- [ ] Сезонный челлендж настроен и активен

## Файлы для создания/изменения

- `e2e/*.spec.ts` — E2E тесты (6+ файлов)
- `playwright.config.ts` — Конфигурация Playwright
- `src/app/legal/terms/page.tsx` — Terms of Service
- `src/app/legal/privacy/page.tsx` — Privacy Policy
- `src/lib/analytics/posthog.ts` — PostHog клиент
- `src/lib/analytics/events.ts` — Типизированные события
- `k6/load-test.js` — Нагрузочные тесты
- `.env.production` — Production переменные
- `sentry.client.config.ts` — Sentry клиент
