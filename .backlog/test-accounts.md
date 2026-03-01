# Тестовые аккаунты StartupCopilot

> **Пароль для всех тестовых аккаунтов:** `uqKu$PWNs5`

| # | Email | Имя | Роль | Stage | XP | Lvl | Streak | Score | Public | Проект |
|---|-------|-----|------|-------|----|-----|--------|-------|--------|--------|
| 1 | `tva100702@gmail.com` | Влад | student | validation | 195 | 2 | 2 | 25 | ❌ | Маркетплейс для репетиторов |
| 2 | `testuser2@startupcopilot.com` | Тестовый Юзер | student | business_model | 60 | 1 | 1 | 44 | ✅ | AI-ассистент для студентов |
| 3 | `newbie@startupcopilot.com` | Даша Новичок | student | idea | 15 | 1 | 1 | 22 | ❌ | Доставка домашней еды |
| 4 | `schoolkid@startupcopilot.com` | Артём Школьник | schoolkid | validation | 320 | 3 | 7 | 45 | ✅ | GameCoach — тренер по киберспорту |
| 5 | `mvpbuilder@startupcopilot.com` | Марина MVP | student | mvp | 680 | 4 | 12 | 78 | ✅ | FinTrack — учёт финансов для фрилансеров |
| 6 | `pitchpro@startupcopilot.com` | Макс Питчер | student | pitch | 1200 | 5 | 21 | 91 | ✅ | B2B LeadGen AI — генерация лидов |
| 7 | `explorer@startupcopilot.com` | Лиза Эксплорер | student | — | 0 | 1 | 0 | — | — | Нет проекта |

---

## Что тестировать на каждом

### #3 — Даша Новичок (idea, 15 XP)
- Первые шаги: дашборд с минимальным прогрессом
- Journey Map на стадии «Идея» с 2/4 шагами
- Проект не опубликован → не виден в галерее
- Минимальный scorecard (22/100)

### #4 — Артём Школьник (validation, 320 XP)
- Роль **schoolkid** (16 лет) → проверить что UI корректен
- BMC заполнен полностью, VPC нет
- Проект публичный → виден в `/discover`
- Streak 7 дней

### #5 — Марина MVP (mvp, 680 XP)
- Полный набор: BMC + VPC + Artifacts
- Стадия MVP — все предыдущие этапы пройдены
- Score 78/100 — высокий
- Streak 12 дней, Level 4

### #6 — Макс Питчер (pitch, 1200 XP)
- **Максимальный прогресс** — все 5 стадий пройдены
- Score 91/100 — лидер
- Level 5, Streak 21
- Идеален для тестирования Pitch Deck + Pitch Trainer

### #7 — Лиза Эксплорер (без проекта, 0 XP)
- **Онбординг не пройден** → `/onboarding`
- Нет проекта → дашборд с `CreateProjectWidget`
- Идеальна для тестирования полного flow с нуля
