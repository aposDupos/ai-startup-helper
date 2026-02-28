# План имплементации: StartupCopilot

**Версия:** 1.0  
**Дата:** 2026-02-28  
**Дедлайн:** Август 2026 (5–6 месяцев)

---

## 1. Контекст

### Что мы строим
**StartupCopilot** — AI-платформа Сбера, которая помогает школьникам (14–18) и студентам (18–25) создавать стартапы с помощью персонального ИИ-наставника на базе GigaChat. Платформа проводит пользователя от идеи до питча через структурированный путь с геймификацией.

### Почему
Существующие акселераторы Сбера (школьный и студенческий) ограничены по вместимости, привязаны к потокам и не используют AI. Нет 24/7 доступного инструмента, который персонализировано ведёт молодого предпринимателя по всем этапам создания стартапа.

### Ключевые ограничения
- **GigaChat** — обязательная LLM (вместо OpenAI/Claude)
- **Русскоязычный интерфейс** — вся платформа на русском
- **Сберовская экосистема** — потенциальная интеграция с SberID
- **152-ФЗ** — работа с персональными данными несовершеннолетних
- **Дедлайн:** август 2026

---

## 2. Архитектура

### 2.1 Высокоуровневая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                        КЛИЕНТ (Next.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Dashboard │ │ AI Chat  │ │Workspace │ │ Academy  │          │
│  │          │ │(streaming)│ │(BMC,VPC) │ │(уроки)   │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
└───────┼─────────────┼───────────┼─────────────┼─────────────────┘
        │             │           │             │
        ▼             ▼           ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)               │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ Auth     │ │ AI Agent     │ │ CRUD API     │               │
│  │ Middleware│ │ Endpoint     │ │ (проекты,    │               │
│  │          │ │ (streaming)  │ │  уроки, XP)  │               │
│  └────┬─────┘ └──────┬───────┘ └──────┬───────┘               │
└───────┼──────────────┼────────────────┼─────────────────────────┘
        │              │                │
        ▼              ▼                ▼
