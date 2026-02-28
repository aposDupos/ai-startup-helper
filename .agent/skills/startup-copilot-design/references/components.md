# Компонентные паттерны StartupCopilot

Детальные примеры реализации UI-компонентов платформы.

## Кнопки (Button)

### Варианты

```tsx
// Primary — основной CTA
<Button variant="primary" size="lg">
  Начать путь основателя
</Button>

// CSS:
// bg: linear-gradient(135deg, primary-500, primary-600)
// color: white
// font: Jakarta Sans 600
// padding: 12px 24px
// radius: 8px
// hover: shadow-glow-primary + translateY(-1px)
// active: scale(0.97)

// Secondary — второстепенные действия
// bg: surface-100, color: text-primary
// hover: surface-200

// Ghost — минимальный
// bg: transparent, color: primary-500
// hover: primary-50 background

// Accent — gamification CTA (получить XP, пройти квиз)
// bg: linear-gradient(135deg, accent-400, accent-500)
// color: white
// hover: shadow-glow-accent
```

### Sizes
- `sm`: h-32px, text-13px, px-12px
- `md`: h-40px, text-14px, px-16px (default)
- `lg`: h-48px, text-16px, px-24px
- `xl`: h-56px, text-18px, px-32px (hero buttons)

### Icon Buttons
- Иконка слева: gap 8px между иконкой и текстом
- Иконка справа: `→` для навигации
- Icon-only: квадратная, padding равный со всех сторон

## Карточки (Card)

### Base Card
```tsx
// Структура:
<div className="card">
  <div className="card-header">{/* title + badge */}</div>
  <div className="card-body">{/* content */}</div>
  <div className="card-footer">{/* actions */}</div>
</div>

// CSS:
// bg: surface-0
// border: 1px solid surface-200
// radius: 12px
// padding: 20px
// shadow: shadow-sm
// hover: shadow-md + translateY(-2px) + transition-base
```

### Quest Card (Dashboard)
```
┌─────────────────────────────────────┐
│ 🎯 Текущий квест                   │
│                                     │
│ Проведи CustDev с 3 пользователями │
│ ████████████░░░░ 2/3                │
│                                     │
│ [Продолжить →]          +30 XP     │
└─────────────────────────────────────┘
```
- Левый border: 4px solid `primary-500` (или `accent-500` для urgent)
- Progress bar: height 6px, radius-full, gradient primary
- XP reward: `font-mono`, `accent-500`

### Stage Progress Card
```
┌──────────────────────────────────────────────────┐
│  💡 ──── ✓ ──── 🔍 ──── ● ──── 📊 ──── ⚡ ──── 🎤 │
│  Идея    Валидация    БМ        MVP       Питч   │
│                       ↑ Вы здесь                  │
└──────────────────────────────────────────────────┘
```
- Completed stages: `primary-500` filled circle + check
- Current: `primary-500` pulsing ring animation
- Future: `surface-300` outline circle
- Connecting line: 2px solid, colored/gray

### Achievement Card
```
┌─────────────────────┐
│     🏆              │
│  Первая идея        │
│  Создай проект      │
│                     │
│  +20 XP             │
│  ▓▓▓░░ locked       │
└─────────────────────┘
```
- Unlocked: full color, subtle glow
- Locked: grayscale filter + opacity 0.5
- Just earned: spring animation + confetti particles

## Chat Interface

### Message Bubble — User
```
// Align: right
// bg: primary-500
// color: white
// radius: 12px 12px 4px 12px (tail bottom-right)
// max-width: 75%
// padding: 12px 16px
```

### Message Bubble — Assistant
```
// Align: left
// bg: surface-100
// color: text-primary
// radius: 12px 12px 12px 4px (tail bottom-left)
// max-width: 85%
// padding: 12px 16px
// Avatar: 32px circle with gradient, left-side
```

### Typing Indicator
```
// 3 dots bouncing with staggered animation
// bg: surface-100
// dot color: surface-400
// animation: bounce 1.4s infinite
```

### Tool Result Cards (inline in chat)
```tsx
// Structured output rendered as cards inside AI responses
// ICE Score:
┌──────────────────────────────┐
│ 📊 ICE-оценка вашей идеи     │
│                               │
│  Impact:     ████████░░ 8/10  │
│  Confidence: ██████░░░░ 6/10  │
│  Ease:       █████████░ 9/10  │
│                               │
│  Итого: 7.7 — Сильная идея!  │
└──────────────────────────────┘
// border-left: 4px solid primary-500
// bg: primary-50
// radius: 8px
```

## Navigation

### Desktop Sidebar
```
┌──────────────────┐
│ 🚀 StartupCopilot│
│                  │
│ 📊 Dashboard     │ ← active: bg primary-50, text primary-600, font-weight 600
│ 💬 AI-наставник  │
│ 🛠 Workspace     │
│ 📚 Academy       │
│ 🏆 Лидерборд    │
│                  │
│ ──────────────── │
│                  │
│ 👤 Профиль       │
│ 🔥 7 дней стрик  │
│ ⭐ Lvl 3 Builder │
└──────────────────┘
```
- Width: 240px (collapsible to 64px icon-only)
- Active item: `primary-50` bg + `primary-600` text + left-border 3px
- Icons: Lucide, 20px, stroke 1.75

