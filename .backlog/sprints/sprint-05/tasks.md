# Sprint 05 — Pitch + RAG (Июль 2026, ~3 недели)

**Секция плана:** `.backlog/mvp/v1/sections/section-05-pitch-rag.md`
**Цель:** Полный путь до питча, RAG для качества AI.
**Зависимости:** Sprint 01–03 завершены (BMC данные нужны для Pitch Deck).

---

## Задачи

### S05-001: Миграция БД — pitch_decks
**Статус:** [ ]
**Зависимости:** S01-005
**Описание:** Таблица для Pitch Deck данных.
**Действия:**
- Создать `supabase/migrations/005_pitch_decks.sql`
- Таблица `pitch_decks`: id, project_id, slides (JSONB), template, created_at, updated_at
- RLS policies
**Критерии приёмки:**
- [ ] Миграция применяется
- [ ] RLS: владелец проекта имеет полный доступ

---

### S05-002: Pitch Deck Wizard UI
**Статус:** [ ]
**Зависимости:** S05-001
**Описание:** Wizard для создания Pitch Deck из 10 слайдов.
**Действия:**
- Создать `src/app/(main)/workspace/pitch/page.tsx`
- Создать `src/components/workspace/PitchDeckWizard.tsx` — step-by-step wizard
- Создать `src/components/workspace/PitchSlide.tsx` — отдельный слайд
- 10 слайдов: Обложка, Проблема, Решение, Рынок, Продукт, Бизнес-модель, Конкуренты, Юнит-экономика, Команда, Roadmap
- На каждом шаге: AI предлагает текст, пользователь редактирует
- Данные из BMC подтягиваются автоматически (слайд 6)
**Критерии приёмки:**
- [ ] 10 шагов wizard работают
- [ ] AI генерирует контент для каждого слайда
- [ ] BMC данные автоматически заполняют слайд бизнес-модели
- [ ] Данные сохраняются в `pitch_decks.slides`

---

### S05-003: Тренажёр питча
**Статус:** [ ]
**Зависимости:** S05-002
**Описание:** AI играет роль инвестора и задаёт вопросы.
**Действия:**
- Создать `src/app/(main)/workspace/pitch/trainer/page.tsx`
- Создать `src/components/workspace/PitchTrainer.tsx` — чат-интерфейс тренажёра
- Создать `src/components/workspace/PitchFeedback.tsx` — фидбэк после сессии
- Обновить `src/lib/ai/agents/pitch.ts` — PitchAgent в режиме «инвестор»
- 5–10 раундов Q&A → фидбэк по 5 критериям
**Критерии приёмки:**
- [ ] AI задаёт вопросы как инвестор
- [ ] 5–10 раундов Q&A
- [ ] Фидбэк: оценки по 5 критериям + рекомендации
- [ ] Результаты сохраняются

---

### S05-004: Экспорт Pitch Deck в PDF
**Статус:** [ ]
**Зависимости:** S05-002
**Описание:** Красивый PDF-экспорт Pitch Deck.
**Действия:**
- Создать `src/lib/export/pitch-pdf.ts`
- Шаблон: каждый слайд — страница, сберовские цвета
- API route: `src/app/api/export/pitch/route.ts`
**Критерии приёмки:**
- [ ] PDF генерируется с 10 слайдами
- [ ] Визуально привлекательный документ
- [ ] Скачивается по клику

---

### S05-005: Полный RAG pipeline
**Статус:** [ ]
**Зависимости:** S02-010
**Описание:** Расширить RAG: 10+ документов, оптимизация quality.
**Действия:**
- Создать `content/knowledge/*.md` — 10 документов базы знаний
- Обновить `src/lib/ai/rag/loader.ts` — chunking по заголовкам + recursive
- Обновить `src/lib/ai/rag/search.ts` — оптимизация: reranking, threshold
- Создать `scripts/seed-knowledge.ts` — загрузка всех документов
- Интегрировать RAG во все 5 AI-агентов
**Критерии приёмки:**
- [ ] 10+ документов загружены и проиндексированы
- [ ] Similarity search возвращает качественные результаты
- [ ] RAG интегрирован во все агенты
- [ ] Качество ответов заметно выше

---

### S05-006: Agent Tools — validation + mvp
**Статус:** [ ]
**Зависимости:** S02-004
**Описание:** Дополнительные tools для остальных этапов.
**Действия:**
- Создать `src/lib/ai/tools/simulate-custdev.ts` — симуляция CustDev
- Создать `src/lib/ai/tools/analyze-competitors.ts` — анализ конкурентов
- Создать `src/lib/ai/tools/recommend-nocode.ts` — рекомендация No-code
- Создать `src/lib/ai/tools/generate-user-stories.ts` — user stories
- Обновить validation и mvp агентов
**Критерии приёмки:**
- [ ] Все tools вызываются через function calling
- [ ] CustDev симуляция генерирует реалистичные ответы
- [ ] User stories генерируются в правильном формате
