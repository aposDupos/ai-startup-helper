# Секция 02: AI Core

## Контекст

Ядро платформы StartupCopilot — AI-наставник на базе GigaChat. Эта секция реализует интеграцию через официальный SDK `langchain-gigachat`, чат-интерфейс со streaming, агентную архитектуру с инструментами (tools), минимальный RAG и мониторинг AI-вызовов.

## Требования

1. Интеграция через `langchain-gigachat` (официальный npm-пакет Сбера)
2. AI-чат со streaming-ответами в реальном времени
3. System prompts для каждого этапа стартапа
4. Agent tools (structured output): сохранение идеи, ICE-оценка
5. История сообщений (conversations, messages)
6. Минимальный RAG: загрузка документов, embedding, vector search
7. AI observability: логирование в PostgreSQL
8. Кэширование embedding-результатов

## Зависимости

- **Требует:** section-01-foundation (auth, DB, GigaChat PoC)
- **Блокирует:** section-03, section-04, section-05

## Детали реализации

### 2.1 Инициализация GigaChat через официальный SDK

**Установка:**
```bash
npm install gigachat langchain-gigachat langchain @langchain/core
```

```typescript
// src/lib/ai/config.ts
import { GigaChat } from 'langchain-gigachat'

export const createGigaChatModel = () => new GigaChat({
  credentials: process.env.GIGACHAT_API_KEY,  // Base64(client_id:client_secret)
  model: 'GigaChat-Max',
  scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_B2B',
  streaming: true,
  // SSL: может потребоваться rejectUnauthorized: false
  // или установка сертификата НУЦ Минцифры
})

// Embeddings (для RAG)
import { GigaChatEmbeddings } from 'langchain-gigachat'

export const createEmbeddings = () => new GigaChatEmbeddings({
  credentials: process.env.GIGACHAT_API_KEY,
  scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_B2B',
})
```

> ⚠️ **SSL нюанс:** GigaChat API использует сертификат НУЦ Минцифры. Варианты:
> 1. Установить корневой сертификат НУЦ Минцифры в систему
> 2. `NODE_TLS_REJECT_UNAUTHORIZED=0` (только для dev)
> 3. Кастомный HTTPS-agent с `rejectUnauthorized: false`

### 2.2 Агентная архитектура (LangChain + LangGraph)

Каждый этап стартапа имеет свой агент с уникальным контекстом:

```typescript
// src/lib/ai/agents/base-agent.ts
import { createGigaChatModel } from '../config'
import { StructuredTool } from '@langchain/core/tools'

abstract class StartupAgent {
  abstract systemPrompt: string
  abstract tools: StructuredTool[]
  
  async run(userMessage: string, context: AgentContext): AsyncIterable<string> {
    const model = createGigaChatModel()
    const modelWithTools = model.bindTools(this.tools)
    // 1. Собрать контекст (проект, история, RAG)
    // 2. Построить messages array с system prompt
    // 3. Вызвать modelWithTools.stream() — streaming + function calling
    // 4. LangChain автоматически парсит tool calls
    // 5. Выполнить tools, вернуть результат
  }
}

// Реализации:
class IdeaSearchAgent extends StartupAgent { ... }
class ValidationAgent extends StartupAgent { ... }
class BusinessModelAgent extends StartupAgent { ... }
class MVPAgent extends StartupAgent { ... }
class PitchAgent extends StartupAgent { ... }
```

Tools реализуются через `StructuredTool` из LangChain (GigaChat поддерживает function calling):

```typescript
// src/lib/ai/tools/
import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

class SaveIdeaTool extends StructuredTool {
  name = 'save_idea'
  description = 'Сохраняет идею стартапа в проект пользователя'
  schema = z.object({
    title: z.string().describe('Название идеи'),
    description: z.string().describe('Описание идеи'),
  })

// Примеры tools:
// save_idea — сохраняет идею в projects
// evaluate_ice — возвращает ICE score (Impact, Confidence, Ease)
// save_bmc_block — сохраняет блок BMC
// analyze_competitors — анализирует конкурентов по описанию
```

### 2.3 Чат-интерфейс

