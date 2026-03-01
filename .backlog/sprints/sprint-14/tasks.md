# Sprint 14 — Social: Teams & Challenges
**Статус:** [ ]
**Зависимости:** S13 (Social base).

---

## S14-001: Co-founder Matching
**Статус:** [x]
**Зависимости:** S13-001
**Описание:** Пользователи заполняют навыки и ищут со-основателей с комплементарными навыками.
**Действия:**
- Миграция: `ALTER TABLE profiles ADD COLUMN skills TEXT[] DEFAULT '{}', ADD COLUMN looking_for_cofounder BOOLEAN DEFAULT false, ADD COLUMN bio TEXT`
- Профиль: навыки (dev, design, marketing, sales, finance, product), роль (technical/business), тайм-зона
- Страница `/match` — карточки людей, ищущих со-основателей
- Алгоритм: комплементарные навыки + совпадение стадии проекта
- Кнопка "Написать" → открывает чат/email
**Файлы:**
- `supabase/migrations/017_teams_social.sql` [NEW]
- `src/app/(main)/match/page.tsx` [NEW]
- `src/components/social/MatchCard.tsx` [NEW]
- `src/lib/matching/algorithm.ts` [NEW]
**Критерии приёмки:**
- [x] Профиль: можно указать навыки и включить "ищу со-основателя"
- [x] `/match` — карточки с навыками, проектом, стадией
- [x] Комплементарность: dev видит маркетологов, и наоборот
- [x] Кнопка связи работает

---

## S14-002: Startup Challenges (недельные)
**Статус:** [x]
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
- `supabase/migrations/017_teams_social.sql` — seed challenges
**Критерии приёмки:**
- [x] Страница с активными челленджами
- [x] Можно присоединиться к челленджу
- [x] Прогресс отслеживается автоматически
- [x] Топ-3 получают бонус XP

---

## S14-003: Discussion Feed
**Статус:** [x]
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
- `supabase/migrations/017_teams_social.sql` — discussions tables
- `src/app/(main)/community/page.tsx` [NEW]
- `src/components/social/DiscussionPost.tsx` [NEW]
- `src/components/social/ReplyThread.tsx` [NEW]
**Критерии приёмки:**
- [x] Можно создать пост с привязкой к стадии
- [x] Upvote работает (1 на пост от пользователя)
- [x] Replies с thread view
- [x] Фильтр по стадии

---

## S14-004: Study Groups (Когорты)
**Статус:** [x]
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
- `supabase/migrations/017_teams_social.sql` — study groups tables
- `src/app/(main)/groups/page.tsx` [NEW]
- `src/components/social/GroupCard.tsx` [NEW]
**Критерии приёмки:**
- [x] Можно создать группу и пригласить по ссылке
- [x] Max 7 человек в группе
- [x] Общий прогресс видим всем участникам
- [x] Групповой чат (или discussion thread)
