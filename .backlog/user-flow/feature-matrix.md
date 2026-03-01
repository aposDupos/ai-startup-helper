# Матрица функций по спринтам

> Что было сделано в каждом спринте

| Спринт | Фокус | Ключевые фичи | Страницы |
|--------|-------|----------------|----------|
| **S01** | Foundation | Auth, Landing, Onboarding, Dashboard, Sidebar, Supabase, GigaChat PoC, CI/CD | `/`, `/login`, `/register`, `/onboarding`, `/dashboard` |
| **S02** | AI Core | GigaChat config, Chat streaming, Tool calling (save_idea, evaluate_ice), RAG, Chat UI, Observability | `/chat`, `/api/chat` |
| **S03** | Guided Journey | Journey Map, Stage Cards, Checklists, Entry Points, Contextual Chat, Team Section | Dashboard обновлён |
| **S04** | Workspace + Learning | BMC Canvas, VPC Canvas, Unit Economics, PDF Export, Lessons DB, 10 уроков, InlineLesson, QuizWidget | `/workspace/bmc`, `/workspace/vpc`, `/workspace/unit-economics` |
| **S05** | Pitch + Gamification | Pitch Deck Wizard, Pitch Trainer, PDF Export, XP/Levels/Achievements/Streaks, Leaderboard, Full RAG | `/workspace/pitch`, `/workspace/pitch/trainer`, `/gamification` |
| **S06** | Critical Fixes | Progress tracking, Entry points (chat context), Navigation fix, ContextSwitcher → StageBadge | Багфиксы |
| **S07** | Gamification Wiring | Streaks → layout, XP → все действия, Achievements auto-check, XP Toast, GamificationContext | Интеграция |
| **S08** | Learning & Navigation | Learning overview page, Lesson types (micro/full), MicroLessonCard, Full lesson page | `/learning`, `/learning/[id]` |
| **S09** | Smart Chat | Auto-routing AI, Entry "есть идея" (create_project), Entry "уже проект" (assessment), Entry "учиться" (redirect) | Обновления Chat |
| **S10** | Celebrations | Level Up Modal (confetti), Achievement Modal, Stage Completion celebration, AI proactive welcome | Модалки |
| **S11** | Lesson Personalization | Template variables, AI lesson suggestion в чате (suggest_lesson tool), Contextual quiz | Персонализация |
| **S12** | AI Tools | CustDev Simulator (AI=клиент), Startup Scorecard (10 критериев, spider chart), Scorecard History | `/workspace/custdev`, Dashboard |
| **S13** | Social: Peer Review | Галерея проектов, Peer Review (запрос + оставить), Reactions & Kudos | `/discover`, `/discover/review/[id]` |
| **S14** | Social: Teams | Co-founder Matching, Startup Challenges, Discussion Feed, Study Groups | `/match`, `/challenges`, `/community`, `/groups` |
| **S15** | Daily Quest & Polish | Daily Quest Engine + UI, Streak Freeze, PWA + Push Notifications, Weekly Progress Report | Dashboard, PWA |

## Итого: 22 страницы, 60+ компонентов

### Компоненты по модулям

| Модуль | Кол-во | Примеры |
|--------|--------|---------|
| `chat/` | 10 | ChatWindow, MessageBubble, ChatInput, StageBadge, ToolResultCard |
| `gamification/` | 11 | XPToast, LevelUpModal, AchievementModal, DailyQuestCard, WeeklyReportCard, StreakFreezeModal |
| `learning/` | 5 | MicroLessonCard, LessonContent, QuizWidget, InlineLesson |
| `project/` | 11 | JourneyMap, StageCard, StageNode, ScorecardRadar, ScorecardHistory, CreateProjectWidget, TeamSection |
| `social/` | 9 | ProjectCard, MatchCard, ChallengeCard, DiscussionPost, ReplyThread, ReviewForm, GroupCard |
| `workspace/` | 10 | BMCCanvas, VPCCanvas, UnitEconomicsCalc, PitchDeckWizard, PitchTrainer, CustDevSimulator |
| `shared/` | 2 | Sidebar, BottomNav |
| `ui/` | 8 | Button, Card, Input, Badge, Dialog, Toast, и т.д. (shadcn/ui) |

### AI Tools (Function Calling)

| Tool | Файл | Описание |
|------|------|----------|
| `save_idea` | `tools/save-idea.ts` | Сохраняет идею в projects |
| `evaluate_ice` | `tools/evaluate-ice.ts` | ICE-оценка (Impact, Confidence, Ease) |
| `create_project` | `tools/create-project.ts` | Создаёт проект из чата |
| `update_project_artifacts` | `tools/update-project-artifacts.ts` | Обновляет артефакты |
| `complete_checklist_item` | `tools/complete-checklist.ts` | Отмечает пункт чеклиста |
| `reopen_stage` | (в complete-checklist) | Переоткрывает стадию |
| `suggest_lesson` | `tools/suggest-lesson.ts` | Рекомендует урок |

### Промпты AI

| Файл | Контекст |
|------|----------|
| `prompts/base.ts` | Общие правила тона |
| `prompts/idea-search.ts` | Поиск идеи |
| `prompts/validation.ts` | Валидация |
| `prompts/business-model.ts` | BMC |
| `prompts/mvp.ts` | MVP |
| `prompts/pitch.ts` | Питчинг |
| `prompts/custdev-simulator.ts` | CustDev (AI=клиент) |
| `prompts/index.ts` | Router + auto-routing |