API Route со streaming:

```typescript
// src/app/api/chat/route.ts
export async function POST(req: Request) {
  // 1. Auth check
  // 2. Parse body: { conversationId, message, stage }
  // 3. Load conversation history
  // 4. Determine agent by stage
  // 5. Stream response via ReadableStream
  // 6. Save messages to DB
  // 7. Log AI call to ai_logs table
}
```

Frontend компонент:

```typescript
// src/components/chat/ChatWindow.tsx
// - Список сообщений с markdown-рендерингом
// - Input с отправкой
// - Streaming-отображение (текст появляется посимвольно)
// - QuickActionCards для structured actions
// - ToolResultCard для отображения ICE, BMC и т.д.
```

### 2.4 Схема БД (миграция 002)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  context_type TEXT CHECK (context_type IN ('idea_search', 'validation', 'bmc', 'mvp', 'pitch', 'general')) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  status TEXT CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user ON conversations(user_id, created_at);
CREATE INDEX idx_ai_logs_user ON ai_logs(user_id, created_at);
```

### 2.5 Минимальный RAG

```typescript
// src/lib/ai/rag/
// pipeline.ts — загрузка документа → chunking → embedding → pgvector
// search.ts — similarity search по запросу пользователя

// Таблица для RAG
// knowledge_documents: id, title, content, chunk_index, embedding VECTOR(N), metadata
```

Миграция `003_rag.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title TEXT NOT NULL,
  document_source TEXT,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding VECTOR(1024), -- размерность уточнить по GigaChat
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
```

### 2.6 System Prompts

```typescript
// src/lib/ai/prompts/
// idea-search.ts — поиск идеи (сократический диалог)
// validation.ts — валидация (CustDev симуляция)
// business-model.ts — BMC + юнит-экономика
// mvp.ts — MVP рекомендации
// pitch.ts — питч подготовка

// Общие правила для всех промптов:
// - Тон: поддерживающий, честный, не навязчивый
// - Адаптация по возрасту (школьник → проще, студент → глубже)
// - Всегда на русском языке
// - Не давать юридических/финансовых рекомендаций как окончательные
```

## Критерии приёмки

- [ ] `langchain-gigachat` подключен и работает (auth, chat, streaming)
- [ ] Function calling через `model.bindTools()` работает
- [ ] AI-чат работает со streaming в реальном времени
- [ ] Переключение между этапами (idea_search → validation → ...) работает
- [ ] Tools: сохранение идеи создаёт запись в `projects`
- [ ] Tools: ICE-оценка возвращает корректный structured JSON
- [ ] История сообщений сохраняется и восстанавливается
- [ ] RAG: загружен минимум 1 документ, similarity search возвращает релевантные chunks
- [ ] AI observability: каждый вызов GigaChat логируется в `ai_logs`
- [ ] SSL-сертификат НУЦ Минцифры настроен
- [ ] Тон AI адаптируется к роли (школьник / студент)

## Файлы для создания/изменения

- `src/lib/ai/config.ts` — Инициализация GigaChat (langchain-gigachat)
- `src/lib/ai/agents/base-agent.ts` — Базовый агент (LangChain)
- `src/lib/ai/agents/idea-search.ts` — Агент поиска идеи
- `src/lib/ai/agents/validation.ts` — Агент валидации
- `src/lib/ai/agents/business-model.ts` — Агент бизнес-модели
- `src/lib/ai/tools/*.ts` — Инструменты агентов
- `src/lib/ai/prompts/*.ts` — System prompts
- `src/lib/ai/rag/pipeline.ts` — RAG pipeline
- `src/lib/ai/rag/search.ts` — Similarity search
- `src/app/api/chat/route.ts` — Chat API route
- `src/components/chat/ChatWindow.tsx` — Чат-компонент
- `src/components/chat/MessageBubble.tsx` — Сообщение
- `src/components/chat/QuickActionCard.tsx` — Быстрые действия
- `src/components/chat/ToolResultCard.tsx` — Результат tools
- `supabase/migrations/002_conversations.sql` — Чат и логи
- `supabase/migrations/003_rag.sql` — RAG таблицы
