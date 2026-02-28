# Секция 04: Academy + Геймификация

## Контекст

Образовательный модуль и система вовлечения — ключевые retention-инструменты для молодой аудитории. Academy предоставляет структурированное обучение стартап-методологиям, а Gamification Engine поддерживает мотивацию через XP, уровни, бейджи и стрики.

## Требования

1. Модуль уроков с микро-контентом (5–10 мин)
2. Квизы после уроков
3. Адаптивный контент (школьник / студент)
4. XP-система с транзакционным логом
5. Уровни основателя (5 уровней)
6. Бейджи и достижения (15+ штук)
7. Стрики (серии активных дней)
8. Лидерборды (общий, по городу, по учебному заведению)

## Зависимости

- **Требует:** section-01 (auth, profiles), section-02 (AI для адаптивного контента)
- **Блокирует:** section-06

## Детали реализации

### 4.1 Миграция БД (004_academy_gamification.sql)

```sql
-- Модули уроков
CREATE TABLE lesson_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Уроки
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES lesson_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- блоки контента: text, image, code, callout
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  audience TEXT CHECK (audience IN ('all', 'school', 'university')) DEFAULT 'all',
  duration_minutes INT DEFAULT 5,
  xp_reward INT DEFAULT 20,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Прогресс по урокам
CREATE TABLE user_lesson_progress (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  quiz_score INT,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- Достижения
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  xp_reward INT DEFAULT 50,
  category TEXT CHECK (category IN ('milestone', 'activity', 'skill', 'social')),
  criteria JSONB NOT NULL -- {"type": "lesson_count", "value": 5}
);

-- Полученные достижения
CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Транзакции XP
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  source TEXT CHECK (source IN ('lesson', 'quiz', 'stage', 'chat', 'achievement', 'streak', 'challenge')) NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Уровни
CREATE TABLE levels (
  level INT PRIMARY KEY,
  title TEXT NOT NULL,
  min_xp INT NOT NULL,
  icon TEXT
);

INSERT INTO levels (level, title, min_xp, icon) VALUES
  (1, 'Dreamer', 0, '💭'),
  (2, 'Explorer', 100, '🔍'),
  (3, 'Builder', 500, '🔨'),
  (4, 'Launcher', 1500, '🚀'),
  (5, 'Founder', 5000, '👑');

-- Челленджи
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('timed', 'milestone', 'social')),
  criteria JSONB NOT NULL,
  xp_reward INT DEFAULT 100,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_challenges (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'completed', 'failed')) DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- Индексы
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id, created_at);
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_leaderboard ON profiles(xp DESC);

-- RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are public" ON lessons FOR SELECT USING (true);
CREATE POLICY "Users can manage own progress" ON user_lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own XP" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
```

### 4.2 Контент Academy

10 модулей, по 1–3 урока в каждом:

| Модуль | Уроки | Аудитория |
|--------|-------|-----------|
| Что такое стартап | Идея vs бизнес, Типы стартапов | Все |
| Поиск проблемы | JTBD, Pain Points, Brainstorming | Все |
| CustDev | Интервью, Опросы, Анализ результатов | Все |
| Lean Startup | Build-Measure-Learn, MVP, Pivot | Студенты |
| Business Model Canvas | 9 блоков, Как заполнять | Все |
| Юнит-экономика | CAC, LTV, Unit Economics | Студенты |
| Создание MVP | No-code инструменты, Landing page | Все |
| Питчинг | Структура питча, Storytelling | Все |
| Команда | Роли, Поиск со-основателей | Все |
| Финансы и право | ИП vs ООО, Гранты, Налоги | Студенты |

Формат контента (JSONB):
```json
[
  {"type": "heading", "text": "Что такое JTBD?"},
  {"type": "paragraph", "text": "Jobs To Be Done — это фреймворк..."},
  {"type": "callout", "variant": "tip", "text": "Совет: ..."},
  {"type": "image", "url": "/lessons/jtbd-diagram.svg"},
  {"type": "quiz", "question": "...", "options": [...], "correct": 1}
]
```

