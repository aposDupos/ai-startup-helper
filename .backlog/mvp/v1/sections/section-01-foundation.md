# Секция 01: Фундамент

## Контекст

Первая секция проекта StartupCopilot — AI-платформы Сбера для помощи школьникам и студентам в создании стартапов. Фундамент включает инициализацию проекта, авторизацию, onboarding и критический GigaChat PoC.

## Требования

По завершении этой секции должны быть готовы:
1. Рабочий проект Next.js 15+ с Tailwind CSS v4 и shadcn/ui
2. Supabase проект с начальной схемой БД (profiles, projects)
3. Авторизация (email + VK OAuth) через Supabase Auth
4. Onboarding flow с выбором роли и согласием родителей
5. GigaChat API PoC (подтверждение работоспособности: auth, chat, streaming, embeddings)
6. Landing page (маркетинговая)
7. CI/CD pipeline

## Зависимости

- **Требует:** ничего (первая секция)
- **Блокирует:** все остальные секции

## Детали реализации

### 1.1 Инициализация проекта

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Установка зависимостей:
```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query
npx shadcn@latest init
```

Структура директорий:
```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (main)/dashboard/page.tsx
│   ├── onboarding/page.tsx
│   ├── layout.tsx
│   └── page.tsx              # Landing
├── components/ui/            # shadcn/ui
├── components/shared/
├── lib/supabase/
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server client
│   └── middleware.ts         # Auth middleware
├── hooks/
├── types/
└── styles/
```

### 1.2 Supabase: схема БД

Миграция `001_initial_schema.sql`:

```sql
-- Расширение профилей
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT CHECK (role IN ('student', 'schoolkid')) NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  age INT,
  city TEXT,
  school_or_university TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'basic', 'intermediate')) DEFAULT 'beginner',
  interests TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_count INT DEFAULT 0,
  streak_last_active DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  parent_consent BOOLEAN DEFAULT false,
  parent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Проекты
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT CHECK (stage IN ('idea', 'validation', 'business_model', 'mvp', 'pitch')) DEFAULT 'idea',
  idea_score JSONB,
  bmc_data JSONB,
  vpc_data JSONB,
  pitch_deck_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = owner_id);

-- Trigger для создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Пользователь'), 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 1.3 Авторизация

- Supabase Auth с email + password
- VK OAuth provider (ID.VK)
- Middleware для защиты роутов `(main)/*`
- Redirect неавторизованных на `/login`
- После регистрации → redirect на `/onboarding`

### 1.4 Onboarding Flow

Многошаговый wizard:
1. **Шаг 1:** Выбор роли (школьник / студент)
2. **Шаг 2:** Возраст, город, учебное заведение
3. **Шаг 3:** Если возраст < 18 → экран согласия родителя (ввод email родителя → отправка email для подтверждения)
4. **Шаг 4:** Интересы (мультиселект tags)
5. **Шаг 5:** Уровень опыта (beginner / basic / intermediate)
6. **Шаг 6:** «Есть ли идея стартапа?» (Да → текстовое поле / Нет → skip)
7. **Завершение:** Сохранение в profiles, redirect на `/dashboard`

### 1.5 GigaChat SDK PoC ⚡ BLOCKING

**Цель:** Подтвердить работоспособность официальных SDK до начала разработки AI-модуля.

**Установить:**
```bash
npm install gigachat langchain-gigachat langchain @langchain/core
```

Проверить:
- [ ] Инициализация `GigaChat` из `langchain-gigachat` (credentials, scope, model)
- [ ] SSL: работа с сертификатом НУЦ Минцифры (rejectUnauthorized / установка сертификата)
- [ ] Chat Completion через `model.invoke()`
- [ ] Streaming через `model.stream()`
- [ ] Function calling через `model.bindTools()` + `StructuredTool`
- [ ] Embeddings через `GigaChatEmbeddings`
- [ ] Лимиты: RPM, TPM, max context window
- [ ] Latency: время до первого токена
- [ ] Доступные модели: GigaChat, GigaChat-Pro, GigaChat-Max — сравнение качества

Результат PoC сохранить в `.backlog/mvp/v1/gigachat-poc-results.md`.

### 1.6 Landing Page

Маркетинговая страница с секциями:
- Hero: заголовок + CTA «Начать бесплатно»
- Как это работает (5 шагов)
- Фичи платформы
- Отзывы / социальное доказательство
- FAQ
- Footer

### 1.7 CI/CD

- GitHub Actions: lint, type-check, build on PR
- Vercel preview deployments на каждый PR
- Production deployment из `main` ветки

## Критерии приёмки

- [ ] `npm run dev` запускает проект без ошибок
- [ ] Регистрация email/VK работает, профиль создаётся
- [ ] Onboarding сохраняет данные в `profiles`
- [ ] Для возраста < 18 показывается экран согласия родителя
- [ ] GigaChat PoC: все capability задокументированы
- [ ] Landing page рендерится корректно на десктопе и мобильном
- [ ] CI/CD: PR проходит lint и build

## Файлы для создания/изменения

- `src/app/page.tsx` — Landing page
- `src/app/layout.tsx` — Root layout
- `src/app/(auth)/login/page.tsx` — Логин
- `src/app/(auth)/register/page.tsx` — Регистрация
- `src/app/onboarding/page.tsx` — Onboarding wizard
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/middleware.ts` — Auth middleware
- `supabase/migrations/001_initial_schema.sql` — Начальная схема
- `.github/workflows/ci.yml` — CI pipeline
