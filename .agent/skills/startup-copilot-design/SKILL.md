---
name: StartupCopilot Design System
description: This skill should be used when implementing UI components, styling pages, creating layouts, or making any visual changes to the StartupCopilot platform. It should be triggered when the user mentions "стиль", "дизайн", "компонент", "UI", "верстка", "цвета", "шрифты", or any work on `.tsx` files with visual elements. Defines the visual identity, design tokens, component patterns, and animation rules for the StartupCopilot platform.
version: 1.0.0
---

# StartupCopilot Design System

Дизайн-система платформы StartupCopilot — AI-наставник для молодых предпринимателей (14–25 лет). Визуальный язык сочетает энергичность и серьёзность, чтобы платформа не выглядела «сделанной ИИ» и при этом вдохновляла молодую аудиторию.

## Философия дизайна

**«Уверенный старт»** — визуальный язык передаёт ощущение начала чего-то серьёзного и при этом захватывающего. Вдохновление: Notion (чистота) + Duolingo (геймификация) + Linear (прем quality) + Figma (яркость).

### Принципы
1. **Чисто, но живо** — чистые layout'ы с точечными акцентами цвета и анимации
2. **Контрастная типографика** — крупные заголовки + мелкий body text создают визуальный ритм
3. **Функциональная красота** — каждый декоративный элемент несёт смысл
4. **Возрастная адаптация** — школьникам ярче и веселее, студентам сдержаннее

## Цветовая палитра

### Не использовать стандартные цвета shadcn/ui! Переопределять все CSS-переменные.

### Основные цвета

```css
:root {
  /* Primary — глубокий индиго (не сберовский зелёный, но уникальный) */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1; /* Main */
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;

  /* Accent — энергичный coral/amber для CTA и gamification */
  --color-accent-400: #FB923C;
  --color-accent-500: #F97316; /* Main */
  --color-accent-600: #EA580C;

  /* Success — для прогресса, достижений */
  --color-success-400: #4ADE80;
  --color-success-500: #22C55E;

  /* Surface — тёплые нейтральные, НЕ чистый серый */
  --color-surface-0: #FFFFFF;
  --color-surface-50: #FAFAF9;   /* Stone-50, тёплый оттенок */
  --color-surface-100: #F5F5F4;
  --color-surface-200: #E7E5E4;
  --color-surface-800: #292524;
  --color-surface-900: #1C1917;
  --color-surface-950: #0C0A09;

  /* Text */
  --color-text-primary: #1C1917;
  --color-text-secondary: #78716C;
  --color-text-tertiary: #A8A29E;
  --color-text-inverse: #FAFAF9;
}
```

### Dark Mode
```css
[data-theme="dark"] {
  --color-surface-0: #0C0A09;
  --color-surface-50: #1C1917;
  --color-surface-100: #292524;
  --color-surface-200: #44403C;
  --color-text-primary: #FAFAF9;
  --color-text-secondary: #A8A29E;
}
```

### Запрещённые цвета
- ❌ Чистый чёрный `#000000` — использовать `surface-950`
- ❌ Чистый белый `#FFFFFF` в больших поверхностях — использовать `surface-50`
- ❌ Стандартный shadcn slate/zinc — использовать stone (тёплый)
- ❌ Сберовский зелёный `#21A038` как primary — это ко-бренд, не основной цвет

## Типографика

### Шрифты

```css
/* Заголовки — геометрический гротеск */
--font-heading: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;

/* Body — нейтральный и читаемый */
--font-body: 'Inter', system-ui, sans-serif;

/* Mono — для кода и метрик */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

Подключение через Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Размеры

| Токен | Размер | Вес | Шрифт | Использование |
|-------|--------|-----|-------|---------------|
| `display` | 48/56px | 800 | Jakarta | Hero заголовки |
| `h1` | 36/40px | 700 | Jakarta | Page headers |
| `h2` | 28/32px | 700 | Jakarta | Section headers |
| `h3` | 22/28px | 600 | Jakarta | Card titles |
| `h4` | 18/24px | 600 | Jakarta | Subsections |
| `body-lg` | 18/28px | 400 | Inter | Lead paragraphs |
| `body` | 16/24px | 400 | Inter | Body text |
| `body-sm` | 14/20px | 400 | Inter | Captions, labels |
| `caption` | 12/16px | 500 | Inter | Badges, metadata |
| `mono` | 14/20px | 400 | JetBrains | Metrics, XP values |

### Правила типографики
- Заголовки: letter-spacing `-0.02em` (плотнее)
- Body: letter-spacing `0` (стандартное)
- Максимальная ширина текстового блока: `65ch`
- Иерархия через SIZE + WEIGHT, не через цвет

## Spacing & Layout

### Spacing Scale
```
4px → 8px → 12px → 16px → 20px → 24px → 32px → 40px → 48px → 64px → 80px → 96px
```

### Layout Grid
- Desktop: 12 columns, max-width `1280px`, gap `24px`, padding `32px`
- Tablet: 8 columns, gap `20px`, padding `24px`
- Mobile: 4 columns, gap `16px`, padding `16px`

### Правила spacing
- Между секциями: `64px` (desktop) / `48px` (mobile)
- Между карточками: `16px`
- Внутри карточки: `20px` padding
- Между label и input: `8px`
- Между параграфами: `16px`

## Border Radius

```css
--radius-sm: 8px;    /* Inputs, small buttons */
--radius-md: 12px;   /* Cards, panels */
--radius-lg: 16px;   /* Modals, large cards */
--radius-xl: 20px;   /* Feature cards, hero blocks */
--radius-full: 9999px; /* Badges, avatars, pills */
```

**НЕ использовать** `rounded-sm` (2px) или `rounded` (4px) — слишком мелко для молодёжной платформы.

## Shadows & Depth

```css
--shadow-xs: 0 1px 2px rgba(28, 25, 23, 0.05);
--shadow-sm: 0 2px 8px rgba(28, 25, 23, 0.06);
--shadow-md: 0 4px 16px rgba(28, 25, 23, 0.08);
--shadow-lg: 0 8px 32px rgba(28, 25, 23, 0.10);
--shadow-glow-primary: 0 0 20px rgba(99, 102, 241, 0.15);
--shadow-glow-accent: 0 0 20px rgba(249, 115, 22, 0.15);
```

- Карточки: `shadow-sm`, при hover → `shadow-md` + translate-y `-2px`
- Модалки: `shadow-lg`
- Active CTA buttons: `shadow-glow-primary`

## Анимации

### Micro-interactions (обязательно)

```css
/* Стандартный transition */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Spring easing для gamification */
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Обязательные animations

