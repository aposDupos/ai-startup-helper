# Sprint 10 — Celebrations & Feedback (~1 нед)

**Цель:** Визуальная обратная связь — confetti, модалки, AI-приветствие.
**Зависимости:** S07 (gamification wired), S09 (smart chat).

---

## S10-001: Level Up Modal
**Статус:** [ ]
**Зависимости:** S07-004 (GamificationContext)
**Описание:** Полноэкранная модалка при повышении уровня.
**Действия:**
- Создать `src/components/gamification/LevelUpModal.tsx`
- Framer-motion animation: scale-in + confetti effect
- Показать: новый level, иконка, title (из таблицы levels), поздравление
- Кнопка "Продолжить"
- Установить `canvas-confetti` пакет
- Интеграция через GamificationContext: trigger при `leveledUp: true`
**Файлы:**
- `src/components/gamification/LevelUpModal.tsx` [NEW]
- `src/contexts/GamificationContext.tsx` — trigger for level up
**Критерии приёмки:**
- [ ] При переходе на новый уровень — модалка с confetti
- [ ] Показывает новый уровень, иконку и титул
- [ ] Анимация плавная, не раздражающая
- [ ] Закрывается по кнопке "Продолжить"

---

## S10-002: Achievement Unlock Modal
**Статус:** [ ]
**Зависимости:** S07-003
**Описание:** Модалка при получении бейджа.
**Действия:**
- Создать `src/components/gamification/AchievementModal.tsx`
- Показать: иконка бейджа, название, описание, +N XP
- Framer-motion slide-up animation
- Auto-dismiss через 5 секунд или по клику
**Файлы:**
- `src/components/gamification/AchievementModal.tsx` [NEW]
- `src/contexts/GamificationContext.tsx` — trigger for achievement
**Критерии приёмки:**
- [ ] При unlock бейджа — модалка с анимацией
- [ ] Показывает иконку, название, описание, XP reward
- [ ] Auto-dismiss через 5 секунд
- [ ] Несколько бейджей подряд → показываются по очереди

---

## S10-003: Stage Completion Celebration
**Статус:** [ ]
**Зависимости:** S07-002
**Описание:** Confetti + toast при завершении всех пунктов стадии.
**Действия:**
- В `complete-checklist.ts`: при `stageAdvanced: true` — вернуть event
- Journey Map: unlock-анимация следующей стадии (из greyed-out → colorful)
- Confetti burst на Dashboard
- AI отправляет поздравительное сообщение в чат
**Файлы:**
- `src/lib/ai/tools/complete-checklist.ts` — return celebration event
- `src/components/project/JourneyMap.tsx` — unlock animation
- `src/contexts/GamificationContext.tsx` — stage celebration trigger
**Критерии приёмки:**
- [ ] Завершение последнего пункта стадии → confetti
- [ ] Journey Map: следующая стадия анимированно "загорается"
- [ ] +50 XP бонус за завершение стадии

---

## S10-004: AI Проактивное приветствие
**Статус:** [ ]
**Зависимости:** S09-001
**Описание:** AI приветствует пользователя при заходе в чат и проактивно предлагает следующий шаг.
**Действия:**
- При загрузке ChatWindow: автоматическое welcome сообщение
- С проектом: "Привет, {name}! В прошлый раз ты работал над {lastStep}. Продолжим?"
- Без проекта: "Привет, {name}! Давай начнём с создания проекта. С чего хочешь начать?"
- Использовать `project.artifacts` и `progress_data` для контекста
**Файлы:**
- `src/components/chat/ChatWindow.tsx` — auto welcome message
- `src/lib/ai/prompts/index.ts` — welcome prompt template
**Критерии приёмки:**
- [ ] Первый заход в чат → AI приветствует по имени
- [ ] С проектом → предлагает продолжить с последнего шага
- [ ] Без проекта → предлагает создать
- [ ] Приветствие не дублируется при повторном открытии
