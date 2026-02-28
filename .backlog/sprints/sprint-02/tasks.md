# Sprint 02 — AI Core (Апрель 2026, ~4 недели)

**Секция плана:** `.backlog/mvp/v1/sections/section-02-ai-core.md`
**Цель:** Рабочий AI-чат с GigaChat + минимальный RAG.
**Зависимости:** Sprint 01 завершён, GigaChat SDK PoC пройден (S01-009).

---

## Задачи

### S02-001: GigaChat config + инициализация
**Статус:** [ ]
**Зависимости:** S01-009
**Описание:** Создать конфигурацию GigaChat для production использования.
**Действия:**
- Создать `src/lib/ai/config.ts` — инициализация GigaChat через `langchain-gigachat`
- Создать `src/lib/ai/embeddings.ts` — GigaChatEmbeddings инициализация
- Настроить SSL для НУЦ Минцифры
- Error handling: retry logic, timeout, fallback responses
**Критерии приёмки:**
- [ ] `createGigaChatModel()` возвращает рабочий экземпляр
- [ ] `createEmbeddings()` работает для vector search
- [ ] Error handling: при недоступности API — graceful fallback

---

### S02-002: Миграция БД — conversations + messages + ai_logs
**Статус:** [ ]
**Зависимости:** S01-005
**Описание:** Таблицы для хранения истории чата и логов AI.
**Действия:**
- Создать `supabase/migrations/002_conversations_messages.sql`
- Таблица `conversations`: id, project_id, user_id, context_type, created_at
- Таблица `messages`: id, conversation_id, role, content, metadata (JSONB), created_at
- Таблица `ai_logs`: id, user_id, model, prompt_tokens, completion_tokens, latency_ms, error, created_at
- RLS policies
**Критерии приёмки:**
- [ ] Миграция применяется без ошибок
- [ ] RLS: пользователь видит только свои conversations
- [ ] ai_logs записываются и доступны только admin

---

### S02-003: System prompts для этапов
**Статус:** [ ]
**Зависимости:** —
**Описание:** Написать system prompts для каждого этапа стартапа.
**Действия:**
- Создать `src/lib/ai/prompts/base.ts` — общие правила тона и поведения
- Создать `src/lib/ai/prompts/idea-search.ts` — поиск идеи
- Создать `src/lib/ai/prompts/validation.ts` — валидация CustDev
- Создать `src/lib/ai/prompts/business-model.ts` — BMC
- Создать `src/lib/ai/prompts/mvp.ts` — планирование MVP
- Создать `src/lib/ai/prompts/pitch.ts` — питчинг
- Адаптация тона: школьник (дружелюбнее) vs студент (деловитее)
**Критерии приёмки:**
- [ ] Каждый prompt содержит: роль, контекст этапа, доступные tools, правила поведения
- [ ] Промпт адаптируется по role из profiles
- [ ] Тон не навязчивый, но поддерживающий

---

### S02-004: Agent Tools — save_idea + evaluate_ice
**Статус:** [ ]
**Зависимости:** S02-001
**Описание:** Первые два инструмента для AI-агента.
**Действия:**
- Создать `src/lib/ai/tools/save-idea.ts` — StructuredTool: сохраняет идею в projects
- Создать `src/lib/ai/tools/evaluate-ice.ts` — StructuredTool: ICE-оценка (impact, confidence, ease)
- Zod-схемы для параметров
- Интеграция с Supabase для сохранения
**Критерии приёмки:**
- [ ] `SaveIdeaTool` создаёт запись в `projects`
- [ ] `EvaluateICETool` возвращает `{impact, confidence, ease, rationale}`
- [ ] Оба tool вызываются через `model.bindTools()`

---

### S02-005: Base Agent + Router
**Статус:** [ ]
**Зависимости:** S02-003, S02-004
**Описание:** Базовый класс агента и маршрутизация по этапам.
**Действия:**
- Создать `src/lib/ai/agents/base-agent.ts` — абстрактный класс с model, tools, prompts
- Создать `src/lib/ai/agents/idea-search.ts` — IdeaSearchAgent
- Создать `src/lib/ai/agents/router.ts` — выбор агента по `context_type`
- Context injection: проект пользователя, история сообщений
**Критерии приёмки:**
- [ ] Router возвращает правильный агент по context_type
- [ ] Agent использует system prompt + tools + контекст
- [ ] История сообщений передаётся в контекст (последние 20)

---