### Mobile Bottom Nav
```
┌─────────────────────────────────────────┐
│  📊      💬      🛠      📚      👤    │
│ Home    Chat   Work  Academy  Profile   │
└─────────────────────────────────────────┘
```
- Height: 64px + safe-area-inset-bottom
- Active: primary-500 icon + dot indicator, не text color change
- Haptic feedback on tap (navigator.vibrate)

## BMC Canvas

### Сетка Business Model Canvas
```
// Desktop: CSS Grid, gap 2px, bg surface-200 (для линий сетки)
// Каждый блок: bg surface-0, padding 16px
// Заголовок блока: caption size, uppercase, text-secondary, letter-spacing 0.05em
// Sticky notes: 120x80px, bg различных пастельных цветов:
//   - amber-100 (пользовательские)
//   - primary-100 (AI suggestions)
//   - surface-100 (пустые)
// Sticky note font: 13px, Inter
// Hover: slight rotation (±1deg random), shadow-sm
// Drag: opacity 0.8, shadow-md, scale 1.02
```

### AI Suggestion Panel
```
┌────────────────────────────────┐
│ 💡 AI предлагает для           │
│    «Ценностное предложение»:   │
│                                │
│  ┌─ "Круглосуточный доступ..." │
│  │   [+ Добавить]              │
│  ├─ "Персонализированный..."   │
│  │   [+ Добавить]              │
│  └─ "Бесплатный базовый..."    │
│     [+ Добавить]               │
│                                │
│ [Предложить ещё]               │
└────────────────────────────────┘
// bg: primary-50
// border: 1px dashed primary-200
// radius: 12px
```

## Academy / Lessons

### Lesson Card
```
┌─────────────────────────────────┐
│ ┌─────┐                         │
│ │ 📖  │ Что такое JTBD?         │
│ │     │ Jobs To Be Done — фрейм │
│ └─────┘ ⏱ 5 мин  |  🟢 Для всех│
│         ████████░░ 80%           │
│                          +20 XP  │
└─────────────────────────────────┘
```
- Icon container: 48px, `primary-100` bg, `radius-md`
- Duration: `caption` size, `text-secondary`
- Audience tag: `badge` with colored dot

### Quiz Widget
```
┌─────────────────────────────────────┐
│ ❓ Что из перечисленного является    │
│    примером CustDev-интервью?        │
│                                      │
│  ○ Анкета с закрытыми вопросами     │
│  ● Глубинное интервью о проблемах   │ ← selected: primary border + bg
│  ○ Фокус-группа по продукту         │
│  ○ A/B тест landing page            │
│                                      │
│         [Проверить ответ]            │
└─────────────────────────────────────┘
```
- Option hover: `surface-100` bg
- Selected: `primary-50` bg + `primary-500` border
- Correct: `success-50` bg + `success-500` border + ✓
- Wrong: `red-50` bg + `red-500` border + ✗

## Gamification Elements

### XP Toast (при получении XP)
```
┌──────────────────────┐
│  ⭐ +30 XP           │ ← slideInRight, font-mono, accent-500
│  Урок завершён!      │
└──────────────────────┘
// auto-dismiss: 3s
// animation: slideInRight → pause → fadeOut
```

### Level Up Modal
```
┌─────────────────────────────────────┐
│                                     │
│           🎉 УРОВЕНЬ 3!             │
│                                     │
│        ┌──────────────┐             │
│        │  🔨 Builder  │             │ ← spring scale animation
│        └──────────────┘             │
│                                     │
│   Ещё 1000 XP до уровня Launcher   │
│   ████████░░░░░░░░ 500/1500         │
│                                     │
│         [Продолжить 🚀]             │
└─────────────────────────────────────┘
// Confetti particles background
// Badge: 80px circle, gradient primary → accent
// spring animation for badge appearance
```

### Streak Display
```
🔥 7 дней подряд!
// Flame: CSS animation (wiggle 2s infinite)
// Counter: font-mono, 700 weight
// Pulsing glow on milestone streaks (7, 14, 30)
```

## Patterns to Avoid

- ❌ Стандартные shadcn colors (slate/zinc gray) → использовать stone (тёплый)
- ❌ Маленький border-radius (2px, 4px) → минимум 8px
- ❌ Тонкие 1px borders без контраста → усилить или убрать
- ❌ Монотонные серые интерфейсы → добавить accent spots
- ❌ Чисто белые фоны → `surface-50` или subtle gradient
- ❌ Системные шрифты без подключённых fonts → Plus Jakarta Sans + Inter
- ❌ Статичные элементы без hover/active стейтов → всё интерактивное должно реагировать
- ❌ Placeholder изображения → использовать generate_image или Lucide иконки
