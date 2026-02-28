<!-- SECTION_MANIFEST
section-01-foundation
section-02-ai-core
section-03-workspace
section-04-academy-gamification
section-05-pitch-rag
section-06-polish-launch
END_MANIFEST -->

# Индекс секций реализации

## Граф зависимостей

| Секция | Зависит от | Блокирует | Параллелизация |
|--------|-----------|-----------|----------------|
| section-01-foundation | — | всё | Да |
| section-02-ai-core | 01 | 03, 04, 05 | Нет |
| section-03-workspace | 01, 02 | 05, 06 | Да |
| section-04-academy-gamification | 01, 02 | 06 | Да |
| section-05-pitch-rag | 01, 02, 03 | 06 | Нет |
| section-06-polish-launch | 01–05 | — | Нет |

## Порядок выполнения

1. **section-01-foundation** (нет зависимостей)
2. **section-02-ai-core** (после 01)
3. **section-03-workspace**, **section-04-academy-gamification** (параллельно, после 02)
4. **section-05-pitch-rag** (после 02, 03)
5. **section-06-polish-launch** (финальная)

## Описания секций

### section-01-foundation
Инициализация проекта, настройка стека (Next.js, Tailwind, Supabase), авторизация, onboarding, GigaChat PoC, landing page, CI/CD.

### section-02-ai-core
Полноценная интеграция GigaChat, AI-чат со streaming, LLM-абстракция, агентное ядро, system prompts, tool calling, история сообщений, минимальный RAG, observability.

### section-03-workspace
Интерактивный Business Model Canvas, Value Proposition Canvas, юнит-экономика, Startup Dashboard с прогрессом по стадиям, экспорт артефактов.

### section-04-academy-gamification
Микро-уроки, квизы, контент для обучения. XP-система, уровни, бейджи, стрики, лидерборды, челленджи.

### section-05-pitch-rag
Генерация Pitch Deck, тренажёр питча (AI-инвестор), полноценный RAG pipeline с промодерированной базой знаний.

### section-06-polish-launch
E2E тестирование, оптимизация производительности, мобильная адаптивность, юридика (152-ФЗ, ToS), аналитика, нагрузочное тестирование, production deployment.