### S02-006: API Route — chat endpoint
**Статус:** [ ]
**Зависимости:** S02-005
**Описание:** Серверный endpoint для AI-чата со streaming.
**Действия:**
- Создать `src/app/api/chat/route.ts` — POST с streaming response
- Auth middleware: проверка JWT
- Parse: message, conversation_id, context_type
- Run agent → stream tokens → save message → log AI call
- Streaming через `ReadableStream` + `TextEncoder`
**Критерии приёмки:**
- [ ] POST `/api/chat` принимает сообщение и стримит ответ
- [ ] Unauthorized запрос → 401
- [ ] Сообщения (user + assistant) сохраняются в `messages`
- [ ] AI-вызов логируется в `ai_logs`

---

### S02-007: Chat UI — интерфейс чата
**Статус:** [ ]
**Зависимости:** S02-006
**Описание:** Полноценный chat interface со streaming.
**Действия:**
- Создать `src/app/(main)/chat/page.tsx` — страница чата
- Создать `src/components/chat/ChatWindow.tsx` — окно сообщений
- Создать `src/components/chat/MessageBubble.tsx` — user/assistant bubbles
- Создать `src/components/chat/ChatInput.tsx` — поле ввода + send button
- Создать `src/components/chat/TypingIndicator.tsx` — индикатор набора
- Streaming: показывать токены по мере получения
- Markdown rendering в ответах AI (react-markdown)
- Auto-scroll к последнему сообщению
**Критерии приёмки:**
- [ ] Сообщения отображаются в стиле дизайн-системы (bubbles)
- [ ] Streaming: текст появляется плавно
- [ ] Markdown рендерится (заголовки, списки, код)
- [ ] Auto-scroll работает
- [ ] Mobile: полноэкранный чат

---

### S02-008: Tool Result Cards
**Статус:** [ ]
**Зависимости:** S02-007
**Описание:** Визуализация structured output от AI tools в чате.
**Действия:**
- Создать `src/components/chat/ToolResultCard.tsx` — универсальный компонент
- Создать `src/components/chat/ICEScoreCard.tsx` — карточка ICE-оценки
- Создать `src/components/chat/IdeaSavedCard.tsx` — подтверждение сохранения идеи
- Inline rendering в потоке сообщений
**Критерии приёмки:**
- [ ] ICE Score отображается с прогресс-барами (impact, confidence, ease)
- [ ] Сохранённая идея показывает карточку с названием + описанием
- [ ] Стиль соответствует дизайн-системе (primary-50 bg, border-left)

---

### S02-009: Context Switcher + этапы
**Статус:** [ ]
**Зависимости:** S02-005, S02-007
**Описание:** Переключение контекста чата между этапами стартапа.
**Действия:**
- Создать `src/components/chat/ContextSwitcher.tsx` — переключатель этапов
- Визуализация: горизонтальные tabs или dropdown
- При переключении: загрузка соответствующего агента + промпта
- Текущий этап подсвечен
**Критерии приёмки:**
- [ ] 5 этапов: Идея, Валидация, БМ, MVP, Питч
- [ ] При переключении контекст чата меняется
- [ ] Текущий этап проекта подсвечен

---

### S02-010: RAG Prototype — минимальный
**Статус:** [ ]
**Зависимости:** S02-001
**Описание:** Загрузить 2–3 документа в pgvector, проверить similarity search.
**Действия:**
- Создать `supabase/migrations/003_knowledge_chunks.sql` — таблица knowledge_chunks с vector(1024)
- Создать `src/lib/ai/rag/loader.ts` — загрузка + chunking markdown
- Создать `src/lib/ai/rag/search.ts` — similarity search
- Загрузить 2 документа (Lean Startup basics, JTBD)
- Интегрировать в агентов: inject top-3 chunks в context
**Критерии приёмки:**
- [ ] 2+ документа загружены и проиндексированы
- [ ] Similarity search возвращает релевантные чанки
- [ ] Чанки инжектируются в контекст AI
- [ ] Качество ответов заметно лучше с RAG

---

### S02-011: AI Observability logging
**Статус:** [ ]
**Зависимости:** S02-006
**Описание:** Логирование всех AI-вызовов для мониторинга.
**Действия:**
- Создать `src/lib/ai/observability.ts` — middleware для логирования
- Записываем: model, prompt_tokens, completion_tokens, latency_ms, error, user_id
- Dashboard-запрос для аналитики: средняя latency, ошибки, использование
**Критерии приёмки:**
- [ ] Каждый вызов GigaChat логируется в `ai_logs`
- [ ] Ошибки записываются с трассировкой
- [ ] SQL-запрос для агрегации работает