### 4.3 XP-система

Начисление XP:
| Действие | XP |
|---|---|
| Завершение урока | 20 |
| Правильный квиз (100%) | 10 бонус |
| Переход на новый этап стартапа | 50 |
| Получение бейджа | varies |
| Стрик 7 дней | 30 |
| Стрик 30 дней | 100 |
| Ежедневная активность | 5 |

Логика проверки уровня: при каждом начислении XP → проверка `levels.min_xp` → если повысился → уведомление + бейдж.

### 4.4 Стрики

- Ежедневно: проверка `profiles.streak_last_active`
- Если last_active = вчера → streak_count++
- Если last_active < вчера → streak_count = 1
- При streak = 7, 14, 30, 60, 100 → бонусный XP + бейдж
- Визуализация: огонёк 🔥 + счётчик в header

### 4.5 Лидерборд

3 вкладки:
- **Общий** — топ 100 по XP
- **Мой город** — фильтр по `profiles.city`
- **Моё учреждение** — фильтр по `profiles.school_or_university`

SQL-запрос:
```sql
SELECT display_name, avatar_url, xp, level, city 
FROM profiles 
ORDER BY xp DESC 
LIMIT 100;
```

### 4.6 Начальные достижения (seed data)

```sql
INSERT INTO achievements (slug, title, description, xp_reward, category, criteria) VALUES
  ('first_idea', 'Первая идея', 'Создай свой первый проект', 20, 'milestone', '{"type": "project_count", "value": 1}'),
  ('custdev_master', 'CustDev Master', 'Проведи AI-симуляцию CustDev', 50, 'skill', '{"type": "stage_reached", "value": "validation"}'),
  ('bmc_complete', 'Бизнес-архитектор', 'Заполни все 9 блоков BMC', 50, 'skill', '{"type": "bmc_blocks_filled", "value": 9}'),
  ('lesson_streak_7', 'На волне', '7 дней подряд на платформе', 30, 'activity', '{"type": "streak", "value": 7}'),
  ('lesson_5', 'Прилежный ученик', 'Пройди 5 уроков', 30, 'activity', '{"type": "lesson_count", "value": 5}'),
  ('pitch_ready', 'Pitch Perfect', 'Дойди до этапа Питч', 100, 'milestone', '{"type": "stage_reached", "value": "pitch"}'),
  -- ... ещё 10+ достижений
```

## Критерии приёмки

- [ ] Уроки отображаются по модулям с фильтрацией по аудитории
- [ ] Квизы после уроков работают, результат сохраняется
- [ ] XP начисляется за все действия корректно
- [ ] Уровень повышается автоматически при достижении порога XP
- [ ] Бейджи выдаются при выполнении критериев
- [ ] Стрики считаются корректно, отображается огонёк
- [ ] Лидерборд показывает топ 100, фильтрация работает
- [ ] Контент адаптируется: школьники не видят уроки «Студенты only»

## Файлы для создания/изменения

- `src/app/(main)/academy/page.tsx` — Список модулей
- `src/app/(main)/academy/[lessonId]/page.tsx` — Урок
- `src/app/(main)/leaderboard/page.tsx` — Лидерборд
- `src/components/academy/LessonCard.tsx`
- `src/components/academy/LessonContent.tsx`
- `src/components/academy/QuizWidget.tsx`
- `src/components/gamification/XPBadge.tsx`
- `src/components/gamification/LevelProgress.tsx`
- `src/components/gamification/AchievementGrid.tsx`
- `src/components/gamification/StreakFlame.tsx`
- `src/components/gamification/LeaderboardTable.tsx`
- `src/lib/gamification/xp.ts` — Логика XP
- `src/lib/gamification/achievements.ts` — Проверка достижений
- `src/lib/gamification/streaks.ts` — Логика стриков
- `supabase/migrations/004_academy_gamification.sql`
- `supabase/seed.sql` — Levels, achievements, lessons
