# Секция 03: Workspace (BMC + Dashboard)

## Контекст

Рабочее пространство проекта включает интерактивный Business Model Canvas, Value Proposition Canvas, калькулятор юнит-экономики и Startup Dashboard для визуализации прогресса.

## Требования

1. Интерактивный BMC с 9 блоками и drag-and-drop sticky notes
2. AI-подсказки для каждого блока BMC (через AI Core)
3. Value Proposition Canvas (VPC)
4. Калькулятор юнит-экономики
5. Dashboard с прогресс-баром стадий и AI-рекомендациями
6. Экспорт BMC/VPC в PDF

## Зависимости

- **Требует:** section-01 (auth, DB), section-02 (AI agents, tools)
- **Блокирует:** section-05 (pitch deck зависит от BMC данных), section-06

## Детали реализации

### 3.1 Business Model Canvas UI

9 блоков (Osterwalder):
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

Каждый блок:
- Заголовок с иконкой
- Список sticky notes (добавление, редактирование, удаление, drag-and-drop)
- Кнопка «AI-подсказка» → запрос к BusinessModelAgent → вставка результата
- Цветовая кодировка по степени заполненности

Данные хранятся в `projects.bmc_data` (JSONB):
```json
{
  "customer_segments": [
    { "id": "uuid", "text": "Студенты 18-25 лет в крупных городах", "color": "#FFE082" }
  ],
  "value_propositions": [...],
  ...
}
```

### 3.2 AI-подсказки для BMC

Интеграция с `BusinessModelAgent`:
- При нажатии «AI-подсказка» отправляется запрос с текущим контекстом проекта + текущий блок
- AI возвращает 2–3 варианта sticky notes для блока
- Пользователь может принять/отклонить/отредактировать

### 3.3 Value Proposition Canvas

Два сегмента:
- **Customer Profile:** Jobs, Pains, Gains
- **Value Map:** Products & Services, Pain Relievers, Gain Creators

Данные в `projects.vpc_data` (JSONB).

### 3.4 Калькулятор юнит-экономики

Поля:
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- ARPU (Average Revenue Per User)
- Churn Rate
- Payback Period

AI помогает заполнить значения на основе данных из BMC. Визуализация: карточки с метриками + графики.

### 3.5 Startup Dashboard

Основной экран `/dashboard`:
- **StageProgressBar** — 5 этапов стартапа, текущий подсвечен
- **ProjectCard** — текущий активный проект с метриками
- **QuestCard** — список квестов/заданий на текущем этапе
- **RecommendationPanel** — AI-рекомендации «что дальше» (на основе текущего stage и заполненности данных)
- **XPBadge + StreakCounter** — геймификация (из section-04)

### 3.6 Экспорт PDF

Библиотека: `@react-pdf/renderer` или `jspdf` + `html2canvas`
- Шаблон BMC с логотипом Сбера
- Данные из `bmc_data` + `vpc_data`
- Экспорт в PDF/PNG

## Критерии приёмки

- [ ] BMC отображает 9 блоков с возможностью добавления sticky notes
- [ ] Drag-and-drop sticky notes между блоками работает
- [ ] AI-подсказки возвращают релевантные варианты для каждого блока
- [ ] BMC данные сохраняются в JSONB и восстанавливаются при перезагрузке
- [ ] VPC работает аналогично BMC
- [ ] Калькулятор юнит-экономики считает LTV, CAC, Payback Period
- [ ] Dashboard показывает текущий прогресс и рекомендации
- [ ] Экспорт BMC в PDF генерирует корректный документ

## Файлы для создания/изменения

- `src/app/(main)/workspace/page.tsx` — Рабочее пространство
- `src/app/(main)/workspace/bmc/page.tsx` — BMC страница
- `src/app/(main)/workspace/vpc/page.tsx` — VPC страница
- `src/app/(main)/workspace/unit-economics/page.tsx` — Юнит-экономика
- `src/app/(main)/dashboard/page.tsx` — Dashboard
- `src/components/workspace/BMCCanvas.tsx` — Основной компонент BMC
- `src/components/workspace/BMCBlock.tsx` — Блок BMC
- `src/components/workspace/StickyNote.tsx` — Стикер
- `src/components/workspace/VPCCanvas.tsx` — VPC
- `src/components/workspace/UnitEconomicsCalc.tsx` — Калькулятор
- `src/components/dashboard/StageProgressBar.tsx` — Прогресс-бар
- `src/components/dashboard/QuestCard.tsx` — Квесты
- `src/components/dashboard/RecommendationPanel.tsx` — AI-рекомендации
- `src/lib/export/pdf.ts` — Экспорт в PDF