┌───────────┐  ┌───────────────┐  ┌──────────────┐
│ Supabase  │  │ GigaChat API  │  │ Supabase     │
│ Auth      │  │ + LangChain   │  │ PostgreSQL   │
│ (SberID?) │  │ + RAG         │  │ + pgvector   │
└───────────┘  └───────────────┘  └──────────────┘
```

### 2.2 Стек технологий

| Слой | Технология | Версия |
|------|-----------|--------|
| Frontend | Next.js (App Router) | 15+ |
| UI | Tailwind CSS + shadcn/ui | v4 / latest |
| State | React Query (TanStack Query) | v5 |
| Backend/BaaS | Supabase | latest |
| Auth | Supabase Auth (+ SberID OAuth в будущем) | - |
| LLM | GigaChat API (npm: `gigachat`) | текущая |
| AI SDK | `langchain-gigachat` (официальная интеграция) | latest |
| AI Framework | LangChain.js / LangGraph.js | latest |
| Vector Store | pgvector (через Supabase) | - |
| Хранилище | Supabase Storage | - |
| Аналитика | PostHog | - |
| Хостинг | Vercel / Sber Cloud | - |
| CI/CD | GitHub Actions | - |

### 2.3 Структура базы данных (PostgreSQL / Supabase)

```sql
-- Пользователи (расширение Supabase Auth)
profiles (
  id UUID PK → auth.users,
  role ENUM('student', 'schoolkid'),
  display_name TEXT,
  avatar_url TEXT,
  age INT,
  city TEXT,
  school_or_university TEXT,
  experience_level ENUM('beginner', 'basic', 'intermediate'),
  interests TEXT[], -- теги интересов
  skills TEXT[],
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_count INT DEFAULT 0,
  streak_last_active DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Проекты (стартапы)
projects (
  id UUID PK,
  owner_id UUID FK → profiles,
  title TEXT,
  description TEXT,
  stage ENUM('idea', 'validation', 'business_model', 'mvp', 'pitch'),
  idea_score JSONB, -- ICE-оценка
  bmc_data JSONB, -- Business Model Canvas
  vpc_data JSONB, -- Value Proposition Canvas
  pitch_deck_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Чат с AI (история)
conversations (
  id UUID PK,
  project_id UUID FK → projects,
  user_id UUID FK → profiles,
  context_type ENUM('idea_search', 'validation', 'bmc', 'mvp', 'pitch', 'general'),
  created_at TIMESTAMPTZ
)

messages (
  id UUID PK,
  conversation_id UUID FK → conversations,
  role ENUM('user', 'assistant', 'system'),
  content TEXT,
  metadata JSONB, -- tool calls, structured data
  created_at TIMESTAMPTZ
)

-- Геймификация
achievements (
  id UUID PK,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  icon_url TEXT,
  xp_reward INT,
  category ENUM('milestone', 'activity', 'skill', 'social'),
  criteria JSONB -- условия получения
)

user_achievements (
  user_id UUID FK → profiles,
  achievement_id UUID FK → achievements,
  earned_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, achievement_id)
)

xp_transactions (
  id UUID PK,
  user_id UUID FK → profiles,
  amount INT,
  source ENUM('lesson', 'quiz', 'stage', 'chat', 'achievement', 'streak', 'challenge'),
  source_id UUID, -- ID связанной сущности
  created_at TIMESTAMPTZ
)

levels (
  level INT PK,
  title TEXT, -- Dreamer, Explorer, Builder, Launcher, Founder
  min_xp INT,
  icon_url TEXT
)

-- Обучение
lessons (
  id UUID PK,
  module_id UUID FK,
  title TEXT,
  content JSONB, -- rich content blocks
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  audience ENUM('all', 'school', 'university'),
  duration_minutes INT,
  xp_reward INT,
  order_index INT,
  created_at TIMESTAMPTZ
)

lesson_modules (
  id UUID PK,
  title TEXT,
  description TEXT,
  order_index INT
)

user_lesson_progress (
  user_id UUID FK → profiles,
  lesson_id UUID FK → lessons,
  status ENUM('not_started', 'in_progress', 'completed'),
  quiz_score INT,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
)

-- Челленджи
challenges (
  id UUID PK,
  title TEXT,
  description TEXT,
  type ENUM('timed', 'milestone', 'social'),
  criteria JSONB,
  xp_reward INT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN
)

user_challenges (
  user_id UUID FK → profiles,
  challenge_id UUID FK → challenges,
  progress JSONB,
  status ENUM('active', 'completed', 'failed'),
  joined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
)

-- RAG: база знаний
knowledge_documents (
  id UUID PK,
  title TEXT,
  source TEXT,
  content TEXT,
  embedding VECTOR(1024), -- размерность зависит от модели GigaChat
  metadata JSONB,
  created_at TIMESTAMPTZ
)
```

---

## 3. AI-агент: детальная архитектура

### 3.1 Интеграция с GigaChat (через официальные SDK)

**Используемые npm-пакеты:**

| Пакет | Назначение | Установка |
|-------|-----------|----------|
| `gigachat` | Официальный SDK GigaChat (OAuth, chat, streaming, embeddings, vision) | `npm install gigachat` |
| `langchain-gigachat` | Официальная интеграция GigaChat в LangChain.js / LangGraph.js | `npm install langchain-gigachat` |

> ⚠️ **SSL:** GigaChat API использует сертификат НУЦ Минцифры. Может потребоваться `rejectUnauthorized: false` или установка корневого сертификата.

```typescript
import { GigaChat } from 'langchain-gigachat'

// Инициализация через langchain-gigachat
const model = new GigaChat({
  credentials: process.env.GIGACHAT_API_KEY, // Base64(client_id:client_secret)
  model: 'GigaChat-Max',                    // или GigaChat, GigaChat-Pro
  scope: 'GIGACHAT_API_B2B',                // PERS / B2B / CORP
  streaming: true,
})

// Поддерживает: chat, streaming, function calling, embeddings
// Нет необходимости в кастомной LLM-абстракции — LangChain уже предоставляет
```

### 3.2 Агентные воркфлоу

Каждый этап стартапа — это отдельный «агент» со своими:
- **System Prompt** — роль и контекст этапа
- **Tools** — доступные инструменты (сохранение BMC, генерация ICE и т.д.)
- **RAG Context** — релевантные документы из базы знаний
- **State** — текущее состояние проекта пользователя

```
IdeaSearchAgent     → tools: [generate_ideas, evaluate_ice, save_idea]
ValidationAgent     → tools: [simulate_custdev, analyze_competitors, test_hypothesis]
BusinessModelAgent  → tools: [fill_bmc_block, calculate_unit_economics, save_bmc]
MVPAgent           → tools: [recommend_nocode, generate_user_stories, create_roadmap]
PitchAgent         → tools: [generate_pitch_deck, simulate_investor_qa, feedback]
```

### 3.3 RAG Pipeline

```
Загрузка документа → Chunking (500 tokens) → Embedding (GigaChat/alt) 
→ Сохранение в pgvector → Поиск по similarity при запросе пользователя
→ Вставка in-context → Генерация ответа GigaChat
```

Промодерированная база знаний:
- Lean Startup (Eric Ries)
- Business Model Generation (Osterwalder)
- JTBD (Christensen)
- CustDev (Steve Blank)
- Методики питчинга
- Россия-специфичные гранты, программы, юридика ИП/ООО

### 3.4 Structured Output

Для интерактивных элементов (BMC, ICE оценка) — AI возвращает structured data:

```typescript
// BMC блок
interface BMCResponse {
  block: 'customer_segments' | 'value_proposition' | ... 
  suggestions: string[]
  explanation: string
}

// ICE оценка
interface ICEScore {
  impact: number     // 1-10
  confidence: number // 1-10
  ease: number       // 1-10
  rationale: string
}
```

GigaChat structured output — два подхода:
1. **Function calling** (официально поддерживается через `langchain-gigachat`) — предпочтительный
2. **JSON mode** через system prompt — fallback:
```
Ответь СТРОГО в формате JSON: {"block": "...", "suggestions": [...], "explanation": "..."}
```

---

## 4. Frontend: экраны и компоненты

### 4.1 Навигация

```
/                    → Landing page (маркетинг)
/auth/login          → Авторизация
/auth/register       → Регистрация
/onboarding          → Опрос + выбор роли
/dashboard           → Главный экран (прогресс, квесты, метрики)
/chat                → AI-чат с наставником
/chat/[projectId]    → AI-чат в контексте проекта
/workspace           → Рабочее пространство проекта
/workspace/bmc       → Business Model Canvas
/workspace/pitch     → Pitch Deck Builder
/academy             → Обучение (модули, уроки)
/academy/[lessonId]  → Конкретный урок
/profile             → Профиль пользователя
/leaderboard         → Рейтинги
```

### 4.2 Ключевые компоненты

**Dashboard:**
- StageProgressBar — визуализация прогресса (Идея → Валидация → БМ → MVP → Питч)
- QuestCard — текущие квесты/задания
- XPBadge — уровень + XP прогресс
- StreakCounter — серия активных дней
- RecommendationPanel — AI-рекомендации «что дальше»

**AI Chat:**
- ChatWindow — streaming-сообщения с markdown-рендерингом
- QuickActionCards — предварительные действия (заполнить BMC, оценить идею)
- ToolResultCard — визуализация structured output (таблица ICE, BMC-блок)
- ContextSwitcher — переключение между этапами

**Workspace (BMC):**
- BMCCanvas — 9-блочная сетка с drag-and-drop sticky notes
- BMCSuggestionPanel — AI-подсказки для каждого блока
- BMCExport — экспорт в PDF/изображение

**Academy:**
- LessonCard — карточка урока с прогрессом
- LessonContent — rich text с embedded quizzes
- QuizWidget — интерактивный квиз
- ProgressTracker — прогресс по модулям

**Gamification:**
- LevelProgress — полоса прогресса до следующего уровня
- AchievementGrid — сетка бейджей (полученные / locked)
- LeaderboardTable — таблица рейтингов
- StreakFlame — визуализация стрика

---

## 5. Фазы разработки

### Фаза 1: Фундамент (Март 2026 — 4 недели)
**Цель: работающий скелет с авторизацией и базовым UI + GigaChat PoC**

- [ ] Инициализация проекта (Next.js 15, Tailwind, shadcn/ui)
- [ ] Supabase: проект, схема БД (profiles, projects)
- [ ] Auth: регистрация/логин (email + VK OAuth)
- [ ] Onboarding flow (опрос, выбор роли, сохранение в profiles)
- [ ] **Согласие родителей:** flow для < 18 лет (email-подтверждение от родителя)
- [ ] **GigaChat SDK PoC** ⚡ BLOCKING: установить `gigachat` + `langchain-gigachat`, проверить auth, chat, streaming, function calling, embeddings
- [ ] Landing page (маркетинговая)
- [ ] Базовая навигация и layout
- [ ] CI/CD: GitHub Actions, preview deployments
- [ ] **Параллельно:** начать создание контента для Academy (draft-уроки)

### Фаза 2: AI Core (Апрель 2026 — 4 недели)
**Цель: рабочий AI-чат с GigaChat + минимальный RAG**

- [ ] Интеграция через `langchain-gigachat` (chat, streaming, function calling)
- [ ] Настройка SSL-сертификата НУЦ Минцифры
- [ ] Чат-интерфейс со streaming-ответами
- [ ] System prompts для каждого этапа стартапа
- [ ] История сообщений (conversations, messages)
- [ ] Базовые tools: сохранение идеи, ICE-оценка
- [ ] Контекстное переключение между этапами
- [ ] **RAG Prototype:** загрузка 2–3 документов, embedding, similarity search, in-context injection
- [ ] **AI Observability:** logging AI-вызовов (prompt, response, latency, tokens) в PostgreSQL
- [ ] **Кэширование:** embedding-результатов и RAG-запросов (in-memory / Redis)

### Фаза 3: Workspace + BMC (Май 2026 — 3 недели)
**Цель: интерактивные бизнес-инструменты**

- [ ] Business Model Canvas UI (9 блоков, sticky notes)
- [ ] AI-подсказки для каждого блока BMC
- [ ] Сохранение/загрузка BMC (JSONB в projects)
- [ ] Value Proposition Canvas
- [ ] Юнит-экономика калькулятор
- [ ] Экспорт BMC в PDF
- [ ] Dashboard c прогрессом по стадиям

### Фаза 4: Academy + Gamification (Июнь 2026 — 4 недели)
**Цель: образовательный контент и вовлечение**

- [ ] Модуль уроков: структура, контент, рендеринг
- [ ] Создание контента: 10–15 микро-уроков (Lean Startup, BMC, CustDev, JTBD, Финансы, Право)
- [ ] Квизы после уроков
- [ ] XP-система: начисление, транзакции, уровни
- [ ] Бейджи и достижения
- [ ] Стрики
- [ ] Лидерборды (общий + по городу/вузу)
- [ ] Уведомления (push / email) для стриков и достижений

### Фаза 5: Pitch + RAG (Июль 2026 — 3 недели)
**Цель: полный путь до питча, RAG для качества AI**

- [ ] RAG pipeline: загрузка документов, chunking, embeddings, pgvector
- [ ] Промодерированная база знаний (10+ документов)
- [ ] Pitch Deck генератор (шаблон + AI-заполнение)
- [ ] Тренажёр питча (AI играет инвестора)
- [ ] Экспорт Pitch Deck в PDF/PPTX
- [ ] Интеграция RAG в все AI-agent flows

### Фаза 6: Полировка + Запуск (Август 2026 — 2 недели)
**Цель: готовность к продакшену**

- [ ] End-to-end тестирование полного user flow
- [ ] Оптимизация производительности (Lighthouse > 80)
- [ ] Адаптивность (мобильный веб)
- [ ] Сезонный челлендж к запуску
- [ ] Аналитика (PostHog: events, funnels, retention)
- [ ] Юридика: Terms of Service, Privacy Policy, EULA
- [ ] Согласие родителей для несовершеннолетних
- [ ] Нагрузочное тестирование
- [ ] Production deployment

---

## 6. Приоритизация рисков

### Критический путь
```
Auth → GigaChat интеграция → AI Chat → BMC → Academy → Gamification → Pitch → RAG → Запуск
```

### Что может пойти не так

1. **GigaChat API**: Если API не поддерживает streaming или function calling → придётся реализовывать workarounds. **Действие:** Исследовать API GigaChat в первую неделю.

2. **RAG качество**: Если embedding-модель GigaChat даёт слабые результаты → рассмотреть альтернативные embedding-модели (E5, multilingual-e5-large). **Действие:** prototype RAG в Фазе 2 параллельно с чатом.

3. **Объём контента для Academy**: 10–15 уроков требуют предметной экспертизы. **Действие:** привлечь контент-райтера или use GigaChat для генерации draft-контента.

4. **Дедлайн**: Если что-то из Фазы 4-5 не успевается → Academy можно урезать до 5 уроков, Pitch Deck → до простого шаблона без AI-генерации.

---

## 7. Структура проекта

```
ai-startup-helper/
├── .backlog/                    # Бэклог и планирование
│   └── mvp/v1/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/              # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── chat/
│   │   │   ├── workspace/
│   │   │   ├── academy/
│   │   │   ├── profile/
│   │   │   └── leaderboard/
│   │   ├── onboarding/
│   │   ├── layout.tsx
│   │   └── page.tsx             # Landing
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── chat/                # AI Chat
│   │   ├── workspace/           # BMC, VPC
│   │   ├── academy/             # Lessons, quizzes
│   │   ├── gamification/        # XP, badges, leaderboard
│   │   └── shared/              # Common components
│   ├── lib/
│   │   ├── supabase/            # Supabase client, types
│   │   ├── ai/                  # GigaChat + LangChain agents
│   │   │   ├── config.ts        # GigaChat init (langchain-gigachat)
│   │   │   ├── agents/          # Stage-specific agents (LangGraph)
│   │   │   ├── tools/           # Agent tools (LangChain tools)
│   │   │   ├── prompts/         # System prompts
│   │   │   └── rag/             # RAG pipeline (pgvector + GigaChat embeddings)
│   │   ├── gamification/        # XP, levels, achievements logic
│   │   └── utils/
│   ├── hooks/                   # React hooks
│   ├── types/                   # TypeScript types
│   └── styles/                  # Global styles
├── supabase/
│   ├── migrations/              # DB schema migrations
│   ├── seed.sql                 # Initial data (levels, achievements, lessons)
│   └── functions/               # Edge Functions (если нужны)
├── public/
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 8. Верификация

### Автоматические тесты
- Unit-тесты для AI agent tools (Vitest)
- Integration-тесты для API routes
- E2E-тесты для критических user flows (Playwright)
  - Регистрация → Onboarding → AI Chat → Сохранение идеи
  - Заполнение BMC → Экспорт
  - Прохождение урока → Получение XP → Левел-ап

### Ручная верификация
- GigaChat: качество ответов на бизнес-вопросы
- Onboarding: школьник vs студент → разный контент
- Геймификация: XP начисляется корректно, уровни повышаются
- Мобильная адаптивность: все экраны на 375px
- Производительность: Lighthouse Core Web Vitals
