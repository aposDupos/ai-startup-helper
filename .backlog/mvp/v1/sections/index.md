<!-- SECTION_MANIFEST
section-01-foundation
section-02-ai-core
section-03-guided-journey
section-04-workspace-learning
section-05-pitch-gamification-rag
section-06-polish-launch
END_MANIFEST -->

# Индекс секций реализации

## Граф зависимостей

| Секция | Зависит от | Блокирует | Параллелизация |
|--------|-----------|-----------|----------------|
| section-01-foundation | — | всё | Да |
| section-02-ai-core | 01 | 03, 04, 05 | Нет |
| section-03-guided-journey | 01, 02 | 04, 05, 06 | Нет |
| section-04-workspace-learning | 01, 02, 03 | 05, 06 | Да |
| section-05-pitch-gamification-rag | 01, 02, 03, 04 | 06 | Нет |
| section-06-polish-launch | 01–05 | — | Нет |

## Порядок выполнения

1. **section-01-foundation** ✅
2. **section-02-ai-core** ✅
3. **section-03-guided-journey** (Journey Map, entry points, checklists, contextual chat)
4. **section-04-workspace-learning** (BMC, VPC, юнит-экономика + inline-уроки)
5. **section-05-pitch-gamification-rag** (Pitch Deck, тренажёр, XP, badges, RAG)
6. **section-06-polish-launch** (E2E, perf, mobile, юридика, deploy)

## Описания секций

### section-01-foundation ✅
Инициализация проекта, настройка стека (Next.js, Tailwind, Supabase), авторизация, onboarding, GigaChat PoC, CI/CD.

### section-02-ai-core ✅
GigaChat через langchain-gigachat SDK, AI-чат со streaming, system prompts, tool calling (save_idea, evaluate_ice), RAG (Edge Functions + pgvector), observability.

### section-03-guided-journey
**Journey Map** — горизонтальная игровая дорожка стадий. Паспорт проекта, 4 entry points (нет идеи / есть идея / есть проект / учиться), чеклисты по стадиям, contextual chat, AI auto-detection стадии, team section (лайт).

### section-04-workspace-learning
**Full-page инструменты** (BMC Canvas, VPC, юнит-экономика) с «← Назад к карте». **Inline-уроки** встроены в чеклисты стадий (не отдельный раздел Academy). 10 мини-уроков с квизами. PDF экспорт BMC.

### section-05-pitch-gamification-rag
Pitch Deck Wizard (10 слайдов), тренажёр питча (AI = инвестор), PDF экспорт. XP-система, levels, badges (15+), стрики, лидерборд. Полный RAG pipeline (10+ документов).

### section-06-polish-launch
E2E тестирование (Playwright), оптимизация производительности, мобильная адаптивность, юридика (152-ФЗ, ToS), аналитика (PostHog), production deployment.
