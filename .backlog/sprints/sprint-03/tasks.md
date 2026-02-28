# Sprint 03 — Workspace (Май 2026, ~3 недели)

**Секция плана:** `.backlog/mvp/v1/sections/section-03-workspace.md`
**Цель:** Интерактивные бизнес-инструменты: BMC, VPC, юнит-экономика, dashboard.
**Зависимости:** Sprint 01–02 завершены.

---

## Задачи

### S03-001: BMC Canvas — интерактивная сетка
**Статус:** [ ]
**Зависимости:** S01-005
**Описание:** Business Model Canvas с 9 блоками и sticky notes.
**Действия:**
- Создать `src/app/(main)/workspace/bmc/page.tsx`
- Создать `src/components/workspace/BMCCanvas.tsx` — CSS Grid 9 блоков
- Создать `src/components/workspace/BMCBlock.tsx` — отдельный блок
- Создать `src/components/workspace/StickyNote.tsx` — заметка (add/edit/delete)
- Drag-and-drop между блоками (dnd-kit)
- JSONB в `projects.bmc_data` — автосохранение
**Критерии приёмки:**
- [ ] 9 блоков BMC отображаются в правильной сетке
- [ ] Sticky notes: добавление, редактирование, удаление
- [ ] Drag-and-drop между блоками
- [ ] Auto-save в `projects.bmc_data`
- [ ] Responsive: scroll на мобильном

---

### S03-002: BMC — AI-подсказки
**Статус:** [ ]
**Зависимости:** S03-001, S02-005
**Описание:** AI генерирует подсказки для каждого блока BMC.
**Действия:**
- Создать `src/components/workspace/BMCSuggestionPanel.tsx`
- Создать `src/lib/ai/agents/business-model.ts` — BMCAgent с tools
- Tool: `suggest_bmc_block` — генерирует 3 предложения для выбранного блока
- Tool: `fill_bmc_block` — добавляет предложение как sticky note
- Контекст: текущий проект + заполненные блоки
**Критерии приёмки:**
- [ ] При клике на блок → AI предлагает 3 варианта
- [ ] «+Добавить» → sticky note создаётся в блоке
- [ ] AI учитывает уже заполненные блоки

---

### S03-003: Value Proposition Canvas
**Статус:** [ ]
**Зависимости:** S03-001
**Описание:** VPC с двумя секциями: Customer Profile и Value Map.
**Действия:**
- Создать `src/app/(main)/workspace/vpc/page.tsx`
- Создать `src/components/workspace/VPCCanvas.tsx`
- 6 зон: Gains, Pains, Jobs | Gain Creators, Pain Relievers, Products
- Sticky notes в каждой зоне
- Сохранение в `projects.vpc_data`
**Критерии приёмки:**
- [ ] VPC с 6 зонами отображается
- [ ] Sticky notes работают в каждой зоне
- [ ] Auto-save в `projects.vpc_data`

---

### S03-004: Юнит-экономика калькулятор
**Статус:** [ ]
**Зависимости:** S01-005
**Описание:** Интерактивный калькулятор юнит-экономики.
**Действия:**
- Создать `src/app/(main)/workspace/unit-economics/page.tsx`
- Создать `src/components/workspace/UnitEconomicsCalc.tsx`
- Поля: CAC, LTV, ARPU, Churn, Payback Period
- Автоматический расчёт при изменении полей
- Визуализация: прибыльность vs убыточность
- Сохранение в `projects.unit_economics`
**Критерии приёмки:**
- [ ] Все поля рассчитываются автоматически
- [ ] LTV/CAC ratio визуализируется (зелёный если > 3)
- [ ] Данные сохраняются в `projects.unit_economics`

---

### S03-005: Dashboard — обновление с прогрессом
**Статус:** [ ]
**Зависимости:** S01-011, S03-001
**Описание:** Обновить dashboard: прогресс по BMC, VPC, проект.
**Действия:**
- Обновить `src/app/(main)/dashboard/page.tsx`
- Добавить: процент заполнения BMC (X/9 блоков)
- Добавить: процент заполнения VPC
- Добавить: AI-рекомендация «Что дальше?»
- Добавить: список последних проектов
**Критерии приёмки:**
- [ ] BMC completion показывает X/9
- [ ] AI рекомендация отображается
- [ ] Быстрые ссылки на workspace tools

---

### S03-006: Экспорт BMC в PDF
**Статус:** [ ]
**Зависимости:** S03-001
**Описание:** Экспорт BMC в красивый PDF-документ.
**Действия:**
- `npm install @react-pdf/renderer`
- Создать `src/lib/export/bmc-pdf.ts` — генерация PDF
- Шаблон: сетка 9 блоков, sticky notes, логотип StartupCopilot
- API route: `src/app/api/export/bmc/route.ts`
- Кнопка «Скачать PDF» на странице BMC
**Критерии приёмки:**
- [ ] PDF генерируется с корректной сеткой BMC
- [ ] Sticky notes читаемы в PDF
- [ ] Файл скачивается по клику

---

### S03-007: Workspace navigation
**Статус:** [ ]
**Зависимости:** S03-001, S03-003, S03-004
**Описание:** Навигация между инструментами workspace.
**Действия:**
- Создать `src/app/(main)/workspace/page.tsx` — hub с карточками инструментов
- Карточки: BMC, VPC, Юнит-экономика, (будущее: Pitch Deck)
- Каждая карточка: иконка + описание + прогресс
**Критерии приёмки:**
- [ ] Hub показывает все доступные инструменты
- [ ] Прогресс заполнения отображается на каждой карточке
- [ ] Навигация к каждому инструменту работает