| Элемент | Анимация |
|---------|----------|
| Кнопки | `scale(0.97)` при click, `translateY(-1px)` при hover |
| Карточки | `translateY(-2px)` + shadow-md при hover |
| XP Badge | `spring` bounce при получении XP |
| Level Up | `scale(1.2)` → `scale(1)` + glow pulse |
| Streak 🔥 | CSS flame animation (wiggle) |
| Page transitions | `fadeIn` + `translateY(10px)` → `translateY(0)` |
| Skeleton loading | Shimmer gradient animation |
| Toast notifications | `slideInRight` + `fadeOut` |

### Запрещённые паттерны
- ❌ Никаких анимаций дольше 500ms (кроме page transitions)
- ❌ Никаких bouncing скроллов
- ❌ Никаких parallax-эффектов на мобильном
- ❌ `prefers-reduced-motion: reduce` — убирать все animations

## Иконки

Использовать **Lucide Icons** (уже интегрированы с shadcn/ui):
```bash
npm install lucide-react
```

- Размер: 20px (навигация), 16px (inline), 24px (feature icons)
- Stroke width: 1.75 (чуть тоньше default 2)
- Цвет: `text-secondary` (обычные), `text-primary` (active)

## Компонентные правила

### Refer to `references/components.md` for detailed component patterns.

### Ключевые переопределения shadcn/ui
- Все компоненты: заменить стандартные цвета на палитру выше
- Buttons: `radius-sm`, font-weight 600, Plus Jakarta Sans
- Cards: `radius-md`, warm shadow, `surface-0` background
- Inputs: `radius-sm`, 44px height (touch-friendly), border `surface-200`
- Badge: `radius-full`, font `caption`, uppercase tracking `0.05em`

## Анимации (framer-motion)

Для продвинутых анимаций используется **framer-motion** (`npm install framer-motion`).

### Паттерны использования

#### Анимации появления страниц / карточек
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
```

#### Stagger-анимация для списков
```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
```

#### 3D-анимации для Gamification
Использовать `perspective` + `rotateY` / `rotateX` для 3D-эффектов:
```tsx
// Card flip при получении ачивки
<motion.div
  style={{ perspective: 800 }}
  whileHover={{ rotateY: 15, scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>

// XP counter с пружинным bounce
<motion.span
  key={xp}
  initial={{ scale: 1.5, rotateX: -90 }}
  animate={{ scale: 1, rotateX: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
/>

// Level-up celebration с 3D rotation
<motion.div
  animate={{ rotateY: 360, scale: [1, 1.3, 1] }}
  transition={{ duration: 0.8, ease: "easeInOut" }}
/>
```

### Правила
- Длительность: 200–500ms для micro-interactions, до 800ms для 3D celebrations
- Spring damping: 15–25 (bouncy для gamification, 25+ для UI)
- `AnimatePresence` для exit-анимаций при смене маршрутов
- `useReducedMotion()` — отключать 3D и bounce при `prefers-reduced-motion`
- Не анимировать layout-сдвиги > 50px на мобильных

## Gamification UI

- XP числа: `font-mono`, `color-accent-500`, font-weight 500
- Progress bars: gradient from `primary-400` to `primary-600`, `radius-full`, height 8px
- Level badges: circle `48px`, gradient background, `shadow-glow-primary`, **3D hover** (rotateY)
- Achievement cards: subtle gradient border (primary → accent), `radius-lg`, **flip animation** при unlock
- Streak flame: animated emoji 🔥 + counter в `font-mono`, **spring bounce** при увеличении
- Leaderboard: alternating row backgrounds (`surface-0` / `surface-50`)

## Дополнительные ресурсы

### Reference Files

Для детальных паттернов компонентов и примеров:
- **`references/components.md`** — Детальные паттерны UI-компонентов, примеры JSX
