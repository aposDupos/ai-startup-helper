# Sprint 11 — Lesson Personalization (~1 нед)

**Цель:** Контекстные уроки, адаптированные под проект пользователя.
**Зависимости:** S08 (Learning page + lesson types).

---

## S11-001: Template Variables в уроках
**Статус:** [ ]
**Зависимости:** S08-004
**Описание:** Поддержка шаблонных переменных в JSONB-контенте уроков.
**Действия:**
- Создать утилиту `src/lib/learning/personalize.ts`:
  - Функция `personalizeContent(content: string, context: ProjectContext): string`
  - Заменяет `{{project.title}}`, `{{project.problem}}`, `{{project.target_audience}}`, `{{project.idea}}`
  - Если переменная не заполнена → fallback на generic placeholder ("твой проект")
- Обновить `LessonContent.tsx` — вызывать `personalizeContent` при рендеринге
- Обновить 3-5 уроков: добавить template variables в их JSONB content
**Файлы:**
- `src/lib/learning/personalize.ts` [NEW]
- `src/components/learning/LessonContent.tsx` — use personalizeContent
- `src/app/(main)/learning/actions.ts` — pass project context
**Критерии приёмки:**
- [ ] Урок с `{{project.title}}` показывает реальное название проекта
- [ ] Если проекта нет → fallback "твой проект"
- [ ] Минимум 3 урока используют template variables
- [ ] Персонализация работает и в micro, и в full уроках

---

## S11-002: AI-рекомендация урока в чате
**Статус:** [ ]
**Зависимости:** S08-001, S09-001
**Описание:** Когда пользователь затрудняется, AI предлагает конкретный урок.
**Действия:**
- Добавить tool `suggest_lesson` в AI:
  - Параметры: `stage`, `topic`
  - Ищет подходящий урок в БД
  - Возвращает название + deep link `/learning/{lessonId}`
- Обновить промпт: "Если пользователь затрудняется или задаёт базовый вопрос — предложи урок"
- В чате: сообщение с кнопкой-ссылкой на урок
**Файлы:**
- `src/lib/ai/tools/suggest-lesson.ts` [NEW]
- `src/lib/ai/prompts/index.ts` — add lesson suggestion instruction
- `src/components/chat/MessageBubble.tsx` — render lesson link as button
**Критерии приёмки:**
- [ ] Вопрос "что такое CustDev?" → AI объясняет + предлагает урок
- [ ] Ссылка на урок кликабельна и открывает правильную страницу
- [ ] Рекомендация контекстная (основана на стадии проекта)

---

## S11-003: Контекстный квиз
**Статус:** [ ]
**Зависимости:** S11-001
**Описание:** Quiz вопросы привязаны к данным проекта.
**Действия:**
- Новый тип quiz block в JSONB: `contextual_quiz`
  - `question_template`: "Какой главный pain point в проекте «{{project.title}}»?"
  - `answer_source`: "artifacts.problem" — правильный ответ берётся из реальных данных
  - `answer_type`: "open" (свободный ввод, оценивается AI) или "reflection" (нет правильного ответа, для размышления)
- `QuizWidget.tsx` — поддержка нового типа
- Обновить 2-3 урока с contextual quiz
**Файлы:**
- `src/components/learning/QuizWidget.tsx` — contextual_quiz type
- `src/lib/learning/personalize.ts` — personalize quiz questions
**Критерии приёмки:**
- [ ] Quiz показывает вопрос с данными из проекта
- [ ] Reflection-тип: нет правильного ответа, принимает любой
- [ ] Open-тип: сравнивает с реальными данными проекта
- [ ] Без проекта → fallback на generic quiz
