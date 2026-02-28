# Sprint 04 — Workspace + Learning (Июнь 2026, ~4 недели)

**Цель:** Бизнес-инструменты (full-page) + inline-уроки в контексте стадий.
**Зависимости:** Sprint 03 (Journey Map) завершён.
**Архитектура:** Full-page инструменты с кнопкой «← Назад к карте». Уроки встроены в чеклисты.

---

## Workspace (full-page инструменты)

### S04-001: BMC Canvas + AI-подсказки
**Статус:** [ ]
**Зависимости:** S03-003
**Описание:** Business Model Canvas (9 блоков) на отдельной странице.
**Действия:**
- Создать `src/app/(main)/workspace/bmc/page.tsx` — full-page с «← Назад к карте»
- Создать `src/components/workspace/BMCCanvas.tsx` — CSS Grid 9 блоков
- Создать `src/components/workspace/BMCBlock.tsx` — отдельный блок
- Создать `src/components/workspace/StickyNote.tsx` — заметка (add/edit/delete)
- Создать `src/components/workspace/BMCSuggestionPanel.tsx` — AI подсказки
- Drag-and-drop между блоками (dnd-kit)
- Autosave в `projects.bmc_data` JSONB
- **При заполнении → обновлять `progress_data.bmc` (X/9 блоков)**
**Критерии приёмки:**
- [ ] 9 блоков BMC в правильной сетке
- [ ] Sticky notes: CRUD
- [ ] Drag-and-drop между блоками
- [ ] AI генерирует 3 подсказки для выбранного блока
- [ ] Auto-save + progress_data обновляется
- [ ] «← Назад к карте» возвращает на Dashboard

---

### S04-002: VPC Canvas
**Статус:** [ ]
**Зависимости:** S04-001
**Описание:** Value Proposition Canvas (6 зон) на отдельной странице.
**Действия:**
- Создать `src/app/(main)/workspace/vpc/page.tsx`
- Создать `src/components/workspace/VPCCanvas.tsx`
- 6 зон: Gains, Pains, Jobs | Gain Creators, Pain Relievers, Products
- Sticky notes в каждой зоне
- Autosave в `projects.vpc_data` JSONB
- Обновление `progress_data.bmc` при заполнении
**Критерии приёмки:**
- [ ] VPC с 6 зонами
- [ ] Sticky notes
- [ ] Auto-save + progress_data

---

### S04-003: Юнит-экономика калькулятор
**Статус:** [ ]
**Зависимости:** S03-003
**Описание:** Интерактивный калькулятор на отдельной странице.
**Действия:**
- Создать `src/app/(main)/workspace/unit-economics/page.tsx`
- Создать `src/components/workspace/UnitEconomicsCalc.tsx`
- Поля: CAC, LTV, ARPU, Churn, Payback Period
- Автоматический расчёт + визуализация (LTV/CAC ratio)
- Autosave в `projects.unit_economics` JSONB
**Критерии приёмки:**
- [ ] Все поля рассчитываются автоматически
- [ ] LTV/CAC ratio визуализируется (зелёный если > 3)
- [ ] Auto-save + progress_data

---

### S04-004: Экспорт BMC в PDF
**Статус:** [ ]
**Зависимости:** S04-001
**Описание:** PDF-экспорт Business Model Canvas.
**Действия:**
- `npm install @react-pdf/renderer`
- Создать `src/lib/export/bmc-pdf.ts`
- Кнопка «Скачать PDF» на странице BMC
**Критерии приёмки:**
- [ ] PDF с 9 блоками BMC
- [ ] Sticky notes читаемы
- [ ] Скачивается по клику

---

## Learning (inline-уроки)

### S04-005: Миграция — lessons
**Статус:** [ ]
**Зависимости:** S03-001
**Описание:** Таблица для уроков (упрощённая, без модулей).
**Действия:**
- Создать `supabase/migrations/005_lessons.sql`
- Таблица `lessons`: id, stage (idea/validation/bmc/mvp/pitch), title, content (JSONB), quiz (JSONB), duration_min, audience (all/school/university), sort_order
- Таблица `user_lesson_progress`: user_id, lesson_id, status, completed_at, score
- Связать `stage_checklists.linked_lesson_id` → `lessons.id`
- RLS policies
**Критерии приёмки:**
- [ ] Таблицы созданы
- [ ] RLS: пользователь видит свой прогресс

---

### S04-006: Seed — 10 мини-уроков
**Статус:** [ ]
**Зависимости:** S04-005
**Описание:** Контент для 10 уроков по стадиям.
**Действия:**
- Создать `scripts/seed-lessons.ts`
- 2 урока на стадию:
  - Идея: «Как найти идею стартапа», «ICE-оценка идеи»
  - Валидация: «Что такое CustDev», «Как проверять гипотезы»
  - Бизнес-модель: «Введение в BMC», «Юнит-экономика для начинающих»
  - MVP: «Lean MVP подход», «No-code инструменты»
  - Питч: «Структура питч-дека», «Как говорить с инвесторами»
- Формат JSONB: heading, paragraph, callout, quiz
**Критерии приёмки:**
- [ ] 10 уроков загружены
- [ ] Каждый урок имеет quiz

---

### S04-007: InlineLesson + QuizWidget
**Статус:** [ ]
**Зависимости:** S04-006
**Описание:** Карточка урока, встраиваемая в чеклист стадии.
**Действия:**
- Создать `src/components/learning/InlineLesson.tsx` — компактная карточка (свернуть/развернуть)
- Создать `src/components/learning/LessonContent.tsx` — рендеринг JSONB-контента
- Создать `src/components/learning/QuizWidget.tsx` — интерактивный квиз
- При завершении: mark completed + award XP (заготовка)
**Критерии приёмки:**
- [ ] Урок разворачивается inline в чеклисте
- [ ] Контент рендерится (heading, paragraph, callout)
- [ ] Квиз работает: выбор → проверка → результат
- [ ] При завершении: progress + checklist item ✅
