# Sprint 07 — Gamification Wiring (~1 нед)

**Цель:** Подключить существующий (но неиспользуемый) код gamification к реальным действиям пользователя.
**Зависимости:** S06 завершён.

---

## S07-001: Подключить стрики
**Статус:** [ ]
**Зависимости:** S06-003
**Описание:** `updateStreak()` существует в `src/lib/gamification/streaks.ts` но нигде не вызывается. Нужно интегрировать в layout.
**Действия:**
- `src/app/(main)/layout.tsx`: вызывать `updateStreak(user.id)` при каждом рендере (SSR)
- Результат `StreakResult` передавать в Sidebar (isNewDay, milestoneReached, streakCount)
- Sidebar показывает 🔥 + streak count рядом с level
- При milestone (3/7/14/30) → показать toast (через client-side hydration)
**Файлы:**
- `src/app/(main)/layout.tsx` — call updateStreak
- `src/components/shared/Sidebar.tsx` — display streak
**Критерии приёмки:**
- [ ] При первом заходе за день streak_count увеличивается на 1
- [ ] Sidebar показывает реальный 🔥 streak count
- [ ] При пропуске дня streak сбрасывается
- [ ] При достижении milestone (3, 7, 14, 30) — XP бонус начисляется

---

## S07-002: Подключить XP к действиям
**Статус:** [ ]
**Зависимости:** —
**Описание:** `awardXP()` не вызывается ни при каких пользовательских действиях. Нужно добавить вызовы.
**Действия:**
- Lesson completion (`src/app/(main)/learning/actions.ts`): +20 XP
- Quiz correct answer: +10 XP
- Checklist item completion (`src/lib/ai/tools/complete-checklist.ts`): +15 XP
- Artifact saved (`src/lib/ai/tools/update-project-artifacts.ts`): +10 XP
- Stage completed (all checklist items): +50 XP
- Pitch training session: +30 XP
**Файлы:**
- `src/app/(main)/learning/actions.ts` — awardXP on lesson complete
- `src/lib/ai/tools/complete-checklist.ts` — awardXP on item complete, +50 on stage complete
- `src/lib/ai/tools/update-project-artifacts.ts` — awardXP on artifact save
- `src/app/(main)/workspace/pitch/trainer/actions.ts` — awardXP on training
**Критерии приёмки:**
- [ ] Завершение урока → +20 XP записано в xp_transactions, profiles.xp обновлён
- [ ] Завершение checklist item → +15 XP
- [ ] Сохранение артефакта через чат → +10 XP
- [ ] Завершение стадии (все items) → +50 XP бонус
- [ ] Level up происходит при достижении порога

---

## S07-003: Подключить Achievements
**Статус:** [ ]
**Зависимости:** S07-002
**Описание:** `checkAchievements()` проверяется только при открытии `/gamification`. Нужно триггерить после каждого значимого действия.
**Действия:**
- Создать `src/lib/gamification/check-after-action.ts` — wrapper: `awardXP()` + `checkAchievements()`
- Заменить прямые вызовы `awardXP()` на этот wrapper
- При новом unlock — возвращать `{ unlocked: Achievement[] }` для показа модалки
**Файлы:**
- `src/lib/gamification/check-after-action.ts` [NEW]
- Все файлы из S07-002 — использовать wrapper вместо прямого awardXP
**Критерии приёмки:**
- [ ] Создание первого проекта → unlock "Первая идея" (first_idea)
- [ ] 3 дня подряд → unlock "Разгон" (streak_3)
- [ ] Прохождение 1 урока → unlock "Первый урок" (lesson_1)
- [ ] Achievement unlock → данные возвращаются для UI показа

---

## S07-004: XP Toast
**Статус:** [ ]
**Зависимости:** S07-002
**Описание:** Анимированный toast при начислении XP.
**Действия:**
- Создать `src/components/gamification/XPToast.tsx` — framer-motion toast: "+20 XP 🎉", slide-in + fade-out
- Создать `src/contexts/GamificationContext.tsx` — React Context для глобального показа XP/achievement events
- Provider в `(main)/layout.tsx`
- При каждом awardXP — dispatch event в context → показать toast
**Файлы:**
- `src/components/gamification/XPToast.tsx` [NEW]
- `src/contexts/GamificationContext.tsx` [NEW]
- `src/app/(main)/layout.tsx` — wrap with GamificationProvider
**Критерии приёмки:**
- [ ] При начислении XP — появляется toast "+N XP" с анимацией
- [ ] Toast автоматически исчезает через 3 секунды
- [ ] Не мешает взаимодействию с интерфейсом
- [ ] При level up — отдельный toast "🎉 Level Up!"
