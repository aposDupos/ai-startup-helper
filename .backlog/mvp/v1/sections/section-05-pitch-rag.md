# Секция 05: Pitch + RAG

## Контекст

Финальный этап пути стартапера — подготовка питча. Эта секция реализует генератор Pitch Deck, тренажёр питча (AI как инвестор) и полноценный RAG pipeline с промодерированной базой знаний стартап-методологий.

## Требования

1. Генератор Pitch Deck (шаблон + AI-заполнение)
2. Тренажёр питча: AI играет роль инвестора
3. Экспорт Pitch Deck в PDF
4. Полноценный RAG pipeline с 10+ документами
5. Интеграция RAG во все AI-агенты

## Зависимости

- **Требует:** section-01, section-02 (AI Core, min RAG), section-03 (BMC данные для pitch deck)
- **Блокирует:** section-06

## Детали реализации

### 5.1 Pitch Deck генератор

Шаблон из 10 слайдов (стандарт для стартапа):

| Слайд | Содержание | Источник данных |
|-------|-----------|----------------|
| 1. Обложка | Название проекта, команда | projects.title |
| 2. Проблема | Описание проблемы | AI генерация |
| 3. Решение | Описание решения | AI генерация |
| 4. Рынок | TAM, SAM, SOM | AI + ручной ввод |
| 5. Продукт | Скриншоты / описание MVP | Загрузка пользователем |
| 6. Бизнес-модель | Из BMC | projects.bmc_data |
| 7. Конкуренты | Сравнительная таблица | AI генерация |
| 8. Юнит-экономика | CAC, LTV, Payback | projects.unit_economics |
| 9. Команда | Участники | profiles |
| 10. Roadmap | План + запрос | AI генерация |

**UI:** форма-wizard, на каждом шаге AI предлагает текст, пользователь редактирует.

Данные хранятся в новой таблице:
```sql
CREATE TABLE pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  slides JSONB NOT NULL, -- [{slide_number, title, content, notes}]
  template TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Тренажёр питча

AI играет роль инвестора и задаёт вопросы:

**Flow:**
1. Пользователь загружает/выбирает pitch deck
2. AI генерирует opening question
3. Пользователь отвечает текстом
4. AI задаёт follow-up (типичные вопросы инвесторов)
5. После 5–10 раундов → AI даёт фидбэк:
   - Оценка по 5 критериям (ясность, убедительность, данные, энергия, готовность)
   - Сильные стороны
   - Что улучшить
   - Типичные ошибки, которые были замечены

**System prompt для PitchAgent (инвестор-режим):**
```
Ты — опытный российский венчурный инвестор. Ты проводишь предварительную встречу 
с командой стартапа. Задавай вопросы как настоящий инвестор: чётко, конкретно, 
иногда каверзно. Не будь агрессивным, но будь требовательным.

Типичные вопросы:
- Почему именно вы? Что делает вашу команду уникальной?
- Какие метрики у вас сейчас?
- Кто ваши конкуренты и чем вы лучше?
- Как вы планируете масштабироваться?
- Сколько денег вам нужно и на что?
```

### 5.3 Полноценный RAG Pipeline

Расширение минимального RAG из section-02:

**Документы для базы знаний:**
1. Lean Startup (основные концепции)
2. Business Model Generation (BMC)
3. Value Proposition Design
4. JTBD Framework
5. CustDev методология (Steve Blank)
6. Юнит-экономика для стартапов
7. Как делать питч (структура, ошибки)
8. Правовые основы стартапа в РФ (ИП, ООО, налоги)
9. Гранты и программы поддержки (ПУТП, Росмолодёжь, ФСИ)
10. No-code инструменты для MVP

**Pipeline:**
```
Markdown документ
  ↓ split_by_headers + recursive_character (chunk_size=500, overlap=50)
  ↓ GigaChat embeddings (или multilingual-e5-large)
  ↓ INSERT INTO knowledge_chunks (content, embedding)
  ↓ При запросе: embed(query) → cosine similarity → top-5 chunks
  ↓ Inject in context: "Используя следующую информацию: {chunks}"
```

**Скрипт загрузки:**
```typescript
// scripts/seed-knowledge.ts
// Загрузка markdown файлов из /content/knowledge/
// Chunking → embedding → insert в knowledge_chunks
```

### 5.4 Экспорт PDF

Pitch Deck → PDF с красивым оформлением:
- Шаблон со сберовскими цветами (зелёный + белый)
- Каждый слайд — отдельная страница
- Заголовок + контент + заметки спикера
- Генерация через `@react-pdf/renderer`

## Критерии приёмки

- [ ] Pitch Deck wizard генерирует 10 слайдов с AI-заполнением
- [ ] Данные из BMC автоматически подтягиваются в слайды бизнес-модели
- [ ] Тренажёр питча работает: AI задаёт 5+ вопросов, даёт фидбэк
- [ ] Экспорт Pitch Deck в PDF создаёт корректный документ
- [ ] RAG: загружено 10+ документов, similarity search работает
- [ ] RAG интегрирован во все AI-агенты (idea, validation, bmc, mvp, pitch)
- [ ] Качество AI-ответов заметно выше с RAG (субъективная оценка)

## Файлы для создания/изменения

- `src/app/(main)/workspace/pitch/page.tsx` — Pitch Deck Builder
- `src/app/(main)/workspace/pitch/trainer/page.tsx` — Тренажёр
- `src/components/workspace/PitchDeckWizard.tsx` — Wizard
- `src/components/workspace/PitchSlide.tsx` — Слайд
- `src/components/workspace/PitchTrainer.tsx` — Тренажёр UI
- `src/components/workspace/PitchFeedback.tsx` — Фидбэк
- `src/lib/ai/agents/pitch.ts` — PitchAgent (обновление)
- `src/lib/ai/rag/pipeline.ts` — Полный RAG pipeline
- `src/lib/ai/rag/loader.ts` — Загрузка документов
- `src/lib/export/pitch-pdf.ts` — Экспорт PDF
- `content/knowledge/*.md` — Документы базы знаний
- `scripts/seed-knowledge.ts` — Скрипт загрузки RAG
- `supabase/migrations/005_pitch_decks.sql` — Таблица pitch_decks
