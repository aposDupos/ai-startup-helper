# Карта базы данных StartupCopilot

> Supabase PostgreSQL + pgvector

## Миграции (18 файлов)

| # | Файл | Таблицы |
|---|------|---------|
| 001 | `001_profiles_projects.sql` | `profiles`, `projects` |
| 002 | `002_conversations_messages.sql` | `conversations`, `messages`, `ai_logs` |
| 003 | `003_knowledge_chunks.sql` | `knowledge_chunks` (vector 1024) |
| 004 | `004_stage_checklists.sql` | `stage_checklists` |
| 005 | `005_lessons.sql` | `lessons`, `user_lesson_progress` |
| 006 | `006_pitch_decks.sql` | `pitch_decks` |
| 007-011 | gamification migrations | `achievements`, `user_achievements`, `xp_transactions`, `levels`, `challenges`, `user_challenges` |
| 012 | `012_lesson_types.sql` | ALTER `lessons` (type, estimated_minutes) |
| 013 | `013_scorecard.sql` | ALTER `projects` (scorecard), `scorecard_history` |
| 015 | `015_social.sql` | `review_requests`, `reviews`, `project_reactions` |
| 017 | `017_teams_social.sql` | `discussions`, `discussion_replies`, `discussion_votes`, `study_groups`, `study_group_members`, seed challenges |
| 018 | `018_daily_quests.sql` | `daily_quests`, `streak_freezes` |

## Ключевые таблицы

### profiles
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (FK auth.users) | PK |
| role | TEXT | школьник / студент |
| display_name | TEXT | Имя |
| xp | INT | Текущий XP |
| level | INT | Текущий уровень |
| streak_count | INT | Дни подряд |
| streak_last_active | DATE | Последняя активность |
| onboarding_completed | BOOL | Онбординг пройден |
| skills | TEXT[] | Навыки |
| looking_for_cofounder | BOOL | Ищет со-основателя |
| bio | TEXT | О себе |

### projects
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | PK |
| owner_id | UUID (FK profiles) | Владелец |
| title | TEXT | Название |
| stage | TEXT | idea/validation/bmc/mvp/pitch |
| progress_data | JSONB | Прогресс по стадиям |
| bmc_data | JSONB | BMC блоки |
| vpc_data | JSONB | VPC данные |
| unit_economics | JSONB | Юнит-экономика |
| scorecard | JSONB | Текущие оценки |
| is_public | BOOL | Опубликован в галерее |
| is_active | BOOL | Активный проект |
| team_members | JSONB | Команда |

### RLS Policies
- Каждый пользователь видит/редактирует только свои profiles и projects
- Public проекты (is_public=true) доступны authenticated пользователям
- ai_logs доступны только admin
- achievements/lessons видны всем, прогресс — только свой
