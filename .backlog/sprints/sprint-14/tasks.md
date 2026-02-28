# Sprint 14 — Social: Teams & Challenges (~1 нед)

**Цель:** Групповые взаимодействия и командная работа.
**Зависимости:** S13 (Social base).

---

## S14-001: Co-founder Matching
**Статус:** [ ]
**Зависимости:** S13-001
**Описание:** Пользователи заполняют навыки и ищут со-основателей с комплементарными навыками.
**Действия:**
- Миграция: `ALTER TABLE profiles ADD COLUMN skills TEXT[] DEFAULT '{}', ADD COLUMN looking_for_cofounder BOOLEAN DEFAULT false, ADD COLUMN bio TEXT`
- Профиль: навыки (dev, design, marketing, sales, finance, product), роль (technical/business), тайм-зона
- Страница `/match` — карточки людей, ищущих со-основателей
- Алгоритм: комплементарные навыки + совпадение стадии проекта
- Кнопка "Написать" → открывает чат/email
**Файлы:**
- `supabase/migrations/015_teams.sql` [NEW]
- `src/app/(main)/match/page.tsx` [NEW]
- `src/components/social/MatchCard.tsx` [NEW]
- `src/lib/matching/algorithm.ts` [NEW]
**Критерии приёмки:**
- [ ] Профиль: можно указать навыки и включить "ищу со-основателя"
- [ ] `/match` — карточки с навыками, проектом, стадией
- [ ] Комплементарность: dev видит маркетологов, и наоборот
- [ ] Кнопка связи работает

---

## S14-002: Startup Challenges (недельные)
**Статус:** [ ]
**Зависимости:** S07-002 (XP)
**Описание:** Общие челленджи для всех пользователей.
**Действия:**
- Использовать существующие таблицы `challenges` + `user_challenges` из миграции 009
- Seed data: 5 челленджей (заполни BMC за 7 дней, пройди 3 урока за неделю, проведи AI CustDev, и т.д.)
- Страница `/challenges` — активные челленджи с прогрессом
- Dashboard: карточка текущего челленджа
- Топ-3 участника → бонус XP + эксклюзивный бейдж
**Файлы:**
- `src/app/(main)/challenges/page.tsx` [NEW]
- `src/components/social/ChallengeCard.tsx` [NEW]
- `supabase/migrations/015_teams.sql` — seed challenges
**Критерии приёмки:**
- [ ] Страница с активными челленджами
- [ ] Можно присоединиться к челленджу
- [ ] Прогресс отслеживается автоматически
- [ ] Топ-3 получают бонус XP

---

## S14-003: Discussion Feed
**Статус:** [ ]
**Зависимости:** S13-001
**Описание:** Лента обсуждений по стадиям.
**Действия:**
- Таблица `discussions`: id, author_id, stage, title, body, upvotes, created_at
- Таблица `discussion_replies`: id, discussion_id, author_id, body, created_at
- Таблица `discussion_votes`: user_id, discussion_id (unique)
- Страница `/community` — лента постов с фильтром по стадии
- Upvote/downvote + reply count
- AI может отвечать (optional toggle)
**Файлы:**
- `supabase/migrations/015_teams.sql` — discussions tables
- `src/app/(main)/community/page.tsx` [NEW]
- `src/components/social/DiscussionPost.tsx` [NEW]
- `src/components/social/ReplyThread.tsx` [NEW]
**Критерии приёмки:**
- [ ] Можно создать пост с привязкой к стадии
- [ ] Upvote работает (1 на пост от пользователя)
- [ ] Replies с thread view
- [ ] Фильтр по стадии

---

## S14-004: Study Groups (Когорты)
**Статус:** [ ]
**Зависимости:** S14-003
**Описание:** Группы по 5-7 человек, проходят стадии вместе.
**Действия:**
- Таблица `study_groups`: id, name, max_members, current_stage, created_at
- Таблица `study_group_members`: group_id, user_id, joined_at
- Создание группы: invite link (UUID-based)
- Страница `/groups` — мои группы + создать/вступить
- Групповой прогресс: средний Score всех участников
- Групповые milestone celebrations (когда вся группа завершает стадию)
**Файлы:**
- `supabase/migrations/015_teams.sql` — study groups tables
- `src/app/(main)/groups/page.tsx` [NEW]
- `src/components/social/GroupCard.tsx` [NEW]
**Критерии приёмки:**
- [ ] Можно создать группу и пригласить по ссылке
- [ ] Max 7 человек в группе
- [ ] Общий прогресс видим всем участникам
- [ ] Групповой чат (или discussion thread)
