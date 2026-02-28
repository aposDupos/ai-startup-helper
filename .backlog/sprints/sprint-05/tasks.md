# Sprint 05 — Pitch + Gamification (Июль 2026, ~3 недели)

**Цель:** Завершение пути стартапа (питч) + вовлечение через геймификацию.
**Зависимости:** Sprint 03–04 завершены.

---

## Pitch

### S05-001: Миграция — pitch_decks
**Статус:** [ ]
**Зависимости:** S03-001
**Описание:** Таблица для Pitch Deck данных.
**Действия:**
- Создать `supabase/migrations/006_pitch_decks.sql`
- `pitch_decks`: id, project_id, slides (JSONB), template, created_at, updated_at
- RLS policies
**Критерии приёмки:**
- [ ] Миграция применяется
- [ ] RLS: владелец проекта имеет полный доступ

---

### S05-002: Pitch Deck Wizard
**Статус:** [ ]
**Зависимости:** S05-001, S04-001
**Описание:** Step-by-step wizard на отдельной странице.
**Действия:**
- Создать `src/app/(main)/workspace/pitch/page.tsx` — full-page с «← Назад к карте»
- Создать `src/components/workspace/PitchDeckWizard.tsx`
- 10 слайдов: Обложка, Проблема, Решение, Рынок, Продукт, Бизнес-модель, Конкуренты, Юнит-экономика, Команда, Roadmap
- AI генерирует текст для каждого слайда
- BMC данные подтягиваются автоматически (слайд 6)
- Autosave + progress_data обновление
**Критерии приёмки:**
- [ ] 10 шагов wizard
- [ ] AI генерирует контент
- [ ] BMC auto-fill
- [ ] Auto-save

---

### S05-003: Тренажёр питча
**Статус:** [ ]
**Зависимости:** S05-002
**Описание:** AI играет роль инвестора.
**Действия:**
- Создать `src/app/(main)/workspace/pitch/trainer/page.tsx`
- Создать `src/components/workspace/PitchTrainer.tsx`
- Создать `src/components/workspace/PitchFeedback.tsx`
- 5–10 раундов Q&A → фидбэк по 5 критериям
**Критерии приёмки:**
- [ ] AI = инвестор, задаёт вопросы
- [ ] Фидбэк: оценки + рекомендации
- [ ] Результаты сохраняются

---

### S05-004: Экспорт Pitch в PDF
**Статус:** [ ]
**Зависимости:** S05-002
**Описание:** PDF Pitch Deck.
**Действия:**
- Создать `src/lib/export/pitch-pdf.ts`
- API route: `src/app/api/export/pitch/route.ts`
**Критерии приёмки:**
- [ ] PDF с 10 слайдами, визуально привлекательный

---

## Gamification

### S05-005: Миграция — gamification
**Статус:** [ ]
**Зависимости:** S03-001
**Описание:** Таблицы для XP, уровней, достижений, стриков.
**Действия:**
- Создать `supabase/migrations/007_gamification.sql`
- Таблицы: achievements, user_achievements, xp_transactions, levels, challenges, user_challenges
- Seed data: 5 levels, 15+ achievements
- RLS policies
**Критерии приёмки:**
- [ ] Таблицы + seed data
- [ ] RLS: пользователь видит свой прогресс

---

### S05-006: XP + Levels
**Статус:** [ ]
**Зависимости:** S05-005
**Описание:** Начисление XP, проверка level up.
**Действия:**
- Создать `src/lib/gamification/xp.ts` — awardXP(userId, amount, source)
- Toast «+30 XP» с анимацией
- Level up модалка
**Критерии приёмки:**
- [ ] XP начисляется
- [ ] Level повышается при достижении порога
- [ ] Toast + модалка при level up

---

### S05-007: Badges
**Статус:** [ ]
**Зависимости:** S05-006
**Описание:** 15+ достижений.
**Действия:**
- Создать `src/lib/gamification/achievements.ts`
- Создать `src/components/gamification/AchievementGrid.tsx`
- Создать `src/components/gamification/AchievementUnlockedModal.tsx`
**Критерии приёмки:**
- [ ] Бейджи: unlocked цветные, locked серые
- [ ] Модалка «Достижение получено!»

---

### S05-008: Стрики + Лидерборд
**Статус:** [ ]
**Зависимости:** S05-006
**Описание:** Стрики + топ пользователей.
**Действия:**
- Создать `src/lib/gamification/streaks.ts`
- Создать `src/app/(main)/leaderboard/page.tsx`
- Создать `src/components/gamification/StreakFlame.tsx`
- Создать `src/components/gamification/LeaderboardTable.tsx`
**Критерии приёмки:**
- [ ] Стрик увеличивается ежедневно
- [ ] Бонус XP на milestone (7, 14, 30 дней)
- [ ] Лидерборд с топ 100

---

## RAG

### S05-009: Полный RAG pipeline
**Статус:** [ ]
**Зависимости:** S02-010
**Описание:** 10+ документов базы знаний для AI.
**Действия:**
- Создать `content/knowledge/*.md` — 10 документов
- Обновить loader + search (chunking, reranking)
- Создать `scripts/seed-knowledge.ts`
- Интегрировать RAG во все AI-агенты
**Критерии приёмки:**
- [ ] 10+ документов проиндексированы
- [ ] Качество AI ответов заметно выше
