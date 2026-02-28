# Research Findings

**Generated:** 2026-02-28

---

## 1. Competitive Landscape

### 1.1 International AI Startup Builder Tools

| Tool | Model | Strengths | Gaps |
|------|-------|-----------|------|
| **LeanPivot.ai** | AI tools on Lean Startup framework | Persona creation, pivot analysis, VPC | Not youth-oriented, complex UX |
| **ValidatorAI** | AI idea validation | Quick feedback, simple UI | Only validation, no journey |
| **PitchBob.io** | AI pitch deck & business plan gen | Beautiful decks, financial projections | Document-focused, not educational |
| **PrometAI** | AI business planning | BMC, SWOT, financial models | Corporate tone |
| **Momen.app / Estha** | No-code AI app builders | Visual builders, drag-and-drop | Not startup methodology focused |

### 1.2 Russian Ecosystem

- **Сбер Школьный/Студенческий акселератор** — structured programs, limited capacity (50-100 teams per cohort), no AI assistance
- **ПУТП** (Платформа университетского технологического предпринимательства) — government-backed, grants up to 1M₽
- **«Первое дело»** — online accelerator by Sber + Деловая Среда, linear format, no AI
- **СКОЛКОВО Startup Academy** — premium tier, investment-focused
- **University incubators** (HSE, ITMO, UrFU) — local reach, bureaucratic

### 1.3 Market Gap

No platform exists that combines: **AI-first approach + youth-adapted UX + gamification + 24/7 availability + structured startup methodology**. All existing solutions are either time-bound cohort programs or generic AI tools not designed for young audiences.

---

## 2. Architecture & Tech Stack

### 2.1 Recommended Stack (2026 Best Practices)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | **Next.js 15+** (App Router) | RSC, SSR, streaming, unified full-stack |
| Styling | **Tailwind CSS v4** | Rapid UI development, design tokens |
| Backend | **Supabase** (PostgreSQL + Auth + Edge Functions + Realtime + Storage) | BaaS, pgvector for RAG, RLS for multi-tenancy |
| AI Orchestration | **LangChain / LangGraph** (TypeScript) | Tool calling, stateful agents, chain composition |
| LLM | **OpenAI GPT-4o** / **Claude** API | Quality, function calling, streaming |
| Vector Store | **Supabase pgvector** | Embedding storage for RAG on startup frameworks |
| Analytics | **PostHog** | Open-source, product analytics, feature flags |
| Hosting | **Vercel** | Edge deployment, integrated with Next.js |

### 2.2 AI Agent Architecture

Key patterns for 2026 AI agent platforms:
- **Agentic workflows** (not just chat): Plan → Execute → Verify loops
- **Model Context Protocol (MCP)** for structured tool access
- **Human-in-the-Loop (HITL)** for critical decisions
- **Real-time streaming** via SSE + React Query
- **Persistent memory** via PostgreSQL conversation history + LangGraph checkpointer
- **RAG pipeline** on curated startup frameworks (Lean Startup, BMC, JTBD, etc.)

### 2.3 Gamification DB Schema (PostgreSQL)

Core tables:
- `user_profiles` — xp, level, streak_count, streak_last_active
- `achievements` — definition of all badges/achievements
- `user_achievements` — junction table (user ↔ achievement, earned_at)
- `xp_transactions` — event log of XP gains (source, amount, timestamp)
- `levels` — level definitions with XP thresholds
- `leaderboard_cache` — materialized view, refreshed periodically
- `challenges` — seasonal challenges with start/end dates
- `user_challenges` — user progress on each challenge

Indexing: composite indexes on (user_id, created_at) for XP queries; partial indexes for active streaks.

---

## 3. Target Audience Insights

### 3.1 Attracting School Students (14-18)

**Most effective channels:**
1. **TikTok** — highest engagement for this age group, short-form video content
2. **Telegram bots** — interactive entry point (idea validator bot as teaser)
3. **VK Groups** — targeted ads, community building
4. **School partnerships** — free workshops, teacher ambassadors
5. **Business olympiads** — sponsorship, brand presence

**Content strategy:** Stories of young founders, "startup in 60 seconds" challenges, AI memes, interactive quizzes

### 3.2 Attracting University Students (18-25)

**Most effective channels:**
1. **Telegram channels** — startup/career/grants content
2. **University partnerships** — integration into entrepreneurship programs
3. **Hackathon sponsorship** — prizes as subscriptions
4. **vc.ru / Product Hunt** — launch for product-savvy audience
5. **SEO content** — "Как создать стартап студенту", "Бизнес-идеи 2026"

**Key motivations:** Career prospects, grant access (ПУТП grants up to 1M₽), networking, accelerator preparation

### 3.3 Gamification for Gen Z

Gen Z responds strongest to:
- **Points + Levels** — progress visibility
- **Streaks** — habit formation (Duolingo effect)
- **Leaderboards** — school/university scoped for relevance
- **Timed challenges** — "Startup in 48 hours" creates urgency
- **Collaboration quests** — team-based missions increase social bonding
- **Visual progression** — RPG-style journey maps

---

## 4. Business Model Canvas Tools

### 4.1 Existing Interactive BMC Tools

| Tool | Approach | Limitation |
|------|----------|------------|
| **Canvanizer** | Free online collaborative BMC | No AI assistance |
| **Boardmix** | Unlimited workspace with AI | Not startup-specific |
| **Visual Paradigm** | AI toolkit (SWOT, BMC, pitch) | Enterprise pricing |
| **Context AI** | 4-quadrant value chain visualization | Not for youth |

### 4.2 Our Interactive BMC Implementation

Key requirements:
- Drag-and-drop sticky notes per BMC block
- AI auto-fill suggestions based on idea description
- Guided mode: AI walks through each block with questions
- Export to PDF/image for pitch decks
- Version history for iteration tracking

---

## 5. Legal Considerations

### Working with Minors (14-17)
- **152-ФЗ** (Personal Data): Parental consent required for minors under 14; for 14-17, consent from both minor and parent
- **GDPR compliance** if targeting EU
- **Content moderation**: No financial advice to minors, disclaimers on business recommendations
- **Terms of Service**: Age-appropriate language, parental oversight option
